import * as React from 'react';
import { Route, Switch } from "react-router-dom";

import './App.css';

import Files from "./containers/Files";
import Upload from "./containers/Upload"

const App = () => {
    return (
        <div className="App">
            <Switch>
                <Route exact path="/" component={Files} />
                <Route exact path="/upload" component={Upload} />
            </Switch>
        </div>
    );
}

export default App;
