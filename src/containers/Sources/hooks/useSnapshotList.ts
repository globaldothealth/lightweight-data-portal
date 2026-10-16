import {useCallback, useEffect, useState} from "react";
import type {OutbreakName} from "../../config/outbreaks";
import type {SourceStatus} from "../../utils/sourceImport";
import {fetchSnapshotsForOutbreak, SnapshotRecord} from "../../utils/sourcesApi";

interface LoadedSnapshots {
    /** Which outbreak/status/reload this result belongs to, so a stale result is never shown for another selection. */
    key: string;
    snapshots: SnapshotRecord[];
    error: string | null;
}

/** Loads the snapshots of an outbreak with the given status; a snapshot can be dropped locally after acting on it. */
export function useSnapshotList(outbreakName: OutbreakName | '', status: SourceStatus) {
    const [version, setVersion] = useState(0);
    const key = `${outbreakName}|${status}|${version}`;
    const [loaded, setLoaded] = useState<LoadedSnapshots | null>(null);

    useEffect(() => {
        if (!outbreakName) return;

        let cancelled = false; // ignore a slow response once the selection has changed
        fetchSnapshotsForOutbreak(outbreakName, status)
            .then((snapshots) => {
                if (!cancelled) setLoaded({key, snapshots, error: null});
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setLoaded({key, snapshots: [], error: err instanceof Error ? err.message : 'Failed to load snapshots'});
            });

        return () => {
            cancelled = true;
        };
    }, [outbreakName, status, key]);

    const removeSnapshot = useCallback((id: string) => {
        setLoaded((previous) => previous && {...previous, snapshots: previous.snapshots.filter((snapshot) => snapshot.id !== id)});
    }, []);

    const reload = useCallback(() => setVersion((current) => current + 1), []);

    const current = loaded?.key === key ? loaded : null;
    return {
        snapshots: current?.snapshots ?? [],
        loading: outbreakName !== '' && current === null,
        loadError: current?.error ?? null,
        removeSnapshot,
        reload,
    };
}

