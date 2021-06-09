# coding=utf-8

import json
import logging

from datetime import datetime
from fastapi import APIRouter, Depends, File, UploadFile, status
from fastapi.exceptions import HTTPException
from typing import Dict

from routers.auth import get_current_active_user
from models import FileOwnerError, StoredFile, StoredFilesList, User, get_files_for_user, get_shared_files,\
    save_user_file, toggle_private_flag_on_file
from storage import get_or_create_bucket


log = logging.getLogger("FilesAPIRouter")

router = APIRouter(
    prefix="/api/v1/files",
    tags=["files"],
    # dependencies=[Depends()]
    # responses={404: {"description": "not found"}},
)


@router.get("/", response_model=StoredFilesList)
async def get_list_of_files(current_user: User=Depends(get_current_active_user)):
    user_files = get_files_for_user(current_user.username)
    shared_files = get_shared_files(current_user.username)
    return {"user_files": user_files, "shared_files": shared_files}


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_files(current_user: User=Depends(get_current_active_user), file: UploadFile=File(...)):
    today = datetime.utcnow().date()
    bucket = get_or_create_bucket()
    key = "uploads/{}/{}/{}/{}/{}".format(current_user.username, today.year, today.month, today.day, file.filename)
    # bucket.put_object(
    #     Body=file.file,
    #     Key=key,
    # )
    file = StoredFile(
        username=current_user.username,
        path=key,
        filename=file.filename
    )

    response = save_user_file(json.loads(file.json()))
    log.warn(response)
    
    return {"file": file.filename}


@router.patch("/{file_id}", status_code=status.HTTP_202_ACCEPTED, response_model=StoredFile)
async def toggle_private_flag(file: StoredFile, file_id: str, current_user: User=Depends(get_current_active_user)):
    try:
        file = toggle_private_flag_on_file(file_id, current_user.username)
    except FileOwnerError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User doesn't own this file"
        )

    log.warn(file)
    if file is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    return file