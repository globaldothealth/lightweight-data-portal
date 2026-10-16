import type {SourceStatus} from '../../utils/sourceImport';
import type {SnapshotRecord} from '../../utils/snapshotsApi';
import type {SourceRecord} from '../../utils/sourcesApi';

export type SourcesTabKey = 'browse' | 'verify' | 'missing' | 'import';

/** A list loaded for one outbreak. `requestId` ties the list to its latest request, so a stale response is ignored. */
export interface ListState<T> {
    outbreakName: string | null;
    items: T[];
    loading: boolean;
    error: string | null;
    requestId: string | null;
}

export interface SourcesState {
    selectedTab: SourcesTabKey;
    /** Sources without any snapshot. */
    missing: ListState<SourceRecord>;
    /** Snapshots of an outbreak, per status. */
    snapshots: Record<SourceStatus, ListState<SnapshotRecord>>;
}

