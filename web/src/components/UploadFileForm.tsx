import * as React from "react";
import { useHistory } from "react-router-dom";

import Dropzone from "./Dropzone";
import FilesUploadList from "./FilesUploadList";
import { ProgressState } from "../types";

import "../App.css";


interface UploadFileFormProps {
    files: any;
    progress: ProgressState;
    uploadFiles: any;
    onClearFiles: () => void;
    onFileAdded: (a: Array<File>) => void;
}

const UploadFileForm = ({ files, progress, uploadFiles, onClearFiles, onFileAdded }: UploadFileFormProps) => {
    const history = useHistory();

    return (
        <React.Fragment>
            <div className="upload">
                <h3 className="title">Choose files to upload</h3>
                <div className="content">
                    <div>
                        <Dropzone onFileAdded={onFileAdded} />
                    </div>
                    <div className="files">
                        <FilesUploadList files={files.files} progress={progress} />
                    </div>
                </div>
                <div className="actions">
                    <button type="button" disabled={files.files.length === 0} onClick={onClearFiles}>
                        Clear files
                    </button>
                    <button type="button" disabled={files.files.length === 0} onClick={uploadFiles}>
                        Upload
                    </button>
                    <button type="button" onClick={() => history.push("/")}>
                        Cancel
                    </button>
                </div>
            </div>
        </React.Fragment>
    );
};

export default UploadFileForm;