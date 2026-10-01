import { describe, it, expect, vi } from 'vitest';
import { selectIsLoading, selectError, selectIsUploaded } from '../selectors';
import { RootState } from '../../store';

vi.mock('aws-amplify/storage', () => ({
    uploadData: vi.fn(),
}));

describe('UploadData Selectors', () => {
    const mockState = {
        uploadData: {
            isLoading: true,
            error: 'Upload failed',
            isUploaded: false,
        }
    } as unknown as RootState;

    it('should select isLoading', () => {
        expect(selectIsLoading(mockState)).toBe(true);
    });

    it('should select error', () => {
        expect(selectError(mockState)).toBe('Upload failed');
    });

    it('should select isUploaded', () => {
        expect(selectIsUploaded(mockState)).toBe(false);
    });

    it('should return undefined for error when there is no error', () => {
        const stateWithoutError = {
            uploadData: {
                isLoading: false,
                error: undefined,
                isUploaded: true,
            }
        } as unknown as RootState;

        expect(selectError(stateWithoutError)).toBeUndefined();
    });
});

