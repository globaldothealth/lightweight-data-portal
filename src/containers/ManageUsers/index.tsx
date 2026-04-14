import React, {useState, useEffect, JSX} from 'react';
import {
    Alert,
    FormControl,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Tooltip,
    Typography,
} from '@mui/material';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import MaterialTable from '@material-table/core';
import DeleteIcon from '@mui/icons-material/Delete';

import {useAppDispatch, useAppSelector} from '../../hooks/redux';
import {selectUserProfile} from "../../redux/app/selectors.ts";
import {selectUsers, selectIsLoading, selectError} from '../../redux/manageUsers/selectors';
import {User, Group} from "../../models/User.ts";
import {getUsers, addUserToGroup, removeUserFromGroup, deleteUser} from "../../redux/manageUsers/thunk.ts";
import {RemoveUserDialog} from "./RemoveUserDialog.tsx";
import {ManageUserActionsDescription} from "./ManageUserActionsDescription.tsx";


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
        username: string,
        previousGroups: Group[],
    ): void => {
        const newGroups = event.target.value as Group[];
        const addedGroups = newGroups.filter(g => !previousGroups.includes(g));
        const removedGroups = previousGroups.filter(g => !newGroups.includes(g));

        addedGroups.forEach(groupName => {
            dispatch(addUserToGroup({username, groupName}));
        });

        removedGroups.forEach(groupName => {
            dispatch(removeUserFromGroup({username, groupName}));
        });
    };

    return (
        <Grid container spacing={2}>
            <Grid size={12} sx={{color: 'text.primary'}}>
                <Typography variant='h2'>Manage Users</Typography>
            </Grid>
            <Grid size={12}>
                <ManageUserActionsDescription/>
            </Grid>
            <Grid size={12}>
                <Paper>
                    {error && (<Alert variant="filled" severity="error"> {error} </Alert>)}
                    <RemoveUserDialog clearUserSelectedToBeDeleted={clearUserSelectedToBeDeleted}
                                      userSelectedToBeDeleted={userSelectedToBeDeleted}
                                      deleteUser={(username) => dispatch(deleteUser(username))}/>
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
                                                data-testid={`${rowData.username}-select-roles`}
                                                multiple
                                                value={rowData.groups}
                                                onChange={(event) => updateGroups(event, rowData.username, rowData.groups)}
                                            >
                                                {Object.values(Group).map((role) => (
                                                    <MenuItem key={role} value={role}>{role}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    ),
                            },
                            {
                                width: '1%',
                                cellStyle: {padding: '0'},
                                render: (rowData: User): JSX.Element => {
                                    const isUserSelf = userProfile?.username === rowData.username;
                                    const isAdmin = rowData.groups.includes(Group.ADMINS);
                                    const tooltipText = isUserSelf ? "You can't delete your own account" : isAdmin ? "User that belongs to ADMINS group can't be deleted" : 'Delete user';

                                    return (
                                        <Tooltip title={tooltipText}>
                                            <span>
                                                <IconButton
                                                    data-testid={`delete-user-${rowData.username}`}
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
            </Grid>
        </Grid>
    );
};

export default ManageUsers;
