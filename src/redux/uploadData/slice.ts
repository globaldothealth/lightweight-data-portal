import {createSlice} from '@reduxjs/toolkit';
import {uploadDataToS3} from './thunk';

interface UploadDataState {
    isLoading: boolean;
    error: string | undefined;
}

const initialState: UploadDataState = {
    isLoading: false,
    error: undefined,
};

const uploadDataSlice = createSlice({
    name: 'uploadData',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(uploadDataToS3.pending, (state) => {
            state.error = undefined;
            state.isLoading = true;
        });
        builder.addCase(uploadDataToS3.fulfilled, (state) => {
            state.isLoading = false;
        });
        builder.addCase(uploadDataToS3.rejected, (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        });
    },
});

export default uploadDataSlice.reducer;

