import axios from "axios";
import * as React from "react";

import "../App.css";
import * as api from "../api";


const SignInForm = () => {
    const [{username, password}, setCredentials] = React.useState<api.AuthParams>({username: "", password: ""});
    const [error, setAuthError] = React.useState<string>('');

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.tryLogin({username, password});
            localStorage.setItem("token", response.access_token);
            window.location.reload();
        } catch(error) {
            console.log(error);
            if (axios.isCancel(error)) {
                console.log("Request canceled", error.message);
            } else if (error.response) {
                setAuthError(error.response.data.detail);
            }
        }
    };
    const usernameRef = React.useRef<HTMLInputElement>(null);
    const passwordRef = React.useRef<HTMLInputElement>(null);

    return (
        <div className="form-container">
            <h4 className="auth-form-title" style={error ? { marginBottom: 15 } : {}}>
                Welcome to FileStorage service
            </h4>
            <form method="submit" onSubmit={onSubmit}>
                {error && (<span className="auth-form-error">
                    {error}
                </span>)}
                <div className="form-control">
                    <label htmlFor="id-input-username">
                        Username
                    </label>
                    <input ref={usernameRef} id="id-input-username" type="text" onChange={() => setCredentials(state => (usernameRef && usernameRef.current ? {...state, username: usernameRef.current.value} : state))}/>
                </div>

                <div className="form-control">
                    <label htmlFor="id-input-password">
                        Password
                    </label>
                    <input ref={passwordRef} id="id-input-password" type="password" onChange={() => setCredentials(state => (passwordRef && passwordRef.current ? {...state, password: passwordRef.current.value} : state))}/>
                </div>

                <button onClick={onSubmit} style={{ marginTop: 16, width: "100%" }}>
                    Log in
                </button>
            </form>
        </div>
    )
}

export default SignInForm;