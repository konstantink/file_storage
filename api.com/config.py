# coding=utf-8

import os


secret_key = os.environ.get("APIDOTCOM_SECRET_KEY")
if secret_key:
    SECRET_KEY = secret_key
else:
    raise ImportError("Declare variable APIDOTCOM_SECRET_KEY in OS")
    
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

BUCKET_NAME = "kkolesnikov-file-storage"
