# coding=utf-8

import boto3
import logging
import uuid

from boto3.dynamodb.conditions import Attr, Key
from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional


def get_dynamodb():
    return boto3.resource('dynamodb')

log = logging.getLogger("models")


class FileOwnerError(Exception):
    pass


class User(BaseModel):
    username: str
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    disabled: bool=False


class UserInDB(User):
    hashed_password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class StoredFile(BaseModel):
    id: uuid.UUID=Field(default_factory=uuid.uuid4)
    username: str
    path: str
    date_created: Optional[datetime]=Field(default_factory=datetime.utcnow)
    filename: Optional[str]=None
    is_private: Optional[bool]=True
    # shared_url: Optional[str]=None


class StoredFilesList(BaseModel):
    user_files: List[StoredFile]
    shared_files: List[StoredFile]


def get_or_create_user_table():
    dynamodb = get_dynamodb()
    try:
        table = dynamodb.create_table(
            TableName="users",
            KeySchema=[{
                "AttributeName": "username",
                "KeyType": "HASH",
            }],
            AttributeDefinitions=[{
                "AttributeName": "username",
                "AttributeType": "S"
            }],
            ProvisionedThroughput={
                "WriteCapacityUnits": 5,
                "ReadCapacityUnits": 10
            },
        )
        table.meta.client.get_waiter("table_exists").wait(TableName="users")
    except dynamodb.meta.client.exceptions.ResourceInUseException:
        table = dynamodb.Table("users")

    return table


def get_or_create_file_table():
    dynamodb = get_dynamodb()
    try:
        table = dynamodb.create_table(
            TableName="files",
            KeySchema=[{
                "AttributeName": "id",
                "KeyType": "HASH",
            }],
            AttributeDefinitions=[{
                "AttributeName": "id",
                "AttributeType": "S"
            }, {
                "AttributeName": "username",
                "AttributeType": "S",
            }],
            GlobalSecondaryIndexes=[{
                "IndexName": "username",
                "KeySchema": [{
                    "AttributeName": "username",
                    "KeyType": "HASH"
                }],
                "Projection": {
                    "ProjectionType": "ALL",
                },
                "ProvisionedThroughput": {
                    "WriteCapacityUnits": 2,
                    "ReadCapacityUnits": 5
                },
            }],
            ProvisionedThroughput={
                "WriteCapacityUnits": 5,
                "ReadCapacityUnits": 10
            },
        )
    except dynamodb.meta.client.exceptions.ResourceInUseException:
        table = dynamodb.Table("files")

    return table


def get_user(username: str):
    table = get_or_create_user_table()
    user = table.query(KeyConditionExpression=Key("username").eq(username))
    if user.get("Items", []):
        return UserInDB(**user['Items'][0])


def get_files_for_user(username: str):
    table = get_or_create_file_table()
    response = table.query(IndexName="username", KeyConditionExpression=Key("username").eq(username))
    if response.get("Items", []):
        return [StoredFile(**file_dict) for file_dict in response["Items"]]
    return []


def save_user_file(file: StoredFile):
    table = get_or_create_file_table()
    response = table.put_item(Item=file)
    return response


def get_shared_files(username: str):
    table = get_or_create_file_table()
    response = table.scan(FilterExpression=Attr("is_private").eq(False))
    if response.get("Items", []):
        return [StoredFile(**file_dict) for file_dict in response["Items"] if file_dict["username"] != username]
    return []


def toggle_private_flag_on_file(file_id: str, username: str):
    table = get_or_create_file_table()
    response = table.get_item(
        Key={"id": file_id},
    )
    if "Item" in response:
        file = StoredFile(**response["Item"])
        if file.username != username:
            raise FileOwnerError()
        response = table.update_item(
            Key={"id": file_id},
            UpdateExpression="set is_private = :p",
            ExpressionAttributeValues={":p": not file.is_private},
            ReturnValues="ALL_NEW"
        )
        return StoredFile(**response["Attributes"])
