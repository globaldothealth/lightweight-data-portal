import React from "react";
import ReactDOM from "react-dom/client";
import {Authenticator} from "@aws-amplify/ui-react";

import App from "./App.tsx";
import "./index.css";


ReactDOM.createRoot(document.getElementById("root") as Element).render(
    <React.StrictMode>
        <Authenticator socialProviders={['google']}>
            <App/>
        </Authenticator>
    </React.StrictMode>
);