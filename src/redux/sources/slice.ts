import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import {
    addSnapshot,
    loadMissingSources,
    loadSnapshots,
    removeSnapshot,
    unverifySnapshotById,
    verifySnapshotById,
} from './thunk';
import type {ListState, SourcesState, SourcesTabKey} from './types';

export type {SourcesTabKey} from './types';

function emptyList<T>(): ListState<T> {
    return {outbreakName: null, items: [], loading: false, error: null, requestId: null};
}

export const initialState: SourcesState = {
    selectedTab: 'browse',
    missing: emptyList(),
    snapshots: {
        PENDING_VERIFICATION: emptyList(),
        VERIFIED: emptyList(),
    },
};

/** Starts a request. The items of another outbreak are dropped; those of the same outbreak stay until replaced. */
function startLoading<T>(list: ListState<T>, outbreakName: string, requestId: string) {
    if (list.outbreakName !== outbreakName) {
        list.items = [];
    }
    list.outbreakName = outbreakName;
    list.loading = true;
    list.error = null;
    list.requestId = requestId;
}

/** Only the latest request may finish a list; an older response is ignored. */
function finishLoading<T>(list: ListState<T>, requestId: string, items: T[], error: string | null) {
    if (list.requestId !== requestId) return;
    list.items = items;
    list.loading = false;
    list.error = error;
    list.requestId = null;
}

const sourcesSlice = createSlice({
    name: 'sources',
    initialState,
    reducers: {
        setSelectedTab: (state, action: PayloadAction<SourcesTabKey>) => {
            state.selectedTab = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadMissingSources.pending, (state, action) => {
                startLoading(state.missing, action.meta.arg, action.meta.requestId);
            })
            .addCase(loadMissingSources.fulfilled, (state, action) => {
                finishLoading(state.missing, action.meta.requestId, action.payload, null);
            })
            .addCase(loadMissingSources.rejected, (state, action) => {
                finishLoading(state.missing, action.meta.requestId, [], action.payload ?? action.error.message ?? 'Failed to load sources');
            })
            .addCase(loadSnapshots.pending, (state, action) => {
                startLoading(state.snapshots[action.meta.arg.status], action.meta.arg.outbreakName, action.meta.requestId);
            })
            .addCase(loadSnapshots.fulfilled, (state, action) => {
                finishLoading(state.snapshots[action.meta.arg.status], action.meta.requestId, action.payload, null);
            })
            .addCase(loadSnapshots.rejected, (state, action) => {
                finishLoading(
                    state.snapshots[action.meta.arg.status],
                    action.meta.requestId,
                    [],
                    action.payload ?? action.error.message ?? 'Failed to load snapshots',
                );
            })
            .addCase(verifySnapshotById.fulfilled, (state, action) => {
                const list = state.snapshots.PENDING_VERIFICATION;
                list.items = list.items.filter((snapshot) => snapshot.id !== action.payload);
            })
            .addCase(unverifySnapshotById.fulfilled, (state, action) => {
                const list = state.snapshots.VERIFIED;
                list.items = list.items.filter((snapshot) => snapshot.id !== action.payload);
            })
            .addCase(removeSnapshot.fulfilled, (state, action) => {
                Object.values(state.snapshots).forEach((list) => {
                    list.items = list.items.filter((snapshot) => snapshot.id !== action.payload);
                });
            })
            .addCase(addSnapshot.fulfilled, (state, action) => {
                // The source now has a snapshot, so it is no longer missing one.
                state.missing.items = state.missing.items.filter((source) => source.id !== action.meta.arg.source.id);
            });
    },
});

export const {setSelectedTab} = sourcesSlice.actions;

export default sourcesSlice.reducer;

