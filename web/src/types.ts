export type FilesActionType = "file_added" | "clear_files" | "load_started" | "load_finished" | "error";
export type FilesAction = {
    type: FilesActionType,
    files?: Array<File>,
};
export type FilesState = {
    files: Array<File>,
    success: boolean,
    uploading: boolean,
};

export type FilesReducer = (s: FilesState, a: FilesAction) => FilesState;

export type ProgressActionType = "progress" | "clear_progress" | "load" | "error";
export type ProgressStatus = "pending" | "done" | "error";
export type ProgressAction = {
    type: ProgressActionType,
    fileName?: string,
    status?: ProgressStatus,
    progress?: number,
}
export type ProgressState = {
    [key: string]: {
        status: ProgressStatus,
        progress: number,
    }
};
export type ProgressReducer = (s: ProgressState, a: ProgressAction) => ProgressState;

export type StoredFile = {
    id: string,
    username: string,
    filename: string,
    is_private: boolean,
    date_created: string,
    shared_url?: string,
    url?: string,
    path: string,
}

export type StoredFilesListResponse = {
    user_files: Array<StoredFile>,
    shared_files: Array<StoredFile>,
}