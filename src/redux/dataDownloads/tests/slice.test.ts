import { describe, it, expect, vi } from 'vitest';
import dataDownloadsReducer, { setS3Folder, S3Folder } from '../slice.ts';
import { getFilesFromS3Folder, handleDownload } from '../thunk.ts';

// Mock Amplify to suppress configuration warnings
vi.mock('aws-amplify/data', () => ({
    generateClient: vi.fn(),
}));

describe('DataDownloads Slice', () => {
    const initialState = {
        isLoading: false,
        s3Folder: S3Folder.All,
        s3Files: [],
        error: undefined,
    };

    it('should handle initial state', () => {
        expect(dataDownloadsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setS3Folder', () => {
        const action = setS3Folder(S3Folder.AvianInfluenza);
        const state = dataDownloadsReducer(initialState, action);
        expect(state.s3Folder).toBe(S3Folder.AvianInfluenza);
    });

    describe('getFilesFromS3Folder', () => {
        it('should handle pending', () => {
            const action = { type: getFilesFromS3Folder.pending.type };
            const state = dataDownloadsReducer(initialState, action);
            expect(state.isLoading).toBe(true);
            expect(state.error).toBeUndefined();
        });

        it('should handle fulfilled', () => {
            const mockFiles = [{ filename: 'file1.csv', name: 'file1.csv' }];
            const action = { type: getFilesFromS3Folder.fulfilled.type, payload: mockFiles };
            const state = dataDownloadsReducer(initialState, action);
            expect(state.isLoading).toBe(false);
            expect(state.s3Files).toEqual(mockFiles);
        });

        it('should handle rejected', () => {
            const error = 'Fetch error';
            const action = { type: getFilesFromS3Folder.rejected.type, payload: error };
            const state = dataDownloadsReducer(initialState, action);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(error);
            expect(state.s3Files).toEqual([]);
        });
    });

    describe('handleDownload', () => {
        it('should handle pending', () => {
            const action = { type: handleDownload.pending.type };
            const state = dataDownloadsReducer(initialState, action);
            expect(state.isLoading).toBe(true);
            expect(state.error).toBeUndefined();
        });

        it('should handle fulfilled', () => {
            const action = { type: handleDownload.fulfilled.type };
            const state = dataDownloadsReducer({ ...initialState, isLoading: true }, action);
            expect(state.isLoading).toBe(false);
        });

        it('should handle rejected', () => {
            const error = 'Download error';
            const action = { type: handleDownload.rejected.type, payload: error };
            const state = dataDownloadsReducer({ ...initialState, isLoading: true }, action);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(error);
        });
    });
});
