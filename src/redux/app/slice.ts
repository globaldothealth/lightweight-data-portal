import { createSlice } from '@reduxjs/toolkit';
import {getUserProfile, logout} from './thunk';
import {User} from "../store.ts";

interface AppState {
    error: string | undefined;
    isLoading: boolean;
    userProfile: User | undefined;
}

const initialState: AppState = {
    error: undefined,
    isLoading: false,
    userProfile: undefined
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getUserProfile.pending, (state) => {
            state.error = undefined;
            state.isLoading = true;
        });
        builder.addCase(getUserProfile.fulfilled, (state, action) => {
            state.isLoading = false;
            state.userProfile = action.payload;
        });
        builder.addCase(getUserProfile.rejected, (state, action) => {
            state.error = action.payload
            state.isLoading = false;
            state.userProfile = undefined;
        });
        builder.addCase(logout.pending, (state) => {
            state.error = undefined;
            state.isLoading = true;
        });
        builder.addCase(logout.fulfilled, (state) => {
            state.userProfile = undefined
            state.isLoading = false;
        });
        builder.addCase(logout.rejected, (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        });
    },
});

export default appSlice.reducer;
