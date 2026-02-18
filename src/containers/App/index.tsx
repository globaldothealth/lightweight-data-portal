import {useEffect} from "react";
import "@aws-amplify/ui-react/styles.css";
import {Button, Grid} from '@mui/material';
import DataDownloads from "../DataDownloads";
import {useAppDispatch} from '../../hooks/redux';
import {getUserProfile, logout} from "../../redux/app/thunk.ts";


export default function App() {
    const dispatch = useAppDispatch();
    
    useEffect(() => {
        dispatch(getUserProfile());
    }, []);

    const handleLogout = () => {
        dispatch(logout())
    }

    return (
        <>
            <Grid container spacing={2} style={{width: '100%'}}>
                <Grid size={10}></Grid>
                <Grid size={2}>
                    <Button onClick={handleLogout} variant="contained" color="error"
                            style={{height: '100%', width: '100%'}}>Sign
                        Out</Button>
                </Grid>
                <DataDownloads/>
            </Grid>
        </>

    );
}
