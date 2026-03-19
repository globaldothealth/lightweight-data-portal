import {RootState} from '../store';
import {S3File} from "./slice.ts";

export const selectS3Files: (state: RootState) => S3File[] = (
    state,
) => state.dengueGeodata.s3Files;
export const selectAvailableCountries: (state: RootState) => {[key: string]: string} = (
    state,
) => state.dengueGeodata.availableCountries;
export const selectIsLoading: (state: RootState) => boolean = (state) =>
    state.dengueGeodata.isLoading;
