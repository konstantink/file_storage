import axios from "axios";
import * as React from "react";

import * as api from "../api";
import FilesList from "../components/FilesList";
import SignInForm from "../components/SignInForm";
import { StoredFile, StoredFilesListResponse } from "../types";


const Files = () => {
    const [files, setFiles] = React.useState<StoredFilesListResponse>({user_files: [], shared_files: []});
    const [auth, setAuth] = React.useState<boolean>(true);

    const setPrivate = async (file: StoredFile, flag: boolean) => {
        try {
            const updated_file = await api.togglePrivateFlag(file.username, file.path, file.id, flag);
            setFiles(state => ({...state, user_files: state.user_files.map(item => item.id === file.id ? {...item, is_private: updated_file.is_private} : item)}));
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log("Request canceled", error.message);
            } else if (error.response && error.response.status === 401) {
                console.log('Not authorized');
                window.location.reload();
            } else if (error.response && error.response.status === 403) {
                console.log('Not authorized');
                alert("You're not allowed to change privacy for this file")
            } else {
                alert("Something went wrong, try to reload page");
            }
        }
    };

    React.useEffect(() => {
        (async () => {
            try {
                const data = await api.getFilesList();
                setFiles(data);
            } catch(error) {
                if (axios.isCancel(error)) {
                    console.log("Request canceled", error.message);
                } else if (error.response && error.response.status === 401) {
                    console.log('Not authorized');
                    setAuth(false);
                } else {
                    alert("Something went wrong, try to reload page");
                }
            };
        })();
    }, []);

    return (
        <React.Fragment>
        {auth ? (
            <FilesList {...files} setPrivate={setPrivate} />
        ): (
            <SignInForm />
        )}
        </React.Fragment>
    )
};

export default Files;