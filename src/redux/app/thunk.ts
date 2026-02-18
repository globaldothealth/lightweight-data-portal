import {createAsyncThunk} from '@reduxjs/toolkit';
import {fetchUserAttributes, FetchUserAttributesOutput, signOut} from "aws-amplify/auth";
import {UserProfile} from "./slice.ts";


export const getUserProfile = createAsyncThunk<UserProfile, {}, { rejectValue: string }>(
    'app/getUserProfile',
    async (_, {rejectWithValue}) => {
        const {email, sub: id}: FetchUserAttributesOutput = await fetchUserAttributes()
        if (!email || !id) {
            return rejectWithValue("User profile data missing")
        }
        return {email, id};
    },
);

export const logout = createAsyncThunk<void, {}, { rejectValue: string }>(
    'app/logout',
    async (_, {rejectWithValue}) => {
        try {
            await signOut();
        } catch (error) {
            return rejectWithValue("Logout failed");
        }
        return;
    },
);
