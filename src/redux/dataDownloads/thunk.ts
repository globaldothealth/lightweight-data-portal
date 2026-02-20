import {createAsyncThunk} from '@reduxjs/toolkit';
import {getUrl, list} from "aws-amplify/storage";
import {S3File} from "./slice";
import {UserProfile} from "../app/slice";
import {client} from "../../utils/amplifyClient";

export const getFilesFromS3Folder = createAsyncThunk<S3File[],
    { s3Folder: string },
    { rejectValue: string }>(
    'dataDownloads/getFilesFromS3Folder',
    async (data, {rejectWithValue}) => {
        try {
            const result: any = await list({path: `public/${data.s3Folder}/`});
            const files: S3File[] = (result.items.map((file: { path: string }) => ({
                filename: file.path,
                name: file.path.split('/').pop(),
            })).filter((file: { name: string; filename: string }) => file.name !== ''));
            if (files.length === 0) {
                return rejectWithValue('No files found in the specified S3 folder.');
            }
            return files;
        } catch (error: any) {
            const message = error?.message ? String(error.message) : 'An error occurred while listing S3 files.';
            return rejectWithValue(`Error fetching files from S3: ${message}`);
        }
    },
);

export const handleDownload = createAsyncThunk<void,
    { s3FileKey: string, user: UserProfile },
    { rejectValue: string }>(
    'dataDownloads/handleDownload',
    async (data, {rejectWithValue}) => {
        try {
            await client.models.DownloadEvent.create({
                userId: data.user.id,
                email: data.user.email,
                filename: data.s3FileKey,
                timestamp: new Date().toISOString(),
            });

            const link = await getUrl({path: data.s3FileKey});

            window.open(link.url.toString(), '_blank');
        } catch (error: any) {
            const message = error?.message ? String(error.message) : 'An error occurred while downloading S3 file.';
            return rejectWithValue(`Error downloading file from S3: ${message}`);
        }
    },
);
