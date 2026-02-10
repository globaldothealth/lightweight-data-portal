import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Authenticator } from "@aws-amplify/ui-react";
import { signInWithRedirect, type SignInOutput } from 'aws-amplify/auth';



const services = {
    async handleSignIn(input: any){
        if (input.provider === 'Google') {
            return signInWithRedirect({
                provider: 'Google',
                options: {
                    prompt: 'SELECT_ACCOUNT',
                },
            });
        }
        return;
    },
};

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Authenticator socialProviders={['google']} services={services}>
            <App />
        </Authenticator>
    </React.StrictMode>
);