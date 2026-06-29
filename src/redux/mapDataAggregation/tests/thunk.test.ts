import {vi, describe, it, expect, beforeEach} from 'vitest';
import {getScheduleConfigs, createScheduleConfig, deleteScheduleConfig} from '../thunk';
import {client} from '../../../utils/amplifyClient';
import {REQUEST_STATUS} from "../../../utils/tests/testConstants.ts";


vi.mock('../../../utils/amplifyClient', () => ({
    client: {
        models: {
            ScheduleConfig: {
                list: vi.fn(),
                create: vi.fn(),
                delete: vi.fn(),
            }
        },
    }
}));

vi.mock('../../../amplify_outputs.json', () => ({
    default: {
        auth: {
            aws_region: 'us-east-1',
            user_pool_id: 'test-user-pool',
        }
    }
}));

describe('MapDataAggregation thunks', () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getScheduleConfigs', () => {
        const scheduleConfig = { id: '1', scheduleExpression: "0 0 * * *", outbreakName: 'Ebola BVD', enabled: true };

        it('should fulfill with schedule configs on successful fetch', async () => {
            const mockedScheduleConfigs = [scheduleConfig];
            vi.mocked(client.models.ScheduleConfig.list).mockResolvedValue({data: JSON.stringify(mockedScheduleConfigs)} as never);

            const result = await getScheduleConfigs()(mockDispatch, vi.fn(), undefined);

            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.FULFILLED);
            expect(result.payload).toEqual(JSON.stringify(mockedScheduleConfigs));
        });

        it('should reject when error occurs', async () => {
            vi.mocked(client.models.ScheduleConfig.list).mockRejectedValue(new Error('Failed to fetch schedule configurations') as never);

            const result = await getScheduleConfigs()(mockDispatch, vi.fn(), undefined);

            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.REJECTED);
            expect(result.payload).toBe('Failed to fetch schedule configurations');
        });
    });

    describe('createScheduleConfig', () => {
        const scheduleConfigParams = { scheduleExpression: "0 0 * * *", outbreakName: 'Ebola BVD', enabled: true };

        it('should fulfill on successful creation', async () => {
            const createdConfig = {id: '1', ...scheduleConfigParams};
            vi.mocked(client.models.ScheduleConfig.create).mockResolvedValue({data: createdConfig} as never);

            const result = await createScheduleConfig(scheduleConfigParams)(mockDispatch, vi.fn(), undefined);

            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.FULFILLED);
            expect(result.payload).toEqual(createdConfig);
            expect(client.models.ScheduleConfig.create).toHaveBeenCalledWith(scheduleConfigParams);
        });

        it('should reject on error', async () => {
            vi.mocked(client.models.ScheduleConfig.create).mockRejectedValue(new Error('failed'));

            const result = await createScheduleConfig(scheduleConfigParams)(mockDispatch, vi.fn(), undefined);

            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.REJECTED);
            expect(result.payload).toBe('failed');
        });
    });

    describe('deleteScheduleConfig', () => {
        const scheduleConfigId = '1'
        const scheduleConfig = { id: scheduleConfigId, scheduleExpression: "0 0 * * *", outbreakName: 'Ebola BVD', enabled: true };

        it('should fulfill on successful deletion', async () => {
            const mockGetState = vi.fn().mockReturnValue({
                scheduleConfigs: [scheduleConfig]
            });

            vi.mocked(client.models.ScheduleConfig.delete).mockResolvedValue({} as never);

            const result = await deleteScheduleConfig(scheduleConfigId)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.FULFILLED);
            expect(result.payload).toBe(scheduleConfigId);
            expect(client.models.ScheduleConfig.delete).toHaveBeenCalledWith({id: scheduleConfigId});
        });

        it('should reject when deleting non existing', async () => {
            const errorMessage = 'Cannot delete schedule configuration with id 2 because it does not exist in the current state.';
            const mockGetState = vi.fn().mockReturnValue({
                scheduleConfigs: [scheduleConfig]
            });
            vi.mocked(client.models.ScheduleConfig.delete).mockRejectedValue(new Error(errorMessage));

            const result = await deleteScheduleConfig('2')(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.REJECTED);
            expect(result.payload).toBe(errorMessage);
        });
    });
});
