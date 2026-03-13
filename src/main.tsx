import React from "react";
import ReactDOM from "react-dom/client";
import {Amplify} from "aws-amplify";
import {Authenticator, View} from "@aws-amplify/ui-react";
import {signInWithRedirect} from "aws-amplify/auth";
import {BrowserRouter} from 'react-router-dom';
import store from './redux/store';
import {Provider} from 'react-redux';
import App from "./containers/App";
import "@aws-amplify/ui-react/styles.css";
import "./index.css";
import GoogleButton from 'react-google-button'
import outputs from "../amplify_outputs.json";
import {Divider, Typography, Grid} from "@mui/material";
import {theme} from './theme/theme';
import {ThemeProvider, StyledEngineProvider} from '@mui/material/styles';


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
    Header() {
        return (
            <View textAlign="center" className='landing-page-header'>
                <Typography variant="h1">
                    The Global.health Data Portal
                </Typography>
                <br/>
                <Typography>
                    The Global.health Data Portal provides access to outbreak data to support researchers, public health teams, and the broader community in understanding and responding to emerging infectious diseases.
                </Typography>
                <Typography>
                     By making structured outbreak data easier to discover and use, the portal helps accelerate research, strengthen preparedness, and support data-driven decision-making during critical moments in global health.
                </Typography>
                <Typography>
                    <strong>Sign in to access the data.</strong>
                </Typography>
            </View>
        );
    },

    Footer() {


        return (
            <View textAlign="center">
                <br/>
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <a href="https://global.health/privacy/">Privacy Policy</a>
                    </Grid>
                    <Grid size={6}>
                        <a href="https://global.health/about/terms-of-use/">Terms of Service</a>
                    </Grid>
                </Grid>
            </View>
        );
    },
    SignIn: {
        Header() {
            return (
                <View className='google-container'>
                    <GoogleButton
                        onClick={() => signInWithRedirect({
                            provider: "Google",
                            options: {
                                prompt: "SELECT_ACCOUNT"
                            }
                        })}
                        style={{width: '100%', marginBottom: '20px'}}
                    />
                    <Divider className='or-divider' sx={{
                        "&::before, &::after": {
                            borderColor: "#89949f",
                        },
                    }}><Typography>or</Typography></Divider>
                </View>
            );
        },
    },
    SignUp: {
        Header() {
            return (
                <View textAlign="center" className='google-container'>
                    <GoogleButton
                        label='Sign up with Google'
                        onClick={() => signInWithRedirect({
                            provider: "Google",
                            options: {
                                prompt: "SELECT_ACCOUNT"
                            }
                        })}
                        style={{width: '100%', marginBottom: '24px'}}
                    />
                    <Divider className='or-divider' sx={{
                        "&::before, &::after": {
                            borderColor: "#89949f",
                        },
                    }} ><Typography>or</Typography></Divider>
                </View>
            );
        },
    },
}

ReactDOM.createRoot(document.getElementById("root") as Element).render(
    <React.StrictMode>
        <BrowserRouter>
            <Provider store={store}>
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={theme}>
                        {/*There is an issue with passing empty array for socialProviders,
                        google auth can sometimes appear despite it being hidden,
                        this is why in index.css federated-sign-in-container display is set to none */}
                        <Authenticator components={components} socialProviders={[]}>
                            <App/>
                        </Authenticator>
                    </ThemeProvider>
                </StyledEngineProvider>
            </Provider>
        </BrowserRouter>
    </React.StrictMode>
);