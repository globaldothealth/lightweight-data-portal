import {describe, expect, it} from 'vitest';
import sourcesReducer, {initialState, setSelectedTab} from '../slice';
import {
    addSnapshot,
    loadMissingSources,
    loadSnapshots,
    removeSnapshot,
    unverifySnapshotById,
    verifySnapshotById,
} from '../thunk';
import type {SnapshotRecord} from '../../../utils/snapshotsApi';
import type {SourceRecord} from '../../../utils/sourcesApi';
import type {SourcesState} from '../types';

const snapshot = (id: string, status: SnapshotRecord['status'] = 'VERIFIED'): SnapshotRecord => ({
    id,
    sourceId: 'source-1',
    outbreakName: 'Ebola BVD',
    capturedAt: '2026-01-01',
    status,
    url: 'https://example.com/a',
});

const source = (id: string): SourceRecord => ({id, url: `https://example.com/${id}`, outbreakName: 'Ebola BVD'});

const withLists = (overrides: Partial<SourcesState>): SourcesState => ({...initialState, ...overrides});

describe('Sources Slice', () => {
    it('should handle initial state', () => {
        const state = sourcesReducer(undefined, {type: 'unknown'});
        expect(state.selectedTab).toBe('browse');
        expect(state.missing).toEqual({outbreakName: null, items: [], loading: false, error: null, requestId: null});
        expect(state.snapshots.VERIFIED.items).toEqual([]);
        expect(state.snapshots.PENDING_VERIFICATION.items).toEqual([]);
    });

    it('should handle setSelectedTab', () => {
        const state = sourcesReducer(initialState, setSelectedTab('import'));
        expect(state.selectedTab).toBe('import');
    });

    describe('loadSnapshots', () => {
        const arg = {outbreakName: 'Ebola BVD', status: 'VERIFIED'} as const;

        it('starts loading and clears items of another outbreak', () => {
            const previous = withLists({
                snapshots: {
                    ...initialState.snapshots,
                    VERIFIED: {...initialState.snapshots.VERIFIED, outbreakName: 'Mpox', items: [snapshot('old')]},
                },
            });
            const state = sourcesReducer(previous, loadSnapshots.pending('req-1', arg));
            expect(state.snapshots.VERIFIED).toMatchObject({
                outbreakName: 'Ebola BVD', items: [], loading: true, error: null, requestId: 'req-1',
            });
        });

        it('keeps the items of the same outbreak while reloading', () => {
            const loaded = sourcesReducer(
                sourcesReducer(initialState, loadSnapshots.pending('req-1', arg)),
                loadSnapshots.fulfilled([snapshot('a')], 'req-1', arg),
            );
            const state = sourcesReducer(loaded, loadSnapshots.pending('req-2', arg));
            expect(state.snapshots.VERIFIED.items).toHaveLength(1);
            expect(state.snapshots.VERIFIED.loading).toBe(true);
        });

        it('stores the result of the latest request', () => {
            const pending = sourcesReducer(initialState, loadSnapshots.pending('req-1', arg));
            const state = sourcesReducer(pending, loadSnapshots.fulfilled([snapshot('a')], 'req-1', arg));
            expect(state.snapshots.VERIFIED).toMatchObject({items: [snapshot('a')], loading: false, requestId: null});
        });

        it('ignores the response of an older request', () => {
            const first = sourcesReducer(initialState, loadSnapshots.pending('req-1', arg));
            const second = sourcesReducer(first, loadSnapshots.pending('req-2', arg));
            const state = sourcesReducer(second, loadSnapshots.fulfilled([snapshot('stale')], 'req-1', arg));
            expect(state.snapshots.VERIFIED.items).toEqual([]);
            expect(state.snapshots.VERIFIED.loading).toBe(true);
        });

        it('stores the error and empties the list when the request fails', () => {
            const pending = sourcesReducer(initialState, loadSnapshots.pending('req-1', arg));
            const state = sourcesReducer(pending, loadSnapshots.rejected(null, 'req-1', arg, 'Boom'));
            expect(state.snapshots.VERIFIED).toMatchObject({items: [], loading: false, error: 'Boom'});
        });

        it('does not touch the list of the other status', () => {
            const state = sourcesReducer(initialState, loadSnapshots.pending('req-1', arg));
            expect(state.snapshots.PENDING_VERIFICATION.loading).toBe(false);
        });
    });

    describe('loadMissingSources', () => {
        it('stores the sources of the latest request', () => {
            const pending = sourcesReducer(initialState, loadMissingSources.pending('req-1', 'Ebola BVD'));
            const state = sourcesReducer(pending, loadMissingSources.fulfilled([source('s1')], 'req-1', 'Ebola BVD'));
            expect(state.missing).toMatchObject({outbreakName: 'Ebola BVD', items: [source('s1')], loading: false});
        });

        it('stores the error when the request fails', () => {
            const pending = sourcesReducer(initialState, loadMissingSources.pending('req-1', 'Ebola BVD'));
            const state = sourcesReducer(pending, loadMissingSources.rejected(null, 'req-1', 'Ebola BVD', 'Nope'));
            expect(state.missing).toMatchObject({items: [], error: 'Nope'});
        });
    });

    describe('snapshot actions', () => {
        const state = withLists({
            snapshots: {
                PENDING_VERIFICATION: {...initialState.snapshots.PENDING_VERIFICATION, items: [snapshot('p1', 'PENDING_VERIFICATION'), snapshot('p2', 'PENDING_VERIFICATION')]},
                VERIFIED: {...initialState.snapshots.VERIFIED, items: [snapshot('v1'), snapshot('v2')]},
            },
        });

        it('verify removes the snapshot from the pending list', () => {
            const next = sourcesReducer(state, verifySnapshotById.fulfilled('p1', 'req', {id: 'p1', verifiedBy: 'a@b.c'}));
            expect(next.snapshots.PENDING_VERIFICATION.items.map((s) => s.id)).toEqual(['p2']);
            expect(next.snapshots.VERIFIED.items).toHaveLength(2);
        });

        it('unverify removes the snapshot from the verified list', () => {
            const next = sourcesReducer(state, unverifySnapshotById.fulfilled('v1', 'req', 'v1'));
            expect(next.snapshots.VERIFIED.items.map((s) => s.id)).toEqual(['v2']);
            expect(next.snapshots.PENDING_VERIFICATION.items).toHaveLength(2);
        });

        it('remove drops the snapshot from every list', () => {
            const next = sourcesReducer(state, removeSnapshot.fulfilled('v2', 'req', snapshot('v2')));
            expect(next.snapshots.VERIFIED.items.map((s) => s.id)).toEqual(['v1']);
        });
    });

    it('addSnapshot removes the source from the missing list', () => {
        const state = withLists({missing: {...initialState.missing, items: [source('s1'), source('s2')]}});
        const arg = {source: source('s1'), capturedAt: '2026-01-01', verifiedBy: 'a@b.c'};
        const next = sourcesReducer(state, addSnapshot.fulfilled(undefined, 'req', arg));
        expect(next.missing.items.map((s) => s.id)).toEqual(['s2']);
    });
});

