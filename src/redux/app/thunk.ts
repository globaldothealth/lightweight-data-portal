import {createAsyncThunk} from '@reduxjs/toolkit';
import {fetchUserAttributes, FetchUserAttributesOutput, fetchAuthSession, signOut} from "aws-amplify/auth";
import {UserProfile} from "./slice.ts";


export const getUserProfile = createAsyncThunk<UserProfile, void, { rejectValue: string }>(
    'app/getUserProfile',
    async (_, {rejectWithValue}) => {
        const {email, sub: id}: FetchUserAttributesOutput = await fetchUserAttributes()

        const session = await fetchAuthSession();
        const groups = (session.tokens?.accessToken?.payload['cognito:groups'] as string[]) || [];

        if (!email || !id) {
            return rejectWithValue("User profile data missing")
        }
        return {email, id, groups};
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
