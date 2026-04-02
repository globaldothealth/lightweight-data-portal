import {createAsyncThunk} from '@reduxjs/toolkit';
import {User, Groups} from "./slice";
import { fetchAuthSession } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, ListUsersCommand, AdminListGroupsForUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import config from '../../../amplify_outputs.json';
import {client} from "../../utils/amplifyClient";
import {RootState} from "../store";

export const getUsers = createAsyncThunk<User[],
    undefined,
    { rejectValue: string }>(
    'manageUsers/getUsers',
    async (_, {rejectWithValue}) => {
        try {
            const session = await fetchAuthSession();
            if (!session.credentials) {
                return rejectWithValue('No credentials');
            }

            const client = new CognitoIdentityProviderClient({
                region: config.auth.aws_region,
                credentials: session.credentials
            });

            const listUsersCommand = new ListUsersCommand({
                UserPoolId: config.auth.user_pool_id,
            });

            const { Users } = await client.send(listUsersCommand);

            const usersWithGroups: User[] = [];
            for (const u of Users || []) {
                const email = u.Attributes?.find(a => a.Name === 'email')?.Value || '';
                const id = u.Attributes?.find(a => a.Name === 'sub')?.Value || '';

                const groupResponse = await client.send(new AdminListGroupsForUserCommand({
                    UserPoolId: config.auth.user_pool_id,
                    Username: u.Username!,
                }));
                const groups = (groupResponse.Groups || []).map(g => g.GroupName as Groups);

                usersWithGroups.push({
                    id,
                    email,
                    groups
                });
            }

            return usersWithGroups;
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
