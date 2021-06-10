# coding=utf-8

import io
import pytest

from fastapi.testclient import TestClient

from .. app import app
from .. models import StoredFile, User
from .. routers import files


client = TestClient(app)


@pytest.fixture
def user():
    return User(username="my_user", disabled=False)


@pytest.fixture
def file():
    return StoredFile(username="my_user", path="/tmp/path")


def get_current_active_user_mock(user):
    return lambda: user


class TestFilesRouter:

    def test_get_list_of_files(self):
        response = client.get("/api/v1/files")
        assert response.status_code == 401
        assert response.json() == {"detail": "Not authenticated"}

    def test_get_list_of_files_authorised(self, mocker, file, user):
        app.dependency_overrides[files.get_current_active_user] = get_current_active_user_mock(user)
        mocker.patch.object(files, "get_files_for_user", return_value=[file])
        mocker.patch.object(files, "get_shared_files", return_value=[])
        response = client.get("/api/v1/files")
        assert response.status_code == 200
        assert len(response.json().get("user_files", [])) == 1
        assert len(response.json().get("shared_files", [])) == 0

    def test_upload_file_authorised(self, mocker, user):
        app.dependency_overrides[files.get_current_active_user] = get_current_active_user_mock(user)
        mocker.patch.object(files, "get_or_create_bucket")
        test_file = io.StringIO("test_file")
        response = client.post("/api/v1/files/upload", files={"file": test_file})
        assert response.status_code == 201
        assert response.json()["file"] == "file"

    def test_toggle_private_flag(self, mocker, file, user):
        def _toggle_private_flag_mock(file_id, username):
            file.is_private = not file.is_private
            return file

        assert file.is_private
        mocker.patch.object(files, "toggle_private_flag_on_file", _toggle_private_flag_mock)
        response = client.patch("/api/v1/files/{}".format(file.id), json={"username": file.username, "path": file.path})
        assert response.status_code == 202
        assert not response.json()["is_private"]

    def test_toggle_private_flag_file_owner_error(self, mocker, file):
        mocker.patch.object(files, "toggle_private_flag_on_file", side_effect=files.FileOwnerError())
        response = client.patch("/api/v1/files/{}".format(file.id), json={"username": file.username, "path": file.path})
        assert response.status_code == 403
        assert response.json()["detail"] == "User doesn't own this file"

    def test_toggle_private_flag_file_not_found(self, mocker, file):
        mocker.patch.object(files, "toggle_private_flag_on_file", return_value=None)
        response = client.patch("/api/v1/files/{}".format(file.id), json={"username": file.username, "path": file.path})
        assert response.status_code == 404
        assert response.json()["detail"] == "File not found"
