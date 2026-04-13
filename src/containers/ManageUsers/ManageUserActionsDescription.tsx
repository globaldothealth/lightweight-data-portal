import {Box, Paper, Typography} from "@mui/material";

export const ManageUserActionsDescription = () => (
    <Paper sx={{p: '1rem'}}>
        <Typography sx={{mb: '.5rem'}}>On this page G.h admins can add users to groups and delete user
            accounts.</Typography>
        <Typography>There are four levels of permission available in the app:</Typography>
        <Box component='ul' sx={{mt: 0}}>
            <Typography component='li'>
                <strong>Visitor</strong> - user without any group assigned. This user can only view the
                Outbreak Data page.
            </Typography>
            <Typography component='li'>
                <strong>Researcher</strong> - user assigned to <i>Reasercher</i> group. This user can view
                the <i>Outbreak
                Data</i> and <i>Dengue Geodata</i> pages.
            </Typography>
            <Typography component='li'>
                <strong>Curator</strong> - user assigned to <i>Curator</i> group. This user can view
                the <i>Outbreak
                Data</i>, <i>Dengue Geodata</i> and <i>Location Admin Explorer</i> pages.
            </Typography>
            <Typography component='li'>
                <strong>Admin</strong> - user assigned to <i>Admin</i> group. This user can view the all of
                the pages.
            </Typography>
        </Box>
        <Typography>User cannot remove their own account. Additionally in order to delete
            user account that belongs to <i>ADMINS</i> they must first be removed from
            the <i>ADMINS</i> group.</Typography>
    </Paper>
)