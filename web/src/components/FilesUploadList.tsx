import * as React from "react";

import "../App.css";


interface FileNameProps {
    file: File;
}

interface FilesUploadListProps {
    files: Array<File>;
    progress: any;
}

const FileName = ({ file }: FileNameProps) => (
    <div style={{ maxWidth: "80%"}}>
        <span className="filename">{file.name}</span>
    </div>
)

                // {progress[item.name] && (<ProgressBar key={`progress-${item.name}_${idx}`} progress={progress[item.name].progress} />)}
const FilesUploadList = ({ files, progress }: FilesUploadListProps) => (
    <div className="files-upload-container">
        {files.length === 0 && (<span>No files selected</span>)}
        {files.map((item, idx) => (
            <div key={`wrapper-${item.name}_${idx}`} className="file-wrapper">
                <FileName key={`${item.name}_${idx}`} file={item} />
                <div>
                    {progress[item.name] && (<span>{`${progress[item.name].progress}%`}</span>)}
                </div>
            </div>
        ))}
    </div>
)

export default FilesUploadList;