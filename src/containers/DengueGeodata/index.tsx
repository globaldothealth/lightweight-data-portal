import {useEffect} from "react";
import MaterialTable from '@material-table/core';
import {SaveAlt as SaveAltIcon} from '@mui/icons-material';
import {Button, Paper, Grid, Typography} from '@mui/material';
import {useAppDispatch, useAppSelector} from '../../hooks/redux';
import {selectUserProfile} from "../../redux/app/selectors.ts";
import {selectS3Files, selectIsLoading, selectAvailableCountries} from "../../redux/dengueGeodata/selectors.ts";
import {getFilesFromMetadata, handleDownload} from "../../redux/dengueGeodata/thunk.ts";
import {DataAcknowledgementsAccordion} from "../../components/DataAcknowledgementsAccordion";

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
                <DataAcknowledgementsAccordion initialOpen={false}></DataAcknowledgementsAccordion>
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
