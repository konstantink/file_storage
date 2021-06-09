# coding=utf-8

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth_router, files_router


origins = [
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app = FastAPI()

app.include_router(auth_router)
app.include_router(files_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

