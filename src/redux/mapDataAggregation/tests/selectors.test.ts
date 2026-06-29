import {describe, it, expect, vi} from 'vitest';
import {selectScheduleConfigs, selectIsLoading, selectError} from '../selectors.ts';
import {RootState} from '../../store.ts';

vi.mock('aws-amplify/data', () => ({
    generateClient: vi.fn(),
}));

describe('MapDataAggregation Selectors', () => {
    const scheduleConfig1 = { id: '1', scheduleExpression: "0 0 * * *", outbreakName: 'Ebola BVD', enabled: true };
    const scheduleConfig2 = { id: '2', scheduleExpression: "0 1 * * *", outbreakName: 'Avian Influenza 2024', enabled: true };
    const errorMessage = 'error message';
    const mockState = {
        mapDataAggregation: {
            scheduleConfigs: [scheduleConfig1, scheduleConfig2],
            isLoading: true,
            error: errorMessage
        }
    } as unknown as RootState;

    it('should select schedule configs', () => {
        expect(selectScheduleConfigs(mockState)).toEqual([scheduleConfig1, scheduleConfig2]);
    });

    it('should select isLoading', () => {
        expect(selectIsLoading(mockState)).toBe(true);
    });

    it('should select error', () => {
        expect(selectError(mockState)).toBe(errorMessage);
    });
});
