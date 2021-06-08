import * as React from "react";
import { Link } from "react-router-dom";

import File from "./File";
import { StoredFile } from "../types";

interface FilesListProps {
    user_files: Array<StoredFile>;
    shared_files: Array<StoredFile>;
    setPrivate: (f: StoredFile, p: boolean) => Promise<void>;
}

const FilesList = ({ user_files, shared_files , setPrivate}: FilesListProps) => (
    <div className="files-list-container">
        <div className="user-files-list-container">
            <div className="files-list-header" style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <h2 style={{ marginRight: 48 }}>My files ({user_files.length})</h2>
                <Link to="/upload" style={{ fontSize: 12, marginBlockStart: "0.83em", textDecoration: "none" }}>Upload file</Link>
            </div>
            <div className="files-list-inner-container">
                {user_files.map((item, idx) => (
                    <File key={`file-key-${idx}`} {...item} setPrivate={setPrivate}/>
                ))}
            </div>
        </div>
        <div className="shared-files-list-container">
            <div className="files-list-header" style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <h2>Shared files ({shared_files.length})</h2>
            </div>
            <div className="files-list-inner-container">
                {shared_files.map((item, idx) => (
                    <File key={`file-key-${idx}`} {...item} setPrivate={setPrivate}/>
                ))}
            </div>
        </div>
    </div>
);

export default FilesList;