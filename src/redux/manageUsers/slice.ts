import { createSlice } from '@reduxjs/toolkit';
import {getUsers, addUserToGroup, deleteUser, removeUserFromGroup} from './thunk';
import {User} from "../../models/User.ts";

interface ManageUsersState {
    isLoading: boolean;
    users: User[];
    error: string | undefined;
}

const initialState: ManageUsersState = {
    isLoading: false,
    users: [],
    error: undefined,
};

const manageUsersSlice = createSlice({
    name: 'manageUsers',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getUsers.pending, (state) => {
            state.error = undefined;
            state.isLoading = true;
        });
        builder.addCase(getUsers.fulfilled, (state, action) => {
            state.isLoading = false;
            state.users = action.payload;
        });
        builder.addCase(getUsers.rejected, (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
            state.users = [];
        });
        builder.addCase(addUserToGroup.pending, (state) => {
            state.error = undefined;
            state.isLoading = true;
        });
        builder.addCase(addUserToGroup.fulfilled, (state, action) => {
            state.isLoading = false;
            state.users =  state.users.map(user => {
                if (user.username === action.payload.username) {
                    return {
                        ...user,
                        groups: user.groups.includes(action.payload.groupName)
                            ? user.groups
                            : [...user.groups, action.payload.groupName],
                    };
                }
                return user;
            });
        });
        builder.addCase(addUserToGroup.rejected, (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        });
        builder.addCase(removeUserFromGroup.pending, (state) => {
            state.error = undefined;
            state.isLoading = true;
        });
        builder.addCase(removeUserFromGroup.fulfilled, (state, action) => {
            state.isLoading = false;
            state.users =  state.users.map(user => {
                if (user.username === action.payload.username) {
                    return {
                        ...user,
                        groups: user.groups.filter(group => group !== action.payload.groupName),
                    };
                }
                return user;
            });
        });
        builder.addCase(removeUserFromGroup.rejected, (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        });
        builder.addCase(deleteUser.pending, (state) => {
            state.error = undefined;
            state.isLoading = true;
        });
        builder.addCase(deleteUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.users =  state.users.filter(user => user.username !== action.payload);
        });
        builder.addCase(deleteUser.rejected, (state, action) => {
            state.error = action.payload as string | undefined;
            state.isLoading = false;
        });
    },
});

export default manageUsersSlice.reducer;
