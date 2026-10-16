import {beforeEach, describe, expect, it, vi} from 'vitest';
import {REQUEST_STATUS} from '../../../utils/tests/testConstants';
import * as snapshotsApi from '../../../utils/snapshotsApi';
import type {SnapshotRecord} from '../../../utils/snapshotsApi';
import type {SourceRecord} from '../../../utils/sourcesApi';
import {initialState} from '../slice';
import {
    addSnapshot,
    loadMissingSources,
    loadSnapshots,
    removeSnapshot,
    thunkErrorMessage,
    unverifySnapshotById,
    verifySnapshotById,
} from '../thunk';

vi.mock('../../../utils/snapshotsApi', () => ({
    fetchSourcesWithoutSnapshots: vi.fn(),
    fetchSnapshotsForOutbreak: vi.fn(),
    createSnapshot: vi.fn(),
    replaceSnapshotPdf: vi.fn(),
    verifySnapshot: vi.fn(),
    unverifySnapshot: vi.fn(),
    deleteSnapshot: vi.fn(),
}));

const snapshot: SnapshotRecord = {
    id: 's1_2026-01-01',
    sourceId: 's1',
    outbreakName: 'Ebola BVD',
    capturedAt: '2026-01-01',
    status: 'VERIFIED',
    url: 'https://example.com/a',
};
const source: SourceRecord = {id: 's1', url: 'https://example.com/a', outbreakName: 'Ebola BVD'};

describe('Sources thunks', () => {
    const dispatch = vi.fn();
    const getState = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        getState.mockReturnValue({sources: initialState});
    });

    describe('thunkErrorMessage', () => {
        it('handles strings, errors and unknown values', () => {
            expect(thunkErrorMessage('from payload', 'fallback')).toBe('from payload');
            expect(thunkErrorMessage(new Error('from error'), 'fallback')).toBe('from error');
            expect(thunkErrorMessage(undefined, 'fallback')).toBe('fallback');
        });
    });

    describe('loadMissingSources', () => {
        it('fulfills with the sources', async () => {
            vi.mocked(snapshotsApi.fetchSourcesWithoutSnapshots).mockResolvedValue([source]);
            const result = await loadMissingSources('Ebola BVD')(dispatch, getState, undefined);
            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.FULFILLED);
            expect(result.payload).toEqual([source]);
        });

        it('rejects with the error message', async () => {
            vi.mocked(snapshotsApi.fetchSourcesWithoutSnapshots).mockRejectedValue(new Error('down'));
            const result = await loadMissingSources('Ebola BVD')(dispatch, getState, undefined);
            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.REJECTED);
            expect(result.payload).toBe('down');
        });
    });

    describe('loadSnapshots', () => {
        it('fulfills with the snapshots of the outbreak and status', async () => {
            vi.mocked(snapshotsApi.fetchSnapshotsForOutbreak).mockResolvedValue([snapshot]);
            const result = await loadSnapshots({outbreakName: 'Ebola BVD', status: 'VERIFIED'})(dispatch, getState, undefined);
            expect(snapshotsApi.fetchSnapshotsForOutbreak).toHaveBeenCalledWith('Ebola BVD', 'VERIFIED');
            expect(result.payload).toEqual([snapshot]);
        });

        it('rejects with a default message when the error has none', async () => {
            vi.mocked(snapshotsApi.fetchSnapshotsForOutbreak).mockRejectedValue(undefined);
            const result = await loadSnapshots({outbreakName: 'Ebola BVD', status: 'VERIFIED'})(dispatch, getState, undefined);
            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.REJECTED);
            expect(result.payload).toBe('Failed to load snapshots');
        });
    });

    describe('verifySnapshotById and unverifySnapshotById', () => {
        it('verify fulfills with the id', async () => {
            vi.mocked(snapshotsApi.verifySnapshot).mockResolvedValue();
            const result = await verifySnapshotById({id: 'x', verifiedBy: 'a@b.c'})(dispatch, getState, undefined);
            expect(snapshotsApi.verifySnapshot).toHaveBeenCalledWith('x', 'a@b.c');
            expect(result.payload).toBe('x');
        });

        it('verify rejects with the error message', async () => {
            vi.mocked(snapshotsApi.verifySnapshot).mockRejectedValue(new Error('denied'));
            const result = await verifySnapshotById({id: 'x', verifiedBy: 'a@b.c'})(dispatch, getState, undefined);
            expect(result.payload).toBe('denied');
        });

        it('unverify fulfills with the id', async () => {
            vi.mocked(snapshotsApi.unverifySnapshot).mockResolvedValue();
            const result = await unverifySnapshotById('x')(dispatch, getState, undefined);
            expect(result.payload).toBe('x');
        });
    });

    describe('removeSnapshot', () => {
        it('fulfills with the id', async () => {
            vi.mocked(snapshotsApi.deleteSnapshot).mockResolvedValue();
            const result = await removeSnapshot(snapshot)(dispatch, getState, undefined);
            expect(result.payload).toBe(snapshot.id);
        });

        it('reloads the list and rejects when the deletion fails', async () => {
            vi.mocked(snapshotsApi.deleteSnapshot).mockRejectedValue(new Error('PDF kept'));
            const result = await removeSnapshot(snapshot)(dispatch, getState, undefined);
            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.REJECTED);
            expect(result.payload).toBe('PDF kept');
            expect(dispatch).toHaveBeenCalledTimes(3); // reload (a thunk) + pending + rejected
        });
    });

    describe('addSnapshot', () => {
        const arg = {source, capturedAt: '2026-01-01', verifiedBy: 'a@b.c'};

        it('creates the snapshot and does not reload a verified list of another outbreak', async () => {
            vi.mocked(snapshotsApi.createSnapshot).mockResolvedValue();
            const result = await addSnapshot(arg)(dispatch, getState, undefined);
            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.FULFILLED);
            expect(snapshotsApi.createSnapshot).toHaveBeenCalledWith(source, '2026-01-01', 'a@b.c', undefined);
            expect(dispatch).toHaveBeenCalledTimes(2); // pending + fulfilled only
        });

        it('reloads the verified list when it is loaded for the same outbreak', async () => {
            vi.mocked(snapshotsApi.createSnapshot).mockResolvedValue();
            getState.mockReturnValue({
                sources: {
                    ...initialState,
                    snapshots: {...initialState.snapshots, VERIFIED: {...initialState.snapshots.VERIFIED, outbreakName: 'Ebola BVD'}},
                },
            });
            await addSnapshot(arg)(dispatch, getState, undefined);
            expect(dispatch).toHaveBeenCalledTimes(3); // pending + reload + fulfilled
        });

        it('rejects with the error message', async () => {
            vi.mocked(snapshotsApi.createSnapshot).mockRejectedValue(new Error('This source already has a snapshot'));
            const result = await addSnapshot(arg)(dispatch, getState, undefined);
            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.REJECTED);
            expect(result.payload).toBe('This source already has a snapshot');
        });
    });
});

