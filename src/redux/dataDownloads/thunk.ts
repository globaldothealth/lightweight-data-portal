import {createAsyncThunk} from '@reduxjs/toolkit';
import {list} from "aws-amplify/storage";
import {S3File} from "./slice";

export const getFilesFromS3Folder = createAsyncThunk<S3File[],
    { s3Folder: string },
    { rejectValue: string }>(
    'dataDownloads/getFilesFromS3Folder',
    async (data, {rejectWithValue}) => {
        const result: any = await list({path: `public/${data.s3Folder}/`});
        const files: S3File[] = (result.items.map((file: { path: string }) => ({
            filename: file.path,
            name: file.path.split('/').pop(),
        })).filter((file: { name: string; filename: string }) => file.name !== ''));
        if (files.length === 0) {
            return rejectWithValue('No files found in the specified S3 folder.');
        }
        return files;
    },
);
