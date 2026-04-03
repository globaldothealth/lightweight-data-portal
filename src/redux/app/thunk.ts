import {createAsyncThunk} from '@reduxjs/toolkit';
import {signOut} from "aws-amplify/auth";
import {UserProfile} from "./slice.ts";
import {client} from "../../utils/amplifyClient";


export const getUserProfile = createAsyncThunk<UserProfile, void, { rejectValue: string }>(
    'app/getUserProfile',
    async (_, {rejectWithValue}) => {
        try {
            const response = await client.queries.getUserProfile({});
            const data = response.data;
            return (typeof data === 'string' ? JSON.parse(data) : data) as UserProfile;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user profile');
        }
    },
);

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
    'app/logout',
    async (_, {rejectWithValue}) => {
        try {
            await signOut();
        } catch (error: unknown) {
            const {message} = error as Error;
            return rejectWithValue(`Logout failed: ${message}`);
        }
        return;
    },
);
