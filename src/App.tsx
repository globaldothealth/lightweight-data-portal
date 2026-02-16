import {useState, useEffect} from "react";
import {Amplify} from "aws-amplify";
import {fetchUserAttributes, FetchUserAttributesOutput} from 'aws-amplify/auth';
import {generateClient} from "aws-amplify/data";
import {list, getUrl} from 'aws-amplify/storage';
import "@aws-amplify/ui-react/styles.css";
import {useAuthenticator} from "@aws-amplify/ui-react";
import MaterialTable from '@material-table/core';
import {SaveAlt as SaveAltIcon} from '@mui/icons-material';
import {Button, Paper, MenuItem, FormControl, InputLabel, Grid} from '@mui/material';
import Select, {SelectChangeEvent} from '@mui/material/Select';

import outputs from "../amplify_outputs.json";
import {Schema} from "../amplify/data/resource";


const client = generateClient<Schema>({
    authMode: "userPool",
});

interface UserProfile {
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

const availableOutbreaks = [
    'Mpox 2024', 'Avian Influenza'
]


export default function App() {
    const [tableData, setTableData] =
        useState<[{ name: string; filename: string }]>();
    const [userProfile, setUserProfile] = useState<UserProfile>();
    const [selectedOutbreak, setSelectedOutbreak] = useState<string>(availableOutbreaks[0]);

    async function fetchUserProfile() {
        const {email, sub: id}: FetchUserAttributesOutput = await fetchUserAttributes();
        if (!email || !id) {
            console.error("User attributes missing");
            return;
        }
        return {email, id};
    }

    const handleChange = (event: SelectChangeEvent) => {
        setSelectedOutbreak(event.target.value as string);
    };

    async function fetchFiles() {
        const result: any = await list({path: `public/${selectedOutbreak}/`});
        return (result.items.map((file: { path: string }) => ({
            filename: file.path,
            name: file.path.split('/').pop(),
        })).filter((file: { name: string; filename: string }) => file.name !== ''));
    }

    useEffect(() => {
        fetchUserProfile().then((userProfileData: UserProfile | undefined) => userProfileData && setUserProfile(userProfileData));
    }, []);

    useEffect(() => {
        fetchFiles().then(files => setTableData(files));
    }, [selectedOutbreak]);

    const handleDownload = async (fileKey: string, user: UserProfile) => {
        try {
            await client.models.DownloadEvent.create({
                userId: user.id,
                email: user.email,
                filename: fileKey,
                timestamp: new Date().toISOString(),
            });

            const link = await getUrl({path: fileKey});

            window.open(link.url.toString(), '_blank');
        } catch (error) {
            console.error("Error downloading:", error);
        }
    };

    const {signOut} = useAuthenticator((context) => [context.user]);

    return (
        <Grid container spacing={2} style={{width: '100%'}}>
            <Grid size={4}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Selected Outbreak</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedOutbreak}
                        label="Selected Outbreak"
                        onChange={handleChange}
                    >
                        {availableOutbreaks.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
            <Grid size={6}>

            </Grid>
            <Grid size={2}>
                <Button onClick={signOut} variant="contained" color="error" style={{height: '100%', width: '100%'}}>Sign
                    Out</Button>
            </Grid>
            <Grid size={12}>
                <Paper style={{width: '100%'}}>
                    <MaterialTable
                        options={{
                            search: true,
                            paging: false,
                            searchFieldAlignment: 'right',
                            filtering: true,
                            sorting: true,
                        }}
                        columns={[
                            {
                                title: 'Name',
                                field: 'name',
                                filtering: false,
                            },
                            {
                                title: '',
                                field: 'filename',
                                width: '120px',
                                filtering: false,
                                render: userProfile ? (rowData: { filename: string }) => {
                                    return (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleDownload(rowData.filename, userProfile)}
                                            startIcon={<SaveAltIcon/>}
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                minWidth: '140px',
                                            }}
                                        >
                                            Download
                                        </Button>
                                    );
                                } : undefined,
                            },
                        ]}
                        data={tableData || []}
                        title="Data downloads"
                        isLoading={!tableData || !userProfile}
                    />
                </Paper>
            </Grid>
        </Grid>
    );
}
