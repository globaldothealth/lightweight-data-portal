import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getFilesFromS3Folder, handleDownload} from '../thunk.ts';
import {getUrl, list} from 'aws-amplify/storage';
import {client} from '../../../utils/amplifyClient.ts';
import {User, Group} from "../../../models/User.ts";
import { REQUEST_STATUS } from "../../../utils/tests/testConstants.ts";

// Mock Amplify Storage
vi.mock('aws-amplify/storage', () => ({
    list: vi.fn(),
    getUrl: vi.fn(),
}));

// Mock amplify client
vi.mock('../../../utils/amplifyClient', () => ({
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
        const testFile1 = {filename: 'test-folder/file1.txt', name: 'file1.txt', size: '1 KB'};
        const testFile2 = {filename: 'test-folder/file2.jpg', name: 'file2.jpg', size: '2 KB'};
        const testFile3 = {filename: 'test-folder/'};

        it('should fulfill with formatted files list', async () => {
            vi.mocked(list).mockResolvedValue({
                items: [
                    {path: testFile1.filename, size: 1000},
                    {path: testFile2.filename, size: 2000},
                    {path: testFile3.filename},
                ]
            } as never);

            const result = await getFilesFromS3Folder(payload)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.FULFILLED);
            expect(result.payload).toEqual([testFile1, testFile2]);
            expect(list).toHaveBeenCalledWith({path: payload.s3Folder, options: {bucket: 'gh-outbreak-data'}});
        });

        it('should use an empty path when s3Folder is "All Outbreaks"', async () => {
            vi.mocked(list).mockResolvedValue({
                items: [
                    {path: testFile1.filename, size: 1000},
                ]
            } as never);

            const allOutbreaksPayload = { s3Folder: 'All Outbreaks' };
            const result = await getFilesFromS3Folder(allOutbreaksPayload)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.FULFILLED);
            expect(list).toHaveBeenCalledWith({path: '', options: {bucket: 'gh-outbreak-data'}});
        });


        it('should reject when no files are found', async () => {
            vi.mocked(list).mockResolvedValue({items: []});

            const result = await getFilesFromS3Folder(payload)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.REJECTED);
            expect(result.payload).toBe('No files found in the specified S3 folder.');
        });

        it('should reject and return error message when list call fails', async () => {
            const errorMessage = 'S3 Access Denied';
            vi.mocked(list).mockRejectedValue(new Error(errorMessage));

            const result = await getFilesFromS3Folder(payload)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.REJECTED);
            expect(result.payload).toBe(`Error fetching files from S3: ${errorMessage}`);
        });

        it('should reject and return default message for missing error message when list call fails', async () => {
            vi.mocked(list).mockRejectedValue(undefined);

            const result = await getFilesFromS3Folder(payload)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.REJECTED);
            expect(result.payload).toBe(`Error fetching files from S3: An unknown error occurred`);
        });
    });

    describe('handleDownload', () => {
        const mockUser: User = {email: 'user@example.com', username: '123', groups: [Group.RESEARCHERS]};
        const payload = {s3FileKey: 'file.txt', user: mockUser};

        it('should fulfill on successful download process', async () => {
            vi.mocked(client.models.DownloadEvent.create).mockResolvedValue({ data: {} } as never);
            vi.mocked(getUrl).mockResolvedValue({url: new URL('http://mock.url/file.txt'), expiresAt: new Date()});

            const result = await handleDownload(payload)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.FULFILLED);

            expect(client.models.DownloadEvent.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: mockUser.username,
                email: mockUser.email,
                filename: payload.s3FileKey,
            }));

            expect(getUrl).toHaveBeenCalledWith({path: payload.s3FileKey, options: {bucket: 'gh-outbreak-data'}});
            expect(window.open).toHaveBeenCalledWith('http://mock.url/file.txt', '_blank', 'noopener,noreferrer');
        });

        it('should reject with error message if handleDownload fails with error message', async () => {
            vi.mocked(client.models.DownloadEvent.create).mockRejectedValue(new Error('DB Error'));

            const result = await handleDownload(payload)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.REJECTED);
            expect(result.payload).toBe('Error downloading file from S3: DB Error');
            expect(getUrl).not.toHaveBeenCalled();
        });

        it('should reject with default message if handleDownload fails with no error message', async () => {
            vi.mocked(client.models.DownloadEvent.create).mockRejectedValue(undefined);

            const result = await handleDownload(payload)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.REJECTED);
            expect(result.payload).toBe('Error downloading file from S3: An unknown error occurred');
            expect(getUrl).not.toHaveBeenCalled();
        });

        it('should reject if getUrl fails', async () => {
            vi.mocked(client.models.DownloadEvent.create).mockResolvedValue({ data: {} } as never);
            vi.mocked(getUrl).mockRejectedValue(new Error('URL generation failed'));

            const result = await handleDownload(payload)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.REJECTED);
            expect(result.payload).toBe('Error downloading file from S3: URL generation failed');
        });
    });
});

