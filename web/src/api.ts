import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import * as uuid from "uuid";

import { StoredFile, StoredFilesListResponse } from "./types";


interface AxiosInstanceParams {
    version?: string,
}

export interface AuthParams {
    username: string,
    password: string,
}

interface AuthResponse {
    access_token: string;
    token_type: string;
}

interface UserReposponse {
    username: string,
    disabled: boolean,
    first_name: string,
    last_name: string,
}

const SESSION_ID_HEADER = "X-filestorage-Session-Id";
const REQUEST_ID_HEADER = "X-filestorage-Request-Id";

const SESSION_ID = String(uuid.v1());

const getSessionID = () => SESSION_ID;
const getRequestID = () => String(uuid.v1());

const CancelToken = axios.CancelToken;
const source = CancelToken.source();

const getInstance = async (params: AxiosInstanceParams): Promise<AxiosInstance> => {
    const version = params.version ? params.version : 'v1';
    const instance = axios.create({
        baseURL: `http://127.0.0.1:8000/api/${version}`,
        timeout: 60000,
        withCredentials: true,
    })

    instance.interceptors.request.use((config: AxiosRequestConfig): AxiosRequestConfig => {
        Object.assign(config.headers.common, {
            [SESSION_ID_HEADER]: getSessionID(),
            [REQUEST_ID_HEADER]: getRequestID(),

        });

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.authorization = `Bearer ${token}`;   
        }

        return config;
    })

    return instance
}

const axiosInstance = getInstance({});

export const tryLogin = async (params: AuthParams): Promise<AuthResponse> => {
    const instance = await axiosInstance;
    const payloadForm = new FormData();
    payloadForm.append('username', params.username);
    payloadForm.append('password', params.password);

    const response = await instance.post('/u/signin', payloadForm, { cancelToken: source.token })

    return response.data;
}

export const verifyToken = async (token: string): Promise<AxiosResponse<UserReposponse>> => {
    const instance = await axiosInstance;
    const response = await instance.get('/u/whoami', { cancelToken: source.token });
    
    return response.data;
}

export const createAccount = async (params: AuthParams) => {
    const instance = await axiosInstance;

    const response = await instance.post('/u/signup', {
        params: params,
    })

    return response.data;
}

export const getFilesList = async (): Promise<StoredFilesListResponse> => {
    const instance = await axiosInstance;

    const response = await instance.get("/files", { cancelToken: source.token })

    return response.data;
}

export const uploadFile = async (file: File, progressCb: (e: ProgressEvent) => void): Promise<AxiosResponse<void>> => {
    const instance = await axiosInstance;
    const config = {
        onUploadProgress: progressCb,
    };
    const data = new FormData();
    if (file) {
        data.append("file", file, file.name);
    }

    return instance.post<void>("/files/upload", data, config)
}

export const togglePrivateFlag = async (username: string, path: string, fileId: string, flag: boolean): Promise<StoredFile> => {
    const instance = await axiosInstance;
    const response = await instance.patch(`/files/${fileId}`, { username, path, private: flag }, { cancelToken: source.token });

    return response.data;
}

