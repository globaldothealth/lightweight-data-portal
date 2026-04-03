import {createAsyncThunk} from '@reduxjs/toolkit';
import {User, Groups} from "./slice";
import {client} from "../../utils/amplifyClient";
import {RootState} from "../store";

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

export const addUserToGroup = createAsyncThunk<{ userId: string, groupName: Groups },
    { userId: string, groupName: Groups },
    { rejectValue: string }>(
    'manageUsers/addUserToGroup',
    async (data, {rejectWithValue}) => {
        try {
            await client.mutations.addUserToGroup({
                groupName: data.groupName,
                userId: data.userId,
            })
            return { userId: data.userId, groupName: data.groupName };
        }
        catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to add user to group');
        }
    });

export const removeUserFromGroup = createAsyncThunk<{ userId: string, groupName: Groups },
    { userId: string, groupName: Groups },
    { rejectValue: string }>(
    'manageUsers/removeUserFromGroup',
    async (data, {rejectWithValue}) => {
        try {
            await client.mutations.removeUserFromGroup({
                groupName: data.groupName,
                userId: data.userId,
            })
            return { userId: data.userId, groupName: data.groupName };
        }
        catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove user from group');
        }
    });

export const deleteUser = createAsyncThunk<string,
    string,
    { rejectValue: string }>(
    'manageUsers/deleteUser',
    async (userId, {getState, rejectWithValue}) => {
        try {
            const state = getState() as RootState;
            const user = state.manageUsers.users.find((u: User) => u.id === userId);

            if (user?.groups.includes(Groups.ADMINS)) {
                return rejectWithValue('Cannot delete an admin user');
            }

            await client.mutations.deleteUser({
                userId: userId,
            });

            return userId;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete user');
        }
    });
