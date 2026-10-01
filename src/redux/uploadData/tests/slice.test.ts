import { describe, expect, it } from 'vitest';
import uploadDataReducer from '../slice';
import { uploadDataToS3 } from '../thunk';

describe('UploadData Slice', () => {
    const initialState = {
        isLoading: false,
        error: undefined,
        isUploaded: false,
    };

    it('should handle initial state', () => {
        expect(uploadDataReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    describe('uploadDataToS3', () => {
        it('should handle pending', () => {
            const action = { type: uploadDataToS3.pending.type };
            const state = uploadDataReducer(initialState, action);
            expect(state.isLoading).toBe(true);
            expect(state.error).toBeUndefined();
            expect(state.isUploaded).toBe(false);
        });

        it('should handle fulfilled', () => {
            const action = { type: uploadDataToS3.fulfilled.type };
            const state = uploadDataReducer({ ...initialState, isLoading: true }, action);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeUndefined();
            expect(state.isUploaded).toBe(true);
        });

        it('should handle rejected', () => {
            const error = 'Upload failed';
            const action = { type: uploadDataToS3.rejected.type, payload: error };
            const state = uploadDataReducer({ ...initialState, isLoading: true }, action);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(error);
            expect(state.isUploaded).toBe(false);
        });
    });
});
