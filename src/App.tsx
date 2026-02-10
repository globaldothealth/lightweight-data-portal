import {useState, useEffect} from "react";
import {Amplify} from "aws-amplify";
import {fetchUserAttributes, FetchUserAttributesOutput} from 'aws-amplify/auth';
import {generateClient} from "aws-amplify/data";
import {list, getUrl} from 'aws-amplify/storage';
import "@aws-amplify/ui-react/styles.css";
import {Button, Flex, useAuthenticator} from "@aws-amplify/ui-react";
import MaterialTable from '@material-table/core';
import {SaveAlt as SaveAltIcon} from '@mui/icons-material';
import {Button as MUIButton, Paper} from '@mui/material';

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


export default function App() {
    const [tableData, setTableData] =
        useState<[{ name: string; filename: string }]>();
    const [userProfile, setUserProfile] = useState<UserProfile>();

    async function fetchUserProfile() {
        const {email, sub: id}: FetchUserAttributesOutput = await fetchUserAttributes();
        if (!email || !id) {
            console.error("User attributes missing");
            return;
        }
        setUserProfile({
            email, id
        });
    }

    async function loadFiles() {
        const result: any = await list({path: 'public/'});
        setTableData(result.items.map((file: { path: string }) => ({
            filename: file.path,
            name: file.path.split('/').pop(),
        })).filter((file: { name: string; filename: string }) => file.name !== ''));
    }

    useEffect(() => {
        fetchUserProfile();
        loadFiles();
    }, []);


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

    async function handleSignOut() {
        await signOut()
    }

    return (
        <Flex
            className="App"
            justifyContent="center"
            alignItems="center"
            direction="column"
            width="70%"
            margin="0 auto"
        >
            <div style={{width: '100%', float: 'right', textAlign: 'right'}}>
                <Button onClick={handleSignOut}>Sign Out</Button>
            </div>
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
                                    <MUIButton
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
                                    </MUIButton>
                                );
                            } : undefined,
                        },
                    ]}
                    data={tableData || []}
                    title="Data downloads"
                    isLoading={!tableData || !userProfile}
                />
            </Paper>
        </Flex>
    );
}
