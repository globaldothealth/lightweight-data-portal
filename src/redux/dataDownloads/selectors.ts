import {RootState} from '../store';
import {S3File, S3Folder} from "./slice.ts";

export const selectS3Folder: (state: RootState) => S3Folder = (
    state,
) => state.dataDownloads.s3Folder;
export const selectS3Files: (state: RootState) => S3File[] = (
    state,
) => state.dataDownloads.s3Files;
export const selectIsLoading: (state: RootState) => boolean = (state) =>
    state.dataDownloads.isLoading;
