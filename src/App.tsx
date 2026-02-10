import {useState, useEffect} from "react";
import {
    Button,
    Heading,
    Flex,
    View,
    Grid,
    Divider,
} from "@aws-amplify/ui-react";
import MaterialTable from '@material-table/core';
import {Button as MUIButton, Grid as MUIGrid, Paper, Tooltip} from '@mui/material';
import {useAuthenticator} from "@aws-amplify/ui-react";
import {Amplify} from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import {generateClient} from "aws-amplify/data";
// import { StorageBrowser } from "@aws-amplify/ui-react-storage";
import outputs from "../amplify_outputs.json";
import {SaveAlt as SaveAltIcon} from '@mui/icons-material';
import {
    createAmplifyAuthAdapter,
    createStorageBrowser,
} from '@aws-amplify/ui-react-storage/browser';
import { signOut } from 'aws-amplify/auth';

/**
 * @type {import('aws-amplify/data').Client<import('../amplify/data/
 resource').Schema>}
 */
Amplify.configure(outputs);
import {Schema} from "../amplify/data/resource";
const client = generateClient<Schema>({
    authMode: "userPool",
});
import {list, getUrl} from 'aws-amplify/storage';



const {StorageBrowser} = createStorageBrowser({
    config: createAmplifyAuthAdapter(),
});

export default function App() {
    const [tableData, setTableData] = useState([]);
    const [userprofiles, setUserProfiles] = useState([]);
    const [signInEvents, setSignInEvents] = useState([]);
    const [downloadEvents, setDownloadEvents] = useState([]);

    // 1. Fetch files
    useEffect(() => {
        async function loadFiles() {
            const result = await list({path: 'public/'});
            setTableData(result.items.map(file => ({
                filename: file.path,
                name: file.path.split('/').pop(),
                country: 'poland'
            })).filter(file => file.name !== ''));
        }

        loadFiles();

    }, []);

    // 2. Handle the Download Click
    const handleDownload = async (fileKey, user) => {
        try {
            // A: Save to Database FIRST
            await client.models.DownloadEvent.create({
                userId: user.profileOwner,
                email: user.email,
                filename: fileKey,
                timestamp: new Date().toISOString(),
            });

            // B: Get the Download URL
            const link = await getUrl({path: fileKey});

            // C: Open the file
            window.open(link.url.toString(), '_blank');

        } catch (error) {
            console.error("Error downloading:", error);
        } finally {fetchDownloadEvents()}
    };

    const {signOut} = useAuthenticator((context) => [context.user]);
    useEffect(() => {
        fetchUserProfile();
        fetchDownloadEvents();
        fetchSignInEvents()
    }, []);

    async function fetchUserProfile() {
        // @ts-ignore
        const {data: profiles} = await client.models.UserProfile.list();

        setUserProfiles(profiles);
    }

    async function fetchDownloadEvents() {
        // @ts-ignore
        const {data: de} = await client.models.DownloadEvent.list();
        de.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            // @ts-ignore
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setDownloadEvents(de);
    }
    console.log('DE', downloadEvents)
    async function fetchSignInEvents() {
        // @ts-ignore
        const {data: sie} = await client.models.SignInEvent.list();
        sie.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            // @ts-ignore
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setSignInEvents(sie);
    }
    console.log('SIE', signInEvents)

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
            <Heading level={1}>My Profile</Heading>
            <Divider/>
            <Grid
                margin="3rem 0"
                autoFlow="column"
                justifyContent="center"
                gap="2rem"
                alignContent="center"
            >
                {userprofiles.map((userprofile) => (
                    <Flex
                        key={userprofile.id || userprofile.email}
                        direction="column"
                        justifyContent="center"
                        alignItems="center"
                        gap="2rem"
                        border="1px solid #ccc"
                        padding="2rem"
                        borderRadius="5%"
                        className="box"
                    >
                        <View>
                            <Heading level="3">{userprofile.email}</Heading>
                        </View>
                    </Flex>
                ))}
            </Grid>
            {signInEvents.length > 0 &&
                (<table>
                    <thead>
                    <tr>
                    <th style={{backgroundColor: 'gray'}}>Email</th>
                    <th style={{backgroundColor: 'gray'}}>Acess Time</th>
                    </tr>
                    </thead>
                    <tbody>
                {signInEvents.map((signInEvent) => (
                    <tr>
                        <td style={{backgroundColor: 'gray'}}>{signInEvent.email}</td>
                        <td style={{backgroundColor: 'gray'}}>{signInEvent.createdAt}</td>
                    </tr>
                ))}</tbody>

            </table>)}
            <Divider/>
            <Heading level={2}>File Storage</Heading>
            <StorageBrowser/>
            <Paper style={{width: '100%'}}>
                {tableData && (
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
                                title: 'Country',
                                field: 'country',
                                width: '25%',
                                defaultSort: 'asc',
                                lookup: ['poland'],
                            },
                            {
                                title: '',
                                field: 'filename',
                                width: '120px',
                                filtering: false,
                                render: (rowData: {filename: string}) => {
                                    // if (userIsResearcher) {
                                    return (
                                        <MUIButton
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleDownload(rowData.filename, userprofiles[0])}
                                            startIcon={<SaveAltIcon/>}
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                minWidth: '140px',
                                            }}
                                        >
                                            Download
                                        </MUIButton>
                                    );
                                    // } else if (agreedToDataAcknowledgement) {
                                    //     return (
                                    //         <Tooltip
                                    //             placement="left"
                                    //             title={
                                    //                 'To access file downloads your account must be verified by the G.h Administrator'
                                    //             }
                                    //         >
                                    //                     <span>
                                    //                         <Button
                                    //                             variant="contained"
                                    //                             color="primary"
                                    //                             onClick={() =>
                                    //                                 downloadDataButtonOnClick(
                                    //                                     rowData.filename,
                                    //                                 )
                                    //                             }
                                    //                             startIcon={
                                    //                                 <SaveAltIcon />
                                    //                             }
                                    //                             sx={{
                                    //                                 whiteSpace:
                                    //                                     'nowrap',
                                    //                                 minWidth: '140px',
                                    //                             }}
                                    //                             disabled={true}
                                    //                         >
                                    //                             Download
                                    //                         </Button>
                                    //                     </span>
                                    //         </Tooltip>
                                    //     );
                                    // }
                                    // return (
                                    //     <Tooltip
                                    //         placement="left"
                                    //         title={
                                    //             'To access file downloads you must agree to Data Acknowledgement and your account must be verified by the G.h Administrator'
                                    //         }
                                    //     >
                                    //                 <span>
                                    //                     <Button
                                    //                         variant="contained"
                                    //                         color="primary"
                                    //                         onClick={() =>
                                    //                             downloadDataButtonOnClick(
                                    //                                 rowData.filename,
                                    //                             )
                                    //                         }
                                    //                         startIcon={<SaveAltIcon />}
                                    //                         sx={{
                                    //                             whiteSpace: 'nowrap',
                                    //                             minWidth: '140px',
                                    //                         }}
                                    //                         disabled={true}
                                    //                     >
                                    //                         Download
                                    //                     </Button>
                                    //                 </span>
                                    //     </Tooltip>
                                    // );
                                },
                            },
                        ]}
                        data={tableData}
                        title="Data downloads"
                    />
                )}</Paper>
            {downloadEvents.length > 0 &&
                (<table>
                    <thead>
                    <tr>
                        <th style={{backgroundColor: 'gray'}}>Email</th>
                        <th style={{backgroundColor: 'gray'}}>File</th>
                        <th style={{backgroundColor: 'gray'}}>Acess Time</th>
                    </tr>
                    </thead>
                    <tbody>
                    {downloadEvents.map((downloadEvent) => (
                        <tr>
                            <td style={{backgroundColor: 'gray'}}>{downloadEvent.email}</td>
                            <td style={{backgroundColor: 'gray'}}>{downloadEvent.filename}</td>
                            <td style={{backgroundColor: 'gray'}}>{downloadEvent.createdAt}</td>
                        </tr>
                    ))}</tbody>

                </table>)}
            <Button onClick={handleSignOut}>Sign Out</Button>
        </Flex>
    );
}


//
// import { useState, useEffect } from 'react';
// import { list, getUrl } from 'aws-amplify/storage';
// import { generateClient } from 'aws-amplify/data';
// import type { Schema } from '../amplify/data/resource'; // Your DB Schema
//
// const client = generateClient<Schema>();
//
// export default function MyCustomBrowser() {
//     const [files, setFiles] = useState<any[]>([]);
//
//     // 1. Fetch files
//     useEffect(() => {
//         async function loadFiles() {
//             const result = await list({ path: 'public/' });
//             setFiles(result.items);
//         }
//         loadFiles();
//     }, []);
//
//     // 2. Handle the Download Click
//     const handleDownload = async (fileKey: string) => {
//         try {
//             // A: Save to Database FIRST
//             await client.models.DownloadLog.create({
//                 filename: fileKey,
//                 username: 'currentUser', // Get this from Auth.getCurrentUser()
//                 timestamp: new Date().toISOString()
//             });
//
//             // B: Get the Download URL
//             const link = await getUrl({ path: fileKey });
//
//             // C: Open the file
//             window.open(link.url.toString(), '_blank');
//
//         } catch (error) {
//             console.error("Error downloading:", error);
//         }
//     };
//
//     return (
//         <div>
//             <h2>My Files</h2>
//             <ul>
//                 {files.map(file => (
//                     <li key={file.path}>
//                         {file.path}
//                         {/* Your Custom Button */}
//                         <button onClick={() => handleDownload(file.path)}>
//                             Download & Log
//                         </button>
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// }
//
