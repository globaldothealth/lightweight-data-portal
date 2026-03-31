import MaterialTable, { QueryResult } from '@material-table/core';
import {
    Avatar,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Menu,
    Paper,
    Typography,
    FormControl,
    MenuItem,
    IconButton,
} from '@mui/material';
import React, {useRef, useState, useEffect, JSX} from 'react';
// import { Theme } from '@mui/material/styles';
import { useAppSelector } from '../../hooks/redux';
import { selectUsers, selectIsLoading, selectError } from '../../redux/manageUsers/selectors';
import { Groups, User } from '../../redux/manageUsers/slice';

// import { makeStyles } from 'tss-react/mui';

import MuiAlert from '@mui/material/Alert';
// import MoreVertIcon from '@mui/icons-material/MoreVert';
// import DeleteIcon from '@mui/icons-material/Delete';
import Select, { SelectChangeEvent } from '@mui/material/Select';
// import User from '../../redux/manageUsers/slice.ts';
// import axios from 'axios';
// import { Role } from '../api/models/User';
import {getUsers, addUserToGroup, removeUserFromGroup} from "../../redux/manageUsers/thunk.ts";
import {useAppDispatch} from "../../hooks/redux.ts";

// interface ListResponse {
//     users: User[];
//     nextPage: number;
//     total: number;
// }
//
interface TableRow {
    id: string;
    // picture: string;
    name: string;
    email: string;
    roles: string[];
}
//
// interface UsersProps {
//     onUserChange: () => void;
// }
//
interface UsersSelectDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
    'data-testid'?: string;
}
//
// // Return type isn't meaningful.
// // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
// const useStyles = makeStyles()((theme: Theme) => ({
//     alert: {
//         borderRadius: theme.spacing(1),
//         marginTop: theme.spacing(2),
//     },
//     spacer: { flex: 1 },
//     tablePaginationBar: {
//         alignItems: 'center',
//         backgroundColor: theme.palette.background.default,
//         display: 'flex',
//         height: '64px',
//     },
//     usersSection: {
//         marginTop: '66px',
//     },
// }));
//
// const rowMenuStyles = makeStyles()((theme: Theme) => ({
//     menuItemTitle: {
//         marginLeft: theme.spacing(1),
//     },
//     dialogLoadingSpinner: {
//         marginRight: theme.spacing(2),
//         padding: '6px',
//     },
// }));
//
// function RowMenu(props: {
//     myId: string;
//     rowId: string;
//     rowData: TableRow;
//     setError: (error: string) => void;
//     refreshData: () => void;
// }): JSX.Element {
//     const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
//     const [deleteDialogOpen, setDeleteDialogOpen] =
//         React.useState<boolean>(false);
//     const [isDeleting, setIsDeleting] = React.useState(false);
//     const { classes } = rowMenuStyles();
//
//     const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
//         event.stopPropagation();
//         setAnchorEl(event.currentTarget);
//     };
//
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const handleClose = (event?: any): void => {
//         if (event) {
//             event.stopPropagation();
//         }
//         setAnchorEl(null);
//     };
//
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const openDeleteDialog = (event?: any): void => {
//         if (event) {
//             event.stopPropagation();
//         }
//         setDeleteDialogOpen(true);
//     };
//
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const handleDelete = async (event?: any): Promise<void> => {
//         if (event) {
//             event.stopPropagation();
//         }
//         try {
//             setIsDeleting(true);
//             props.setError('');
//             const deleteUrl = '/api/users/' + props.rowId;
//             await axios.delete(deleteUrl);
//             if (props.rowId === props.myId) {
//                 /* The user has deleted themselves (alright metaphysicists, their own account).
//                  * We need to redirect them to the homepage, because they can't use the app any more.
//                  * But we also need to end their session, to avoid errors looking up their user.
//                  * When the app can't deserialise the (now-nonexistent) user from the session, it will
//                  * log them out and display the sign up page again.
//                  */
//                 window.location.replace('/');
//             }
//             props.refreshData();
//         } catch (e) {
//             props.setError((e as Error).toString());
//         } finally {
//             setDeleteDialogOpen(false);
//             setIsDeleting(false);
//             handleClose();
//         }
//     };
//
//     return (
//         <>
//             <IconButton
//                 aria-controls="topbar-menu"
//                 aria-haspopup="true"
//                 aria-label="row menu"
//                 data-testid="row menu"
//                 onClick={handleClick}
//                 color="inherit"
//             >
//                 <MoreVertIcon />
//             </IconButton>
//             <Menu
//                 anchorEl={anchorEl}
//                 keepMounted
//                 open={Boolean(anchorEl)}
//                 onClose={handleClose}
//             >
//                 <MenuItem onClick={openDeleteDialog}>
//                     <DeleteIcon />
//                     <span className={classes.menuItemTitle}>Delete</span>
//                 </MenuItem>
//             </Menu>
//             <Dialog
//                 open={deleteDialogOpen}
//                 onClose={(): void => setDeleteDialogOpen(false)}
//                 // Stops the click being propagated to the table which
//                 // would trigger the onRowClick action.
//                 onClick={(e): void => e.stopPropagation()}
//             >
//                 <DialogTitle>
//                     Are you sure you want to delete this user?
//                 </DialogTitle>
//                 <DialogContent>
//                     <DialogContentText>
//                         User {props.rowData.email} will be permanently deleted.
//                     </DialogContentText>
//                 </DialogContent>
//                 <DialogActions>
//                     {isDeleting ? (
//                         <CircularProgress
//                             classes={{ root: classes.dialogLoadingSpinner }}
//                         />
//                     ) : (
//                         <>
//                             <Button
//                                 onClick={(): void => {
//                                     setDeleteDialogOpen(false);
//                                 }}
//                                 color="primary"
//                                 autoFocus
//                             >
//                                 Cancel
//                             </Button>
//                             <Button onClick={handleDelete} color="primary">
//                                 Yes
//                             </Button>
//                         </>
//                     )}
//                 </DialogActions>
//             </Dialog>
//         </>
//     );
// }

const ManageUsers = () => {
    // We could use a proper type here but then we wouldn't be able to call
    // onQueryChange() to refresh the table as we want.
    // https://github.com/mbrn/material-table/issues/1752
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableRef = useRef<any>();
    const [availableRoles, setAvailableRoles] = useState<string[]>(Object.values(Groups));
    // const [url] = useState('/api/users/');
    // const [error, setError] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const dispatch = useAppDispatch();

    // const user = useAppSelector(selectUser);
    const users = useAppSelector(selectUsers);
    const isLoading = useAppSelector(selectIsLoading);
    const error = useAppSelector(selectError);

    useEffect(() => {
        dispatch(getUsers());
    }, []);
    // return isLoading ? <CircularProgress /> : (
    //     <Paper>
    //         <Typography variant="h4">Users</Typography>
    //         {users.map((user) => (
    //             <div key={user.id}>
    //                 <p>{user.email}</p>
    //                 <p>{user.groups}</p>
    //             </div>
    //         ))}
    //     </Paper>
    // );

    // const { classes } = useStyles();
    //
    // useEffect(() => {
    //     axios
    //         .get(url + 'roles')
    //         .then((resp) => {
    //             setAvailableRoles(resp.data.roles);
    //         })
    //         .catch((e) => {
    //             setAvailableRoles([]);
    //             console.error(e);
    //         });
    // }, [url]);
    //
    const updateGroups = (
        event: SelectChangeEvent<string[]>,
        userId: string,
        previousGroups: Groups[],
    ): void => {
        console.log('Updating roles for user', userId, 'to', event.target.value, 'previous groups', previousGroups);
        const newGroups = event.target.value as Groups[];
        const addedGroups = newGroups.filter(g => !previousGroups.includes(g));
        const removedGroups = previousGroups.filter(g => !newGroups.includes(g));

        // For simplicity, we will just add the user to the first added group and remove them from the first removed group.
        // In a real application, you would want to handle multiple changes at once and show errors for each change if they fail.
        if (addedGroups.length > 0) {
            dispatch(addUserToGroup({ userId, groupName: addedGroups[0] }));
        }
        if (removedGroups.length > 0) {
            dispatch(removeUserFromGroup({ userId, groupName: removedGroups[0] }));
        }
    };
    //
    const groupsFormControl = (rowData: User): JSX.Element => {

        // return < p>rd</p>
        return (
            <FormControl>
                <Select
                    // data-testid={`${rowData.id}-select-roles`}
                    // SelectDisplayProps={
                    //     {
                    //         'data-testid': `${rowData.id}-select-roles-button`,
                    //     } as UsersSelectDisplayProps
                    // }
                    multiple
                    value={rowData.groups}
                    onChange={(event) => updateGroups(event, rowData.id, rowData.groups)}
                    // renderValue={(selected) =>
                    //     (selected as string[]).sort().join(', ')
                    // }
                >
                    {availableRoles.map((role) => (
                        <MenuItem key={role} value={role}>
                            {role}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    };
    //
    return (
        <Paper>
            {error && (
                <MuiAlert
                    // classes={{ root: classes.alert }}
                    variant="filled"
                    severity="error"
                >
                    {error}
                </MuiAlert>
            )}
            <MaterialTable
                tableRef={tableRef}
                title={<Typography>Users</Typography>}
                columns={[
                    // ...((user?.roles ?? []).includes(Role.Admin)
                    //     ? [
                    //         // TODO: move to the left of selection checkboxes when possible
                    //         // https://github.com/mbrn/material-table/issues/2317
                    //         {
                    //             cellStyle: {
                    //                 padding: '0',
                    //             },
                    //             render: (rowData: TableRow): JSX.Element => (
                    //                 <RowMenu
                    //                     myId={user?.id ?? ''}
                    //                     rowId={rowData.id}
                    //                     rowData={rowData}
                    //                     refreshData={(): void =>
                    //                         tableRef.current.onQueryChange()
                    //                     }
                    //                     setError={(error): void =>
                    //                         setError(error)
                    //                     }
                    //                 />
                    //             ),
                    //         },
                    //     ]
                    //     : []),
                    // {
                    //     title: 'id',
                    //     field: 'id',
                    //     hidden: true,
                    // },
                    // {
                    //     title: 'Picture',
                    //     field: 'picture',
                    //     editable: 'never',
                    //     render: (rowData): JSX.Element => (
                    //         <Avatar src={rowData.picture} alt="avatar" />
                    //     ),
                    //     width: '3em',
                    // },
                    // {
                    //     title: 'Name',
                    //     field: 'name',
                    //     type: 'string',
                    // },
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
                            groupsFormControl(rowData),
                    },
                ]}
                data={users}
                components={{
                    Container: (props): JSX.Element => (
                        <Paper elevation={0} {...props}></Paper>
                    ),
                }}
                style={{ fontFamily: 'Inter' }}
                options={{
                    search: false,
                    filtering: false,
                    padding: 'dense',
                    draggable: false, // No need to be able to drag and drop headers.
                    pageSize: pageSize,
                    pageSizeOptions: [5, 10, 20, 50, 100],
                    paginationPosition: 'bottom',
                    // toolbar: false,
                    headerStyle: {
                        zIndex: 1,
                    },
                    emptyRowsWhenPaging: false,
                }}
                onRowsPerPageChange={(newPageSize: number) => {
                    setPageSize(newPageSize);
                    tableRef.current.onQueryChange();
                }}
                isLoading={isLoading}
            />
        </Paper>
    );
};

export default ManageUsers;
