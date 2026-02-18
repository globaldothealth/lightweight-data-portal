import { useEffect} from "react";
import {Amplify} from "aws-amplify";
import {generateClient} from "aws-amplify/data";
import "@aws-amplify/ui-react/styles.css";
import {useAuthenticator} from "@aws-amplify/ui-react";
import {Button, Grid} from '@mui/material';

import outputs from "../../../amplify_outputs.json";
import {Schema} from "../../../amplify/data/resource.ts";
import DataDownloads from "../DataDownloads";
import { useAppDispatch } from '../../hooks/redux';
import {getUserProfile} from "../../redux/app/thunk.ts";


const client = generateClient<Schema>({
    authMode: "userPool",
});

export interface UserProfile {
    email: string;
    id: string;
}

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

export default function App() {
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(getUserProfile());
    }, []);


    const {signOut} = useAuthenticator((context) => [context.user]);

    return (
        <>
            <Grid container spacing={2} style={{width: '100%'}}>
                <Grid size={2}>
                    <Button onClick={signOut} variant="contained" color="error" style={{height: '100%', width: '100%'}}>Sign
                        Out</Button>
                </Grid>
                {client && <DataDownloads client={client}/>}
            </Grid>
        </>

    );
}
