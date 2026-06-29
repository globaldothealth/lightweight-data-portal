import {createAsyncThunk} from '@reduxjs/toolkit';
import {client} from '../../utils/amplifyClient';
import {ScheduleConfig} from '../../models/ScheduleConfig';

export const getScheduleConfigs = createAsyncThunk<
    ScheduleConfig[],
    undefined,
    {rejectValue: string}
>(
    'mapDataAggregation/getScheduleConfigs',
    async (_, {rejectWithValue}) => {
        try {
            if (!client.models.ScheduleConfig) {
                return rejectWithValue(
                    'ScheduleConfig model is not yet deployed. Run amplify sandbox to deploy the backend.',
                );
            }
            const response = await client.models.ScheduleConfig.list();
            return (response.data ?? []) as ScheduleConfig[];
        } catch (error: unknown) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to fetch schedule configurations',
            );
        }
    },
);

export const createScheduleConfig = createAsyncThunk<
    ScheduleConfig,
    Omit<ScheduleConfig, 'id' | 'createdAt' | 'updatedAt'>,
    {rejectValue: string}
>(
    'mapDataAggregation/createScheduleConfig',
    async (data, {rejectWithValue}) => {
        try {
            if (!client.models.ScheduleConfig) {
                return rejectWithValue('ScheduleConfig model is not yet deployed. Run amplify sandbox to deploy the backend.');
            }
            const response = await client.models.ScheduleConfig.create(data);
            return response.data as unknown as ScheduleConfig;
        } catch (error: unknown) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to create schedule configuration',
            );
        }
    },
);

export const deleteScheduleConfig = createAsyncThunk<
    string,
    string,
    {rejectValue: string}
>(
    'mapDataAggregation/deleteScheduleConfig',
    async (id, {rejectWithValue}) => {
        try {
            if (!client.models.ScheduleConfig) {
                return rejectWithValue('ScheduleConfig model is not yet deployed. Run amplify sandbox to deploy the backend.');
            }
            await client.models.ScheduleConfig.delete({id});
            return id;
        } catch (error: unknown) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to delete schedule configuration',
            );
        }
    },
);

