import {createAsyncThunk} from '@reduxjs/toolkit';
import type {SourceStatus} from '../../utils/sourceImport';
import * as snapshotsApi from '../../utils/snapshotsApi';
import type {SnapshotRecord} from '../../utils/snapshotsApi';
import type {SourceRecord} from '../../utils/sourcesApi';
import type {SourcesState} from './types';

type ThunkState = { sources: SourcesState };

/**
 * Message of an error thrown by `dispatch(thunk).unwrap()`. Thunks reject with a string, which unwrap() throws as is.
 */
export function thunkErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'string') return error;
    return error instanceof Error && error.message ? error.message : fallback;
}

export const loadMissingSources = createAsyncThunk<SourceRecord[], string, { rejectValue: string }>(
    'sources/loadMissingSources',
    async (outbreakName, {rejectWithValue}) => {
        try {
            return await snapshotsApi.fetchSourcesWithoutSnapshots(outbreakName);
        } catch (error: unknown) {
            return rejectWithValue(thunkErrorMessage(error, 'Failed to load sources'));
        }
    },
);

export const loadSnapshots = createAsyncThunk<
    SnapshotRecord[],
    { outbreakName: string; status: SourceStatus },
    { rejectValue: string }>(
    'sources/loadSnapshots',
    async ({outbreakName, status}, {rejectWithValue}) => {
        try {
            return await snapshotsApi.fetchSnapshotsForOutbreak(outbreakName, status);
        } catch (error: unknown) {
            return rejectWithValue(thunkErrorMessage(error, 'Failed to load snapshots'));
        }
    },
);

/** Verifies a snapshot. Fulfills with its id, which leaves the pending list. */
export const verifySnapshotById = createAsyncThunk<string, { id: string; verifiedBy: string }, { rejectValue: string }>(
    'sources/verifySnapshot',
    async ({id, verifiedBy}, {rejectWithValue}) => {
        try {
            await snapshotsApi.verifySnapshot(id, verifiedBy);
            return id;
        } catch (error: unknown) {
            return rejectWithValue(thunkErrorMessage(error, 'Failed to verify snapshot'));
        }
    },
);

/** Sends a snapshot back to verification. Fulfills with its id, which leaves the verified list. */
export const unverifySnapshotById = createAsyncThunk<string, string, { rejectValue: string }>(
    'sources/unverifySnapshot',
    async (id, {rejectWithValue}) => {
        try {
            await snapshotsApi.unverifySnapshot(id);
            return id;
        } catch (error: unknown) {
            return rejectWithValue(thunkErrorMessage(error, 'Failed to unverify snapshot'));
        }
    },
);

/** Deletes a snapshot and its PDF. Fulfills with its id. */
export const removeSnapshot = createAsyncThunk<string, SnapshotRecord, { rejectValue: string }>(
    'sources/removeSnapshot',
    async (snapshot, {dispatch, rejectWithValue}) => {
        try {
            await snapshotsApi.deleteSnapshot(snapshot);
            return snapshot.id;
        } catch (error: unknown) {
            // The record may already be gone even if the PDF deletion failed, so show what is really stored.
            dispatch(loadSnapshots({outbreakName: snapshot.outbreakName, status: snapshot.status}));
            return rejectWithValue(thunkErrorMessage(error, 'Failed to remove snapshot'));
        }
    },
);

export const replaceSnapshotFile = createAsyncThunk<void, { snapshot: SnapshotRecord; file: File }, { rejectValue: string }>(
    'sources/replaceSnapshotFile',
    async ({snapshot, file}, {rejectWithValue}) => {
        try {
            await snapshotsApi.replaceSnapshotPdf(snapshot, file);
        } catch (error: unknown) {
            return rejectWithValue(thunkErrorMessage(error, 'Failed to upload PDF'));
        }
    },
);

export interface AddSnapshotArgs {
    source: SourceRecord;
    capturedAt: string;
    verifiedBy: string;
    file?: File;
}

/** Adds a verified snapshot. The source leaves the missing list, and a loaded verified list of the outbreak is reloaded. */
export const addSnapshot = createAsyncThunk<void, AddSnapshotArgs, { rejectValue: string }>(
    'sources/addSnapshot',
    async ({source, capturedAt, verifiedBy, file}, {dispatch, getState, rejectWithValue}) => {
        try {
            await snapshotsApi.createSnapshot(source, capturedAt, verifiedBy, file);
        } catch (error: unknown) {
            return rejectWithValue(thunkErrorMessage(error, 'Failed to add snapshot'));
        }

        const verified = (getState() as ThunkState).sources.snapshots.VERIFIED;
        if (verified.outbreakName === source.outbreakName) {
            dispatch(loadSnapshots({outbreakName: source.outbreakName, status: 'VERIFIED'}));
        }
    },
);

