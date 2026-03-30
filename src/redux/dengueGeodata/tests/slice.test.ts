import { describe, it, expect, vi } from 'vitest';
import dengueGeodataReducer from '../slice.ts';
import { getFilesFromMetadata, handleDownload } from '../thunk.ts';

// Mock Amplify to suppress configuration warnings
vi.mock('aws-amplify/data', () => ({
    generateClient: vi.fn(),
}));

describe('DengueGeodata Slice', () => {
    const initialState = {
        isLoading: false,
        availableCountries: {},
        s3Files: [],
        error: undefined,
    };

    it('should handle initial state', () => {
        expect(dengueGeodataReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    describe('getFilesFromMetadata', () => {
        it('should handle pending', () => {
            const action = { type: getFilesFromMetadata.pending.type };
            const state = dengueGeodataReducer(initialState, action);
            expect(state.isLoading).toBe(true);
            expect(state.error).toBeUndefined();
        });

        it('should handle fulfilled', () => {
            const files = [{ filename: 'file1.csv', name: 'file1.csv' }]
            const availableCountries = {Barbados: 'Barbados'};
            const mockPayload = {files , availableCountries};
            const action = { type: getFilesFromMetadata.fulfilled.type, payload: mockPayload };
            const state = dengueGeodataReducer(initialState, action);
            expect(state.isLoading).toBe(false);
            expect(state.s3Files).toEqual(files);
            expect(state.availableCountries).toEqual(availableCountries);
        });

        it('should handle rejected', () => {
            const error = 'Fetch error';
            const action = { type: getFilesFromMetadata.rejected.type, payload: error };
            const state = dengueGeodataReducer(initialState, action);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(error);
            expect(state.s3Files).toEqual([]);
        });
    });

    describe('handleDownload', () => {
        it('should handle pending', () => {
            const action = { type: handleDownload.pending.type };
            const state = dengueGeodataReducer(initialState, action);
            expect(state.isLoading).toBe(true);
            expect(state.error).toBeUndefined();
        });

        it('should handle fulfilled', () => {
            const action = { type: handleDownload.fulfilled.type };
            const state = dengueGeodataReducer({ ...initialState, isLoading: true }, action);
            expect(state.isLoading).toBe(false);
        });

        it('should handle rejected', () => {
            const error = 'Download error';
            const action = { type: handleDownload.rejected.type, payload: error };
            const state = dengueGeodataReducer({ ...initialState, isLoading: true }, action);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(error);
        });
    });
});
