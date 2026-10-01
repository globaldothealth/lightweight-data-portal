import {createSlice} from '@reduxjs/toolkit';
import {uploadDataToS3} from './thunk';

interface UploadDataState {
    isLoading: boolean;
    error: string | undefined;
    isUploaded: boolean;
}

const initialState: UploadDataState = {
    isLoading: false,
    error: undefined,
    isUploaded: false,
};

const uploadDataSlice = createSlice({
    name: 'uploadData',
    initialState,
    reducers: {
        resetUploadState: (state) => {
            state.isLoading = false;
            state.error = undefined;
            state.isUploaded = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(uploadDataToS3.pending, (state) => {
            state.error = undefined;
            state.isLoading = true;
            state.isUploaded = false;
        });
        builder.addCase(uploadDataToS3.fulfilled, (state) => {
            state.isLoading = false;
            state.isUploaded = true;
        });
        builder.addCase(uploadDataToS3.rejected, (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
            state.isUploaded = false;
        });
    },
});

export const { resetUploadState } = uploadDataSlice.actions;

export default uploadDataSlice.reducer;
