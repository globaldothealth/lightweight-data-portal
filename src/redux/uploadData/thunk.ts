import {createAsyncThunk} from '@reduxjs/toolkit';
import {uploadData} from 'aws-amplify/storage';

export const uploadDataToS3 = createAsyncThunk<void,
    { file: File, outbreakName: string },
    { rejectValue: string }>(
    'uploadData/uploadDataToS3',
    async (data, {rejectWithValue}) => {
        try {
            const s3Path = `${data.outbreakName}/GHL2026_ebolabvd.csv`;

            await uploadData({
                path: s3Path,
                data: data.file,
                options: {
                    bucket: 'gh-outbreak-data',
                    contentType: 'text/csv',
                },
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            return rejectWithValue(`Error uploading file to S3: ${message}`);
        }
    },
);

