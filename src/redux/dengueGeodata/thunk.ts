import {createAsyncThunk} from '@reduxjs/toolkit';
import {getUrl, downloadData} from "aws-amplify/storage";
import {S3File} from "./slice";
import {UserProfile} from "../app/slice";
import {client} from "../../utils/amplifyClient";

export const getFilesFromMetadata = createAsyncThunk<{files: S3File[], availableCountries: {[key: string]: string}},
    undefined,
    { rejectValue: string }>(
    'dengueGeodata/getFilesFromS3Folder',
    async (_, {rejectWithValue}) => {
        try {
            const result = await downloadData({
                path: `metadata.json`,
                options: {
                    bucket: 'gh-data-downloads'
                }
            })?.result;

            if (!result) {
                return rejectWithValue('Error fetching metadata.json.');
            }
            const text = await result.body.text();
            const rawFiles = JSON.parse(text) as Omit<S3File, 'name'>[];
            const files: S3File[] = rawFiles.map((file) => {
                const name = file.filename.split('/').pop() || '';
                return {...file, name};
            }).filter(file => file.name);

            if (files.length === 0) {
                return rejectWithValue('No files found in the specified S3 folder.');
            }
            const uniqueCountries: string[] = [
                ...new Set(files.map((row: S3File) => row.country)),
            ] as string[];
            // Map countries list to dict, this is required for material table filter
            const availableCountries: {[key: string]: string} =
                uniqueCountries.reduce(
                    (
                        p: { [id: string]: string },
                        c: string,
                    ): { [id: string]: string } => {
                        p[c] = c;
                        return p;
                    },
                    {},
                )
            return {files, availableCountries}
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unknown error occurred";
            return rejectWithValue(`Error fetching files from S3: ${message}`);
        }
    },
);

export const handleDownload = createAsyncThunk<void,
    { s3FileKey: string, user: UserProfile },
    { rejectValue: string }>(
    'dengueGeodata/handleDownload',
    async (data, {rejectWithValue}) => {
        try {
            await client.models.DownloadEvent.create({
                userId: data.user.id,
                email: data.user.email,
                filename: data.s3FileKey,
                timestamp: new Date().toISOString(),
            });

            const link = await getUrl({
                path: data.s3FileKey,
                options: {
                    bucket: data.s3FileKey.startsWith('output') ? 'global-dengue-forecasting' : 'gh-data-downloads'
                }
            });

            window.open(link.url.toString(), '_blank', 'noopener,noreferrer');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unknown error occurred";
            return rejectWithValue(`Error downloading file from S3: ${message}`);
        }
    },
);
