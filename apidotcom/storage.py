# coding=utf-8

import boto3
import logging

from . config import BUCKET_NAME


def get_s3():
    return boto3.resource("s3", region_name="eu-central-1")

log = logging.getLogger("Storage")

def get_or_create_bucket():
    s3_resource = get_s3()
    try:
        bucket = s3_resource.create_bucket(
            # ACL="authenticated-read",
            Bucket=BUCKET_NAME,
            CreateBucketConfiguration={
                "LocationConstraint": "eu-central-1"
            }
        )
    except (s3_resource.meta.client.exceptions.BucketAlreadyExists,
        s3_resource.meta.client.exceptions.BucketAlreadyOwnedByYou):
        log.warn("Bucket %s already exists", BUCKET_NAME)
        bucket = s3_resource.Bucket(BUCKET_NAME)

    return bucket
