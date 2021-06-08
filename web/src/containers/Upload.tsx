import axios, { AxiosResponse } from "axios";
import * as React from "react";
import { Redirect, useHistory } from "react-router-dom";

import UploadFileForm from "../components/UploadFileForm";
import * as api from "../api";
import { FilesAction, FilesReducer, FilesState } from "../types";
import { ProgressAction, ProgressReducer, ProgressState } from "../types";


const Upload = () => {
    const [isAuthorized, setAuthorized] = React.useState<boolean>(true);
    const history = useHistory();

    React.useEffect(() => {
        if (localStorage.getItem('token')) {
            api.verifyToken(localStorage.getItem('token'))
                .then(() => setAuthorized(true))
                .catch(error => {
                    if (axios.isCancel(error)) {
                        console.log("Request canceled", error.message);
                    } else if (error.response && error.response.status === 401) {
                        console.log('Not authorized');
                        setAuthorized(false);
                    }
                })
            ;
        } else {
            setAuthorized(false);
        }
    }, []);

    const filesReducer = (state: FilesState, action: FilesAction) => {
        switch (action.type) {
        case 'file_added': 
            return {
                ...state,
                files: action.files ? state.files.concat([...action.files]) : state.files,
            }
        case 'clear_files':
            return {
                ...state,
                files: [],
            }
        case 'load_started':
            return {
                ...state,
                success: false,
                uploading: true,
            }
        case 'load_finished':
            return {
                ...state,
                success: true,
                uploading: false,
            }
        case 'error':
            return {
                ...state,
                success: false,
                uploading: false,
            }
        default:
            return state;
        }
    };
    const [filesToUpload, filesDispatch] = React.useReducer<FilesReducer>(filesReducer, {files: [], success: true, uploading: false})

    const progressReducer = (state: ProgressState, action: ProgressAction) => {
        switch (action.type) {
        case 'progress':
            return {
                ...state,
                [action.fileName]: {
                    status: action.status,
                    progress: action.progress,
                }

            };
        case 'clear_progress':
            return {};
        case 'load':
            return {
                ...state,
                [action.fileName]: {
                    status: action.status,
                    progress: action.progress,
                }
            };
        case 'error':
            return {
                ...state,
                [action.fileName]: {
                    status: action.status,
                    progress: action.progress,
                }
            }
        default:
            return state;
        }
    }
    const [progress, progressDispatch] = React.useReducer<ProgressReducer>(progressReducer, {});

    const onProgress = (file: File) => (pe: ProgressEvent) => {
        progressDispatch({
            type: "progress",
            fileName: file.name,
            progress: Math.round((pe.loaded / pe.total) * 100),
            status: "pending",
        } as ProgressAction)
        if (pe.loaded / pe.total === 1) {
            filesDispatch({
                type: "load_finished",
            });
            progressDispatch({
                type: "progress",
                fileName: file.name,
                progress: 100,
                status: "done",
            } as ProgressAction)
        }
    }

    const uploadFiles = async () => {
        const promises: Array<Promise<AxiosResponse<void>>> = [];
        filesDispatch({type: 'load_started',})
        filesToUpload.files.forEach((item, idx) => {
            promises.push(api.uploadFile(item, onProgress(item)))
        });
        try {
            await Promise.all(promises);
            filesDispatch({type: 'load_finished',});
            history.push("/")
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log("Request canceled", error.message);
            } else if (error.response && error.response.status === 401) {
                console.log('Not authorized');
                setAuthorized(false);
            }
            filesDispatch({type: 'error',});
        }
    };

    const onFileAdded = (files: Array<File>) => {
        filesDispatch({
            type: 'file_added',
            files: files
        });
    }

    const onClear = () => {
        filesDispatch({type: "clear_files"}); 
        progressDispatch({type: "clear_progress"});
    };

    return (
        <React.Fragment>
            {!isAuthorized ? (
                <Redirect to="/" />
            ): (
                <UploadFileForm files={filesToUpload} progress={progress} uploadFiles={uploadFiles} onClearFiles={onClear} onFileAdded={onFileAdded} />
            )}
        </React.Fragment>
    )
};

export default Upload;