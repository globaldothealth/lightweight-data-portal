import React, {useState, useEffect, JSX} from 'react';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    Typography,
    FormControl,
    MenuItem,
    IconButton, Tooltip, Grid,
} from '@mui/material';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import MaterialTable from '@material-table/core';
import DeleteIcon from '@mui/icons-material/Delete';

import {useAppDispatch, useAppSelector} from '../../hooks/redux';
import {selectUserProfile} from "../../redux/app/selectors.ts";
import {selectUsers, selectIsLoading, selectError} from '../../redux/manageUsers/selectors';
import {Groups, User} from '../../redux/manageUsers/slice';
import {getUsers, addUserToGroup, removeUserFromGroup, deleteUser} from "../../redux/manageUsers/thunk.ts";


const ManageUsers = () => {
    const [userSelectedToBeDeleted, setUserSelectedToBeDeleted] =
        React.useState<User | null>(null);
    const clearUserSelectedToBeDeleted = () => setUserSelectedToBeDeleted(null)
    const [pageSize, setPageSize] = useState(10);
    const dispatch = useAppDispatch();

    const userProfile = useAppSelector(selectUserProfile);
    const users = useAppSelector(selectUsers);
    const isLoading = useAppSelector(selectIsLoading);
    const error = useAppSelector(selectError);

    useEffect(() => {
        dispatch(getUsers());
    }, [dispatch]);

    const updateGroups = (
        event: SelectChangeEvent<string[]>,
        userId: string,
        previousGroups: Groups[],
    ): void => {
        const newGroups = event.target.value as Groups[];
        const addedGroups = newGroups.filter(g => !previousGroups.includes(g));
        const removedGroups = previousGroups.filter(g => !newGroups.includes(g));

        if (addedGroups.length > 0) {
            dispatch(addUserToGroup({userId, groupName: addedGroups[0]}));
        }
        if (removedGroups.length > 0) {
            dispatch(removeUserFromGroup({userId, groupName: removedGroups[0]}));
        }
    };


    return (
        <Grid container spacing={2}>
            <Grid size={12} sx={{color: 'text.primary'}}>
                <Typography variant='h2'>Manage Users</Typography>
            </Grid>
            <Grid size={12}>
                <Paper sx={{p: '1rem'}}>
                    <Typography sx={{mb: '.5rem'}}>On this page G.h admins can add users to groups and delete user
                        accounts.</Typography>
                    <Typography>There are three levels of permission available in the app:</Typography>
                    <Typography component='ul'>
                    <Typography component='li'>
                        <strong>Visitor</strong> - user without any group assigned. This user can only view the Outbreak
                        Data page.
                    </Typography>
                    <Typography component='li'>
                        <strong>Researcher</strong> - user assigned to <i>RESEARCHERS</i> group. This user can view the <i>Outbreak
                        Data</i> and <i>Dengue Geodata</i> pages.
                    </Typography>
                    <Typography component='li'>
                        <strong>Curator/Junior Curator</strong> - user assigned to <i>CURATORS</i> or <i>JUNIOR-CURATORS</i> group. This user can view the <i>Outbreak
                        Data</i>, <i>Dengue Geodata</i> and <i>Location Admin Explorer</i> pages.
                    </Typography>
                    <Typography component='li'>
                        <strong>Admin</strong> - user assigned to <i>ADMINS</i> group. This user can view the all of the pages.
                    </Typography>
                    </Typography>
                    <Typography sx={{mt: '.5rem'}}>User cannot remove their own account. Additionally in order to delete
                        user account that belongs to <i>ADMINS</i> they must first be removed from
                        the <i>ADMINS</i> group.</Typography>
                </Paper>
            </Grid>
            <Grid size={12}>
                <Paper>
                    {error && (<Alert variant="filled" severity="error"> {error} </Alert>)}
                    <Dialog
                        open={userSelectedToBeDeleted !== null}
                        onClose={clearUserSelectedToBeDeleted}
                        onClick={(e): void => e.stopPropagation()}
                    >
                        <DialogTitle>
                            Are you sure you want to delete this user?
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                User {userSelectedToBeDeleted?.email} will be permanently deleted.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={clearUserSelectedToBeDeleted}
                                color="primary"
                                autoFocus
                            >
                                Cancel
                            </Button>
                            <Button onClick={() => {
                                clearUserSelectedToBeDeleted();
                                dispatch(deleteUser(userSelectedToBeDeleted?.id || ''))
                            }} color="primary" variant='contained'>
                                Yes
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <MaterialTable
                        title={<Typography>Users</Typography>}
                        columns={[
                            {
                                title: 'Email',
                                field: 'email',
                                type: 'string',
                            },
                            {
                                title: 'Groups',
                                field: 'groups',
                                type: 'string',
                                render: (rowData): JSX.Element =>
                                    (
                                        <FormControl sx={{width: '100%'}}>
                                            <Select
                                                data-testid={`${rowData.id}-select-roles`}
                                                multiple
                                                value={rowData.groups}
                                                onChange={(event) => updateGroups(event, rowData.id, rowData.groups)}
                                            >
                                                {Object.values(Groups).map((role) => (
                                                    <MenuItem key={role} value={role}>
                                                        {role}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    ),
                            },
                            {
                                width: '1%',
                                cellStyle: {
                                    padding: '0',
                                },
                                render: (rowData: User): JSX.Element => {
                                    const isUserSelf = userProfile?.id === rowData.id;
                                    const isAdmin = rowData.groups.includes(Groups.ADMINS);
                                    const tooltipText = isUserSelf ? "You can't delete your own account" : isAdmin ? "User that belongs to ADMINS group can't be deleted" : 'Delete user';

                                    return (
                                        <Tooltip title={tooltipText}>
                                <span>
                                <IconButton
                                    onClick={() => setUserSelectedToBeDeleted(rowData)}
                                    disabled={isAdmin || isUserSelf}
                                >
                                    <DeleteIcon/>
                                </IconButton>
                                    </span>
                                        </Tooltip>

                                    )
                                },
                            },
                        ]}
                        data={users}
                        style={{fontFamily: 'Inter'}}
                        options={{
                            search: false,
                            filtering: false,
                            padding: 'dense',
                            draggable: false, // No need to be able to drag and drop headers.
                            pageSize: pageSize,
                            pageSizeOptions: [5, 10, 20, 50, 100],
                            paginationPosition: 'bottom',
                            toolbar: false,
                            headerStyle: {
                                zIndex: 1,
                            },
                            emptyRowsWhenPaging: false,
                        }}
                        onRowsPerPageChange={(newPageSize: number) => {
                            setPageSize(newPageSize);
                        }}
                        isLoading={isLoading}
                    />
                </Paper>
            </Grid></Grid>
    );
};

export default ManageUsers;
