import { createSlice } from '@reduxjs/toolkit';
import {getFilesFromMetadata, handleDownload} from './thunk';

export type S3File = {
    country: string;
    filename: string;
    name: string;
}

interface DengueGeodataState {
    isLoading: boolean;
    s3Files: S3File[];
    availableCountries: {[key: string]: string};
    error: string | undefined;
}

const initialState: DengueGeodataState = {
    isLoading: false,
    s3Files: [],
    availableCountries: {},
    error: undefined,
};

const dengueGeodataSlice = createSlice({
    name: 'dengueGeodata',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getFilesFromMetadata.pending, (state) => {
            state.error = undefined;
            state.isLoading = true;
        });
        builder.addCase(getFilesFromMetadata.fulfilled, (state, action) => {
            state.isLoading = false;
            state.s3Files = action.payload.files;
            state.availableCountries = action.payload.availableCountries;
        });
        builder.addCase(getFilesFromMetadata.rejected, (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
            state.s3Files = [];
        });
        builder.addCase(handleDownload.pending, (state) => {
            state.error = undefined;
            state.isLoading = true;
        });
        builder.addCase(handleDownload.fulfilled, (state) => {
            state.isLoading = false;
        });
        builder.addCase(handleDownload.rejected, (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        });
    },
});

export default dengueGeodataSlice.reducer;
