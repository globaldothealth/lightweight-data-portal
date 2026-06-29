import { describe, it, expect } from 'vitest';
import mapDataAggregationReducer from '../slice';
import { getScheduleConfigs, createScheduleConfig, deleteScheduleConfig } from '../thunk';
import {ScheduleConfig} from "../../../models/ScheduleConfig.ts";

describe('MapDataAggregation Slice', () => {
    const initialState = {
        isLoading: false,
        scheduleConfigs: [],
        error: undefined,
    };

    it('should handle initial state', () => {
        expect(mapDataAggregationReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    describe('getScheduleConfigs', () => {
        it('should handle pending', () => {
            const action = { type: getScheduleConfigs.pending.type };
            const state = mapDataAggregationReducer(initialState, action);
            expect(state.isLoading).toBe(true);
            expect(state.error).toBeUndefined();
        });

        it('should handle fulfilled', () => {
            const mockScheduleConfigs = [{ id: '1', scheduleExpression: "0 0 * * *", outbreakName: 'Ebola BVD', enabled: true }];
            const action = { type: getScheduleConfigs.fulfilled.type, payload: mockScheduleConfigs };
            const state = mapDataAggregationReducer(initialState, action);
            expect(state.isLoading).toBe(false);
            expect(state.scheduleConfigs).toEqual(mockScheduleConfigs);
        });

        it('should handle rejected', () => {
            const error = 'Fetch error';
            const action = { type: getScheduleConfigs.rejected.type, payload: error };
            const state = mapDataAggregationReducer(initialState, action);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(error);
            expect(state.scheduleConfigs).toEqual([]);
        });
    });

    describe('createScheduleConfig', () => {
        const initialState = {
            isLoading: false,
            scheduleConfigs: [],
            error: undefined,
        };

        it('should handle pending', () => {
            const action = { type: createScheduleConfig.pending.type };
            const state = mapDataAggregationReducer(initialState, action);
            expect(state.isLoading).toBe(true);
            expect(state.error).toBeUndefined();
        });

        it('should handle fulfilled', () => {
            const newScheduleConfig = { id: '1', scheduleExpression: "0 0 * * *", outbreakName: 'Ebola BVD', enabled: true };
            const action = { type: createScheduleConfig.fulfilled.type, payload: newScheduleConfig };
            const state = mapDataAggregationReducer({ ...initialState, isLoading: true }, action);
            expect(state.isLoading).toBe(false);
            expect(state.scheduleConfigs[0]).toEqual(newScheduleConfig);
        });

        it('should handle rejected', () => {
            const error = 'Add error';
            const action = { type: createScheduleConfig.rejected.type, payload: error };
            const state = mapDataAggregationReducer({ ...initialState, isLoading: true }, action);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(error);
        });
    });

    describe('deleteScheduleConfig', () => {
        const scheduleConfigId = '1';
        const scheduleConfig: ScheduleConfig = { id: scheduleConfigId, scheduleExpression: "0 0 * * *", outbreakName: 'Ebola BVD', enabled: true };
        const initialState = {
            isLoading: false,
            scheduleConfigs: [scheduleConfig],
            error: undefined,
        };

        it('should handle pending', () => {
            const action = { type: deleteScheduleConfig.pending.type };
            const state = mapDataAggregationReducer(initialState, action);
            expect(state.isLoading).toBe(true);
            expect(state.error).toBeUndefined();
        });

        it('should handle fulfilled', () => {
            const action = { type: deleteScheduleConfig.fulfilled.type, payload: scheduleConfigId };
            const state = mapDataAggregationReducer({ ...initialState, isLoading: true }, action);
            expect(state.isLoading).toBe(false);
            expect(state.scheduleConfigs).toEqual([]);
        });

        it('should handle rejected', () => {
            const error = 'Remove error';
            const action = { type: deleteScheduleConfig.rejected.type, payload: error };
            const state = mapDataAggregationReducer({ ...initialState, isLoading: true }, action);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(error);
        });
    });
});
