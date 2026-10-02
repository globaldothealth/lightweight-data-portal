import {Grid, Typography, Paper} from "@mui/material";


export default function Sources() {
    return <>
        <Grid container spacing={2}>
            <Grid size={12}>
                <Typography variant={'h2'} sx={{color: "text.primary"}}>Sources</Typography>
            </Grid>
            <Grid size={12}>
                <Paper sx={{p: '1rem'}}>
                    <Typography>
                        Explore data sources for infectious disease information.
                    </Typography>
                </Paper>
            </Grid>
        </Grid>
    </>
}

