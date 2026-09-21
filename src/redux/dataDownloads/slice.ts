import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {getFilesFromS3Folder, handleDownload} from './thunk';

export enum S3Folder {
    All = 'All Outbreaks',
    AvianInfluenza = 'Avian Influenza',
    COVID19 = 'COVID-19',
    Ebola = 'Ebola',
    EbolaBVD = 'Ebola BVD',
    Hantavirus = 'Hantavirus',
    Marburg = 'Marburg',
    Mpox2022 = 'Mpox 2022',
    Mpox2024 ='Mpox 2024'
}

export const S3FileDates = {
    'GHL2024_avianinfluenza.csv': '2025-02-21',
    'GHL2019_covid19.tar': '2023-10-03',
    'GHL2022_ebola.csv': '2022-11-27',
    'GHL2026_hantavirus.csv': '2026-05-25',
    'GHL2023_marburg.csv': '2023-04-16',
    'GHL2022_mpox.csv': '2023-10-17',
    'GHL2024_mpox.csv': '2026-09-15'
}

export type S3File = {
    filename: string;
    name: string;
    size: string;
    lastUpdated: string;
}

interface DataDownloadsState {
    isLoading: boolean;
    s3Folder: S3Folder;
    s3Files: S3File[];
    error: string | undefined;
}

const initialState: DataDownloadsState = {
    isLoading: false,
    s3Folder: S3Folder.All,
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
