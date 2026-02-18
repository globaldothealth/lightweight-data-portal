import {useEffect} from "react";
import "@aws-amplify/ui-react/styles.css";
import MaterialTable from '@material-table/core';
import {SaveAlt as SaveAltIcon} from '@mui/icons-material';
import {Button, Paper, MenuItem, FormControl, InputLabel, Grid} from '@mui/material';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import {useAppDispatch, useAppSelector} from '../../hooks/redux';
import {selectUserProfile} from "../../redux/app/selectors.ts";
import {selectS3Folder, selectS3Files, selectIsLoading} from "../../redux/dataDownloads/selectors.ts";
import {getFilesFromS3Folder, handleDownload} from "../../redux/dataDownloads/thunk.ts";
import {S3Folder, setS3Folder} from "../../redux/dataDownloads/slice.ts";


export default function DataDownloads() {
    const dispatch = useAppDispatch();
    const s3Folder = useAppSelector(selectS3Folder);
    const s3Files = useAppSelector(selectS3Files);
    const isLoading = useAppSelector(selectIsLoading);
    const userProfile = useAppSelector(selectUserProfile);

    useEffect(() => {
        dispatch(getFilesFromS3Folder({s3Folder}));
    }, [s3Folder]);

    const handleS3FolderChange = (event: SelectChangeEvent) => {
        dispatch(setS3Folder(event.target.value as S3Folder));
    };

    const handleDownloadClick = (fileKey: string) => () => {
        if (userProfile) {
            dispatch(handleDownload({s3FileKey: fileKey, user: userProfile}));
        }
    }

    return (
        <Grid container spacing={2} style={{width: '100%'}}>
            <Grid size={4}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Selected Outbreak</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={s3Folder}
                        label="Selected Outbreak"
                        onChange={handleS3FolderChange}
                    >
                        {Object.values(S3Folder).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
            <Grid size={8}/>
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
                                            onClick={handleDownloadClick(rowData.filename)}
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
                        data={s3Files}
                        title="Data downloads"
                        isLoading={isLoading}
                    />
                </Paper>
            </Grid>
        </Grid>
    );
}
