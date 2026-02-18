import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {getFilesFromS3Folder, handleDownload} from './thunk';

export enum S3Folder {
    Mpox2024 ='Mpox 2024', AvianInfluenza = 'Avian Influenza'
}

export type S3File = {
    filename: string;
    name: string;
}

interface DataDownloadsState {
    isLoading: boolean;
    s3Folder: S3Folder;
    s3Files: S3File[];
    error: string | undefined;
}

const initialState: DataDownloadsState = {
    isLoading: false,
    s3Folder: S3Folder.Mpox2024,
    s3Files: [],
    error: undefined,
};

const dataDownloadsSlice = createSlice({
    name: 'dataDownloads',
    initialState,
    reducers: {
        setS3Folder: (state, action: PayloadAction<S3Folder>) => {
            state.s3Folder = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getFilesFromS3Folder.pending, (state) => {
            state.error = undefined;
            state.isLoading = true;
        });
        builder.addCase(getFilesFromS3Folder.fulfilled, (state, action) => {
            state.isLoading = false;
            state.s3Files = action.payload;
        });
        builder.addCase(getFilesFromS3Folder.rejected, (state, action) => {
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

export const { setS3Folder } =
    dataDownloadsSlice.actions;

export default dataDownloadsSlice.reducer;
