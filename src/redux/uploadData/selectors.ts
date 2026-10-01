import {RootState} from '../store';

export const selectIsLoading: (state: RootState) => boolean = (state) =>
    state.uploadData.isLoading;

export const selectError: (state: RootState) => string | undefined = (state) =>
    state.uploadData.error;

export const selectIsUploaded: (state: RootState) => boolean = (state) =>
    state.uploadData.isUploaded;

