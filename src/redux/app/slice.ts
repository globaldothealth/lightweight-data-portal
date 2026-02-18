import { createSlice } from '@reduxjs/toolkit';
import { UserProfile } from '../../containers/App';
import { getUserProfile } from './thunk';

interface AppState {
    isLoading: boolean;
    userProfile: UserProfile | undefined;
}

const initialState: AppState = {
    isLoading: false,
    userProfile: undefined
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getUserProfile.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(getUserProfile.fulfilled, (state, action) => {
            state.userProfile = action.payload;
            state.isLoading = false;
        });
        builder.addCase(getUserProfile.rejected, (state) => {
            state.userProfile = undefined;
            state.isLoading = false;
        });
    },
});

export default appSlice.reducer;
