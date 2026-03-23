import { describe, it, expect, vi } from 'vitest';
import { selectAvailableCountries, selectS3Files, selectIsLoading } from '../selectors.ts';
import { RootState } from '../../store.ts';

vi.mock('aws-amplify/data', () => ({
    generateClient: vi.fn(),
}));

describe('DataDownloads Selectors', () => {
    const mockState = {
        dengueGeodata: {
            availableCountries: {Barbados: 'Barbados'},
            s3Files: [{ filename: 'test.csv', name: 'test.csv' }],
            isLoading: true,
            error: undefined
        }
    } as unknown as RootState;

    it('should select selectAvailableCountries', () => {
        expect(selectAvailableCountries(mockState)).toEqual({Barbados: 'Barbados'});
    });

    it('should select s3Files', () => {
        expect(selectS3Files(mockState)).toEqual([{ filename: 'test.csv', name: 'test.csv' }]);
    });

    it('should select isLoading', () => {
        expect(selectIsLoading(mockState)).toBe(true);
    });
});
