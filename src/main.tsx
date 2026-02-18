import React from "react";
import ReactDOM from "react-dom/client";
import {Authenticator} from "@aws-amplify/ui-react";
import {BrowserRouter} from 'react-router-dom';
import store from './redux/store';
import {Provider} from 'react-redux';
import App from "./containers/App";
import "./index.css";


ReactDOM.createRoot(document.getElementById("root") as Element).render(
    <React.StrictMode>
        <BrowserRouter>
            <Provider store={store}>
                <Authenticator socialProviders={['google']}>
                    <App/>
                </Authenticator>
            </Provider>
        </BrowserRouter>
    </React.StrictMode>
);