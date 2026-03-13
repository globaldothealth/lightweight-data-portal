import {useEffect} from "react";
import MaterialTable, {MTableToolbar} from '@material-table/core';
import {SaveAlt as SaveAltIcon} from '@mui/icons-material';
import {Button, Paper, MenuItem, FormControl, InputLabel, Grid, Typography} from '@mui/material';
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
    }, [dispatch, s3Folder]);

    const handleS3FolderChange = (event: SelectChangeEvent<unknown>) => {
        dispatch(setS3Folder(event.target.value as S3Folder));
    };

    const handleDownloadClick = (fileKey: string) => () => {
        dispatch(handleDownload({s3FileKey: fileKey, user: userProfile!}));
    }

    return (
        <Grid container spacing={2}>
            <Grid size={12} sx={{color: '#1e1e1e'}}>
                <Typography variant='h2'>Data Downloads</Typography>
                <Typography sx={{marginTop: '10px'}}>Select a dataset below to download and begin exploring the
                    data.</Typography>
            </Grid>
            <Grid size={12}>
                <Paper>
                    <MaterialTable
                        options={{
                            search: true,
                            paging: false,
                            searchFieldAlignment: 'right',
                            maxColumnSort: 1,
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
                                render: (rowData: { filename: string }) => {
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
                                            disabled={!userProfile}
                                        >
                                            Download
                                        </Button>
                                    );
                                },
                            },
                        ]}
                        data={s3Files}
                        title=""
                        isLoading={isLoading || !userProfile}
                        components={{
                            Toolbar: props => (
                                <Grid container spacing={2}>
                                    {/* pt: 2.5 is approx 20px, pl: 2 is 16px */}
                                    <Grid size={6} sx={{pt: 2.5, pl: 2}}>
                                        <FormControl fullWidth variant="standard">
                                            <InputLabel id="outbreak-selector-label">Selected Outbreak</InputLabel>
                                            <Select
                                                labelId="outbreak-selector-label"
                                                id="outbreak-selector"
                                                value={s3Folder}
                                                label="Selected Outbreak"
                                                onChange={handleS3FolderChange}
                                            >
                                                {Object.values(S3Folder).map(s => <MenuItem key={s}
                                                                                            value={s}>{s}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid size={6} sx={{pt: 2.5}}>
                                        <MTableToolbar {...props} />
                                    </Grid>
                                </Grid>
                            ),
                        }}
                    />
                </Paper>
            </Grid>
        </Grid>
    );
}
