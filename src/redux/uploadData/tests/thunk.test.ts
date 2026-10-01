import {beforeEach, describe, expect, it, vi} from 'vitest';
import {uploadDataToS3} from '../thunk';
import {uploadData} from 'aws-amplify/storage';
import {REQUEST_STATUS} from '../../../utils/tests/testConstants';

vi.mock('aws-amplify/storage', () => ({
    uploadData: vi.fn(),
}));

describe('UploadData thunk', () => {
    const mockDispatch = vi.fn();
    const mockGetState = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fulfill when upload succeeds', async () => {
        vi.mocked(uploadData).mockResolvedValue({
            result: Promise.resolve(undefined)
        } as never);

        const result = await uploadDataToS3({
            file: new File(['content'], 'test.csv', {type: 'text/csv'}),
            outbreakName: 'Ebola BVD',
        })(mockDispatch, mockGetState, undefined);

        expect(result.meta.requestStatus).toBe(REQUEST_STATUS.FULFILLED);
        expect(uploadData).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.any(File),
                options: {
                    bucket: 'gh-outbreak-data',
                    contentType: 'text/csv',
                },
            })
        );
    });

    it('should reject and return default error message when upload fails without an error message', async () => {
        vi.mocked(uploadData).mockResolvedValue({
            result: Promise.reject(undefined)
        } as never);

        const result = await uploadDataToS3({
            file: new File(['content'], 'test.csv', {type: 'text/csv'}),
            outbreakName: 'Ebola BVD',
        })(mockDispatch, mockGetState, undefined);

        expect(result.meta.requestStatus).toBe(REQUEST_STATUS.REJECTED);
        expect(result.payload).toBe('Error uploading file to S3: An unknown error occurred');
    });

    it('should reject and return the thrown error message when upload fails', async () => {
        const errorMessage = 'S3 upload denied';
        vi.mocked(uploadData).mockResolvedValue({
            result: Promise.reject(new Error(errorMessage))
        } as never);

        const result = await uploadDataToS3({
            file: new File(['content'], 'test.csv', {type: 'text/csv'}),
            outbreakName: 'Ebola BVD',
        })(mockDispatch, mockGetState, undefined);

        expect(result.meta.requestStatus).toBe(REQUEST_STATUS.REJECTED);
        expect(result.payload).toBe(`Error uploading file to S3: ${errorMessage}`);
    });
});
