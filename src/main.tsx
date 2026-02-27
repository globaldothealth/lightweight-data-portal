import React from "react";
import ReactDOM from "react-dom/client";
import {Amplify} from "aws-amplify";
import {Authenticator, View} from "@aws-amplify/ui-react";
import {signInWithRedirect} from "aws-amplify/auth";
import {BrowserRouter} from 'react-router-dom';
import store from './redux/store';
import {Provider} from 'react-redux';
import App from "./containers/App";
import "./index.css";
import GoogleButton from 'react-google-button'
import outputs from "../amplify_outputs.json";
import {Divider, Typography} from "@mui/material";


if (import.meta.env.VITE_BUILD_ENV === 'prod') {
    // Custom domain for production Cognito
    Amplify.configure({
        ...outputs,
        auth: {
            ...outputs.auth,
            oauth: {
                ...outputs.auth.oauth,
                domain: 'auth.global.health',
            }
        }
    });
} else {
    Amplify.configure(outputs);
}

const components = {
    SignIn: {
        Header() {
            return (
                <View textAlign="center"
                      style={{marginLeft: '10px', marginRight: '10px', padding: '24px 24px 0px 24px'}}>
                    <GoogleButton
                        onClick={() => signInWithRedirect({
                            provider: "Google",
                            options: {
                                prompt: "SELECT_ACCOUNT"
                            }
                        })}
                        style={{width: 'calc(100%-20px)', marginBottom: '24px'}}
                    />
                    <Divider sx={{
                        "&::before, &::after": {
                            borderColor: "#89949f",
                        },
                    }} style={{color: '#89949f', fontSize: '14px'}}><Typography>or</Typography></Divider>
                </View>
            );
        },
    },
    SignUp: {
        Header() {
            return (
                <View textAlign="center"
                      style={{marginLeft: '10px', marginRight: '10px', padding: '24px 24px 0px 24px'}}>
                    <GoogleButton
                        label='Sign up with Google'
                        onClick={() => signInWithRedirect({
                            provider: "Google",
                            options: {
                                prompt: "SELECT_ACCOUNT"
                            }
                        })}
                        style={{width: 'calc(100%-20px)', marginBottom: '24px'}}
                    />
                    <Divider sx={{
                        "&::before, &::after": {
                            borderColor: "#89949f",
                        },
                    }} style={{color: '#89949f', fontSize: '14px'}}><Typography>or</Typography></Divider>
                </View>
            );
        },
    },
}

ReactDOM.createRoot(document.getElementById("root") as Element).render(
    <React.StrictMode>
        <BrowserRouter>
            <Provider store={store}>
                {/*There is an issue with passing empty array for socialProviders,
                google auth can sometimes appear despite it being hidden,
                this is why in index.css federated-sign-in-container display is set to none */}
                <Authenticator components={components} socialProviders={[]}>
                    <App/>
                </Authenticator>
            </Provider>
        </BrowserRouter>
    </React.StrictMode>
);