import * as React from "react";

import { StoredFile } from "../types";

import "../App.css";

export interface FileProps extends StoredFile { 
    setPrivate: (f: StoredFile, p: boolean) => Promise<void>;
};

const File = (props: FileProps) => (
    <div className="file-container">
        <div className="file-header">
            <span className="file-name">{props.filename}</span>
            {props.is_private ? 
                (<img className="lock-icon" alt="private" src="lock_23.svg" onClick={() => props.setPrivate(props, false)} />) 
                : (<img className="lock-icon" alt="private" src="unlock_18.svg" onClick={() => props.setPrivate(props, true)} />)}
        </div>
        <div className="file-details">
            <span>{props.username}</span>
            <span>{new Date(Date.parse(props.date_created)).toDateString()}</span>
        </div>
    </div>
)

export default File;