import { createAsyncThunk } from '@reduxjs/toolkit';
import {fetchUserAttributes, FetchUserAttributesOutput} from "aws-amplify/auth";

export const getUserProfile = createAsyncThunk(
    'app/getUserProfile',
    async (_, {rejectWithValue}) => {
        const {email, sub: id}: FetchUserAttributesOutput = await fetchUserAttributes()
        if (!email || !id) {
            return rejectWithValue("User profile data missing")
        }
        return {email, id};
    },
);
