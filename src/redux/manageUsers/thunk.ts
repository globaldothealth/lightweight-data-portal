import {createAsyncThunk} from '@reduxjs/toolkit';
import {client} from "../../utils/amplifyClient";
import {RootState} from "../store";
import {User, Groups} from "../../models/User.ts";

export const getUsers = createAsyncThunk<User[],
    undefined,
    { rejectValue: string }>(
    'manageUsers/getUsers',
    async (_, {rejectWithValue}) => {
        try {
            const response = await client.queries.getUsers({});
            const data = response.data;
            const users = (typeof data === 'string' ? JSON.parse(data) : data) as User[];

            return users || [];
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch users');
        }
    },
);

export const addUserToGroup = createAsyncThunk<{ username: string, groupName: Groups },
    { username: string, groupName: Groups },
    { rejectValue: string }>(
    'manageUsers/addUserToGroup',
    async (data, {rejectWithValue}) => {
        const {username, groupName} = data;
        try {
            await client.mutations.addUserToGroup({groupName, username})
            return {username, groupName};
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to add user to group');
        }
    });

export const removeUserFromGroup = createAsyncThunk<{ username: string, groupName: Groups },
    { username: string, groupName: Groups },
    { rejectValue: string }>(
    'manageUsers/removeUserFromGroup',
    async (data, {rejectWithValue}) => {
        const {username, groupName} = data;
        try {
            await client.mutations.removeUserFromGroup({groupName, username})
            return {username, groupName};
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove user from group');
        }
    });

export const deleteUser = createAsyncThunk<string,
    string,
    { rejectValue: string }>(
    'manageUsers/deleteUser',
    async (username, {getState, rejectWithValue}) => {
        try {
            const state = getState() as RootState;
            const user = state.manageUsers.users.find((u: User) => u.username === username);

            if (user?.groups.includes(Groups.ADMINS)) {
                return rejectWithValue('Cannot delete an admin user');
            }

            await client.mutations.deleteUser({username});

            return username;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete user');
        }
    });
