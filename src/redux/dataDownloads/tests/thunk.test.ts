import {vi, describe, it, expect, beforeEach} from 'vitest';
import {getFilesFromS3Folder, handleDownload} from '../thunk.ts';
import {list, getUrl} from 'aws-amplify/storage';
import {client} from '../../../utils/amplifyClient.ts';

// Mock Amplify Storage
vi.mock('aws-amplify/storage', () => ({
    list: vi.fn(),
    getUrl: vi.fn(),
}));

// Mock amplify client
vi.mock('../../utils/amplifyClient', () => ({
    client: {
        models: {
            DownloadEvent: {
                create: vi.fn(),
            },
        },
    },
}));

describe('DataDownloads thunks', () => {
    const mockDispatch = vi.fn();
    const mockGetState = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset window.open mock if it exists
        vi.stubGlobal('open', vi.fn());
    });

    describe('getFilesFromS3Folder', () => {
        const payload = {s3Folder: 'test-folder'};
        const testFile1 = {filename: 'public/test-folder/file1.txt', name: 'file1.txt'};
        const testFile2 = {filename: 'public/test-folder/file2.jpg', name: 'file2.jpg'};
        const testFile3 = {filename: 'public/test-folder/'};

        it('should fulfill with formatted files list', async () => {
            vi.mocked(list).mockResolvedValue({
                items: [
                    {path: testFile1.filename},
                    {path: testFile2.filename},
                    {path: testFile3.filename},
                ]
            } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

            const result = await getFilesFromS3Folder(payload)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('fulfilled');
            expect(result.payload).toEqual([testFile1, testFile2]);
            expect(list).toHaveBeenCalledWith({path: `public/${payload.s3Folder}/`});
        });

        it('should reject when no files are found', async () => {
            vi.mocked(list).mockResolvedValue({items: []});

            const result = await getFilesFromS3Folder(payload)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe('No files found in the specified S3 folder.');
        });

        it('should reject when list call fails', async () => {
            const errorMessage = 'S3 Access Denied';
            vi.mocked(list).mockRejectedValue(new Error(errorMessage));

            const result = await getFilesFromS3Folder(payload)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe(`Error fetching files from S3: ${errorMessage}`);
        });
    });

    describe('handleDownload', () => {
        const mockUser = {email: 'user@example.com', id: '123'};
        const payload = {s3FileKey: 'public/file.txt', user: mockUser};

        it('should fulfill on successful download process', async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            vi.mocked(client.models.DownloadEvent.create).mockResolvedValue({ data: {} } as any);
            vi.mocked(getUrl).mockResolvedValue({url: new URL('http://mock.url/file.txt'), expiresAt: new Date()});

            const result = await handleDownload(payload)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('fulfilled');

            expect(client.models.DownloadEvent.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: mockUser.id,
                email: mockUser.email,
                filename: payload.s3FileKey,
            }));

            expect(getUrl).toHaveBeenCalledWith({path: payload.s3FileKey});
            expect(window.open).toHaveBeenCalledWith('http://mock.url/file.txt', '_blank');
        });

        it('should reject if DownloadEvent logging fails', async () => {
            vi.mocked(client.models.DownloadEvent.create).mockRejectedValue(new Error('DB Error'));

            const result = await handleDownload(payload)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe('Error downloading file from S3: DB Error');
            expect(getUrl).not.toHaveBeenCalled();
        });

        it('should reject if getUrl fails', async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            vi.mocked(client.models.DownloadEvent.create).mockResolvedValue({ data: {} } as any);
            vi.mocked(getUrl).mockRejectedValue(new Error('URL generation failed'));

            const result = await handleDownload(payload)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe('Error downloading file from S3: URL generation failed');
        });
    });
});

