import {createAsyncThunk} from '@reduxjs/toolkit';
import {getUrl, list} from "aws-amplify/storage";
import {S3File} from "./slice";
import {User} from "../../models/User.ts";
import {client} from "../../utils/amplifyClient";
import {formatBytes} from "../../utils/formatBytes.ts";

export const getFilesFromS3Folder = createAsyncThunk<S3File[],
    { s3Folder: string },
    { rejectValue: string }>(
    'dataDownloads/getFilesFromS3Folder',
    async (data, {rejectWithValue}) => {
        try {
            const result = await list({
                path: data.s3Folder,
                options: {
                    bucket: 'gh-outbreak-data'
                }
            });
            const files: S3File[] = (result.items.map((file) => ({
                filename: file.path,
                name: file.path.split('/').pop() || '',
                size: formatBytes(file.size || 0, 2),
            })).filter((file: { name: string; filename: string }) => file.name !== ''));
            if (files.length === 0) {
                return rejectWithValue('No files found in the specified S3 folder.');
            }
            return files;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unknown error occurred";
            return rejectWithValue(`Error fetching files from S3: ${message}`);
        }
    },
);

export const handleDownload = createAsyncThunk<void,
    { s3FileKey: string, user: User },
    { rejectValue: string }>(
    'dataDownloads/handleDownload',
    async (data, {rejectWithValue}) => {
        try {
            await client.models.DownloadEvent.create({
                userId: data.user.username,
                email: data.user.email,
                filename: data.s3FileKey,
                timestamp: new Date().toISOString(),
            });

            const link = await getUrl({path: data.s3FileKey, options: {bucket: 'gh-outbreak-data'}});

            window.open(link.url.toString(), '_blank', 'noopener,noreferrer');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unknown error occurred";
            return rejectWithValue(`Error downloading file from S3: ${message}`);
        }
    },
);
