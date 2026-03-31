import { createSlice } from '@reduxjs/toolkit';
import {getUsers, addUserToGroup, removeUserFromGroup} from './thunk';

export enum Groups {
    ADMINS = 'ADMINS',
    CURATORS = 'CURATORS',
    JUNIOR_CURATORS = 'JUNIOR-CURATORS',
    RESEARCHERS = 'RESEARCHERS',
}

export type User = {
    id: string;
    email: string,
    groups: Groups[],
}

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
                if (user.id === action.payload.userId) {
                    return {
                        ...user,
                        groups: [...user.groups, action.payload.groupName],
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
                if (user.id === action.payload.userId) {
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
    },
});

export default manageUsersSlice.reducer;
