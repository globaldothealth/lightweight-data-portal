import {vi, describe, it, expect, beforeEach} from 'vitest';
import {getFilesFromMetadata, handleDownload} from '../thunk.ts';
import {getUrl, downloadData} from 'aws-amplify/storage';
import {client} from '../../../utils/amplifyClient.ts';

// Mock Amplify Storage
vi.mock('aws-amplify/storage', () => ({
    list: vi.fn(),
    getUrl: vi.fn(),
    downloadData: vi.fn(),
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

describe('DengueGeodata thunks', () => {
    const mockDispatch = vi.fn();
    const mockGetState = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset window.open mock if it exists
        vi.stubGlobal('open', vi.fn());
    });

    describe('getFilesFromMetadata', () => {
        const testFile1Name = 'file1.txt';
        const testFile2Name = 'file2.jpg';
        const testFile1 = {filename: `public/test-folder/${testFile1Name}`, country: 'Barbados'};
        const testFile2 = {filename: `public/test-folder/${testFile2Name}`, country: 'Brazil'};
        const testFile3 = {filename: `public/test-folder/`, country: 'Brazil'};

        it('should fulfill with formatted files list', async () => {
            vi.mocked(downloadData).mockReturnValue({
                result: Promise.resolve({
                    body: {
                        text: async () => JSON.stringify([testFile1, testFile2, testFile3]),
                    },
                }),
            } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

            const result = await getFilesFromMetadata()(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('fulfilled');
            expect(result.payload).toEqual({
                availableCountries: {Barbados: 'Barbados', Brazil: 'Brazil'},
                files: [{...testFile1, name: testFile1Name}, {...testFile2, name: testFile2Name}]
            });
            expect(downloadData).toHaveBeenCalled();
        });

        it('should reject when no files are found', async () => {
            vi.mocked(downloadData).mockReturnValue({
                result: Promise.resolve({
                    body: {
                        text: async () => JSON.stringify([]),
                    },
                }),
            } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

            const result = await getFilesFromMetadata()(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe('No files found in the specified S3 folder.');
        });

        it('should reject and return error message when dataDownload call fails', async () => {
            vi.mocked(downloadData).mockRejectedValue(new Error("Network Error"));

            const result = await getFilesFromMetadata()(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe(`Error fetching metadata.json.`);
        });

        it('should reject and return error message when Json file is broken', async () => {
            vi.mocked(downloadData).mockReturnValue({
                result: Promise.resolve({
                    body: {
                        text: async () => undefined,
                    },
                }),
            } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

            const result = await getFilesFromMetadata()(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe('Error fetching files from S3: "undefined" is not valid JSON');
        });

        it('should reject with generic message when error is not an Error instance', async () => {
            vi.mocked(downloadData).mockReturnValue({
                result: Promise.resolve({
                    body: {
                        text: () => Promise.reject('Just a string error'),
                    },
                }),
            } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

            const result = await getFilesFromMetadata()(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe('Error fetching files from S3: An unknown error occurred');
        });


    });

    describe('handleDownload', () => {
        const mockUser = {email: 'user@example.com', id: '123'};
        const payload = {s3FileKey: 'public/file.txt', user: mockUser};

        it('should fulfill on successful download process for gh-data-downloads bucket', async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            vi.mocked(client.models.DownloadEvent.create).mockResolvedValue({data: {}} as any);
            vi.mocked(getUrl).mockResolvedValue({url: new URL('http://mock.url/file.txt'), expiresAt: new Date()});

            const result = await handleDownload(payload)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('fulfilled');

            expect(client.models.DownloadEvent.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: mockUser.id,
                email: mockUser.email,
                filename: payload.s3FileKey,
            }));

            expect(getUrl).toHaveBeenCalledWith({path: payload.s3FileKey, options: {bucket: 'gh-data-downloads'}});
            expect(window.open).toHaveBeenCalledWith('http://mock.url/file.txt', '_blank', 'noopener,noreferrer');
        });

        it('should fulfill on successful download process for global-dengue-forecasting', async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            vi.mocked(client.models.DownloadEvent.create).mockResolvedValue({data: {}} as any);
            vi.mocked(getUrl).mockResolvedValue({url: new URL('http://mock.url/file.txt'), expiresAt: new Date()});
            const payloadOutputBucket = {s3FileKey: 'output/file.txt', user: mockUser};

            const result = await handleDownload(payloadOutputBucket)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('fulfilled');

            expect(client.models.DownloadEvent.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: mockUser.id,
                email: mockUser.email,
                filename: payloadOutputBucket.s3FileKey,
            }));

            expect(getUrl).toHaveBeenCalledWith({
                path: payloadOutputBucket.s3FileKey,
                options: {bucket: 'global-dengue-forecasting'}
            });
            expect(window.open).toHaveBeenCalledWith('http://mock.url/file.txt', '_blank', 'noopener,noreferrer');
        });

        it('should reject with error message if handleDownload fails with error message', async () => {
            vi.mocked(client.models.DownloadEvent.create).mockRejectedValue(new Error('DB Error'));

            const result = await handleDownload(payload)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe('Error downloading file from S3: DB Error');
            expect(getUrl).not.toHaveBeenCalled();
        });

        it('should reject with default message if handleDownload fails with no error message', async () => {
            vi.mocked(client.models.DownloadEvent.create).mockRejectedValue(undefined);

            const result = await handleDownload(payload)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe('Error downloading file from S3: An unknown error occurred');
            expect(getUrl).not.toHaveBeenCalled();
        });

        it('should reject if getUrl fails', async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            vi.mocked(client.models.DownloadEvent.create).mockResolvedValue({data: {}} as any);
            vi.mocked(getUrl).mockRejectedValue(new Error('URL generation failed'));

            const result = await handleDownload(payload)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe('Error downloading file from S3: URL generation failed');
        });
    });
});

