import React from "react";
import ReactDOM from "react-dom/client";
import {Authenticator} from "@aws-amplify/ui-react";
import {BrowserRouter} from 'react-router-dom';
import store from './redux/store';
import {Provider} from 'react-redux';
import App from "./containers/App";
import "./index.css";
import {generateClient} from "aws-amplify/api";
import {Schema} from "../amplify/data/resource.ts";
import outputs from "../amplify_outputs.json";
import {Amplify} from "aws-amplify";

Amplify.configure(outputs);

// Custom domain for production Cognito
// Amplify.configure({...outputs,
//     auth: {
//         ...outputs.auth,
//         oauth: {
//             ...outputs.auth.oauth,
//             domain: 'auth.global.health',
//         }
//     }
// });

export const client = generateClient<Schema>({
    authMode: "userPool",
});

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