import {createSlice} from '@reduxjs/toolkit';
import {ScheduleConfig} from '../../models/ScheduleConfig';
import {getScheduleConfigs, createScheduleConfig, deleteScheduleConfig} from './thunk';

interface MapDataAggregationState {
    isLoading: boolean;
    scheduleConfigs: ScheduleConfig[];
    error: string | undefined;
}

const initialState: MapDataAggregationState = {
    isLoading: false,
    scheduleConfigs: [],
    error: undefined,
};

const mapDataAggregationSlice = createSlice({
    name: 'mapDataAggregation',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getScheduleConfigs.pending, (state) => {
            state.error = undefined;
            state.isLoading = true;
        });
        builder.addCase(getScheduleConfigs.fulfilled, (state, action) => {
            state.isLoading = false;
            state.scheduleConfigs = action.payload;
        });
        builder.addCase(getScheduleConfigs.rejected, (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
            state.scheduleConfigs = [];
        });
        builder.addCase(createScheduleConfig.pending, (state) => {
            state.error = undefined;
            state.isLoading = true;
        });
        builder.addCase(createScheduleConfig.fulfilled, (state, action) => {
            state.isLoading = false;
            state.scheduleConfigs.push(action.payload);
        });
        builder.addCase(createScheduleConfig.rejected, (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        });
        builder.addCase(deleteScheduleConfig.pending, (state) => {
            state.error = undefined;
            state.isLoading = true;
        });
        builder.addCase(deleteScheduleConfig.fulfilled, (state, action) => {
            state.isLoading = false;
            state.scheduleConfigs = state.scheduleConfigs.filter(
                (config) => config.id !== action.payload,
            );
        });
        builder.addCase(deleteScheduleConfig.rejected, (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        });
    },
});

export default mapDataAggregationSlice.reducer;

