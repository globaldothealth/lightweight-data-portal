import {RootState} from '../store';
import {ScheduleConfig} from '../../models/ScheduleConfig';

export const selectScheduleConfigs: (state: RootState) => ScheduleConfig[] = (state) =>
    state.mapDataAggregation.scheduleConfigs;
export const selectIsLoading: (state: RootState) => boolean = (state) =>
    state.mapDataAggregation.isLoading;
export const selectError: (state: RootState) => string | undefined = (state) =>
    state.mapDataAggregation.error;

