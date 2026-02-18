import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getFilesFromS3Folder } from './thunk';

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
}

const initialState: DataDownloadsState = {
    isLoading: false,
    s3Folder: S3Folder.Mpox2024,
    s3Files: [],
};

const appSlice = createSlice({
    name: 'dataDownloads',
    initialState,
    reducers: {
        setS3Folder: (state, action: PayloadAction<S3Folder>) => {
            state.s3Folder = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getFilesFromS3Folder.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(getFilesFromS3Folder.fulfilled, (state, action) => {
            state.s3Files = action.payload;
            state.isLoading = false;
        });
        builder.addCase(getFilesFromS3Folder.rejected, (state) => {
            state.s3Files = [];
            state.isLoading = false;
        });
    },
});

export const { setS3Folder } =
    appSlice.actions;

export default appSlice.reducer;
