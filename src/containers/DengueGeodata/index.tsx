import {useEffect} from "react";
import MaterialTable from '@material-table/core';
import {SaveAlt as SaveAltIcon} from '@mui/icons-material';
import {Button, Paper, Grid, Typography} from '@mui/material';
import {useAppDispatch, useAppSelector} from '../../hooks/redux';
import {selectUserProfile} from "../../redux/app/selectors.ts";
import {selectS3Files, selectIsLoading, selectAvailableCountries} from "../../redux/dengueGeodata/selectors.ts";
import {getFilesFromMetadata, handleDownload} from "../../redux/dengueGeodata/thunk.ts";

export default function DengueGeodata() {
    const dispatch = useAppDispatch();
    const s3Files = useAppSelector(selectS3Files);
    const isLoading = useAppSelector(selectIsLoading);
    const availableCountries = useAppSelector(selectAvailableCountries);
    const userProfile = useAppSelector(selectUserProfile);

    useEffect(() => {
        dispatch(getFilesFromMetadata());
    }, [dispatch]);

    const handleDownloadClick = (fileKey: string) => () => {
        dispatch(handleDownload({s3FileKey: fileKey, user: userProfile!}));
    }

    return (
        <Grid container spacing={2}>
            <Grid size={12} sx={{color: 'text.primary'}}>
                <Typography variant='h2'>Dengue Geodata</Typography>
            </Grid>
            <Grid size={12}>
                <Paper sx={{p: '1rem'}}>
                    <Typography sx={{textAlign: 'justify'}}>
                        By accessing or downloading these datasets, you agree to handle the data responsibly and in
                        accordance with the ethical research and data protection standards outlined in the Global.health
                        Terms of Use, Privacy Policy, and Code of Conduct. The data are provided for research purposes
                        only, and users may not attempt to re-identify individuals. While reasonable efforts are made to
                        ensure accuracy, the data are subject to ongoing verification and may be updated or revised.
                        Global.health makes no warranties regarding the accuracy or completeness of the data and
                        disclaims liability for any use of, or reliance on, the information. Users are responsible for
                        the interpretation, analysis, and use of the data and any outputs derived from it.
                    </Typography>
                    <br/>
                    <Typography sx={{textAlign: 'justify'}}>
                        By accessing or using the datasets, you acknowledge that you have read, understood, and agreed
                        to comply with these terms.
                    </Typography>
                </Paper>
            </Grid>
            <Grid size={12}>
                <Paper>
                    <MaterialTable
                        options={{
                            search: true,
                            paging: false,
                            searchFieldAlignment: 'right',
                            maxColumnSort: 1,
                            filtering: true,
                            // Remove fixed margin set inside the component and set it to 1em
                            searchFieldStyle: {marginRight: 'calc(1em - 24px)'},
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
                                lookup: availableCountries,
                            },
                            {
                                title: '',
                                field: 'filename',
                                align: 'right',
                                filtering: false,
                                render: (rowData: { filename: string }) => {
                                    return (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleDownloadClick(rowData.filename)}
                                            startIcon={<SaveAltIcon/>}
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
                    />
                </Paper>
            </Grid>
        </Grid>
    );
}
