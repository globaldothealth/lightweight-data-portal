import { describe, it, expect, vi } from 'vitest';
import { selectS3Folder, selectS3Files, selectIsLoading } from './selectors';
import { RootState } from '../store';
import { S3Folder } from './slice';

vi.mock('aws-amplify/data', () => ({
    generateClient: vi.fn(),
}));

describe('DataDownloads Selectors', () => {
    const mockState = {
        dataDownloads: {
            s3Folder: S3Folder.Mpox2024,
            s3Files: [{ filename: 'test.csv', name: 'test.csv' }],
            isLoading: true,
            error: undefined
        }
    } as unknown as RootState;

    it('should select s3Folder', () => {
        expect(selectS3Folder(mockState)).toBe(S3Folder.Mpox2024);
    });

    it('should select s3Files', () => {
        expect(selectS3Files(mockState)).toEqual([{ filename: 'test.csv', name: 'test.csv' }]);
    });

    it('should select isLoading', () => {
        expect(selectIsLoading(mockState)).toBe(true);
    });
});
