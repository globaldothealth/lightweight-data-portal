import {useCallback, useEffect, useState} from "react";
import type {OutbreakName} from "../../config/outbreaks";
import type {SourceStatus} from "../../utils/sourceImport";
import {fetchSourcesForOutbreak, SourceRecord} from "../../utils/sourcesApi";

interface LoadedSources {
    /** Which outbreak/status this result belongs to, so a stale result is never shown for another selection. */
    key: string;
    sources: SourceRecord[];
    error: string | null;
}

/** Loads the sources of an outbreak with the given status and lets the caller drop one after acting on it. */
export function useSourceList(outbreakName: OutbreakName | '', status: SourceStatus) {
    const key = `${outbreakName}|${status}`;
    const [loaded, setLoaded] = useState<LoadedSources | null>(null);

    useEffect(() => {
        if (!outbreakName) return;

        let cancelled = false; // ignore a slow response once the outbreak or status has changed
        fetchSourcesForOutbreak(outbreakName, status)
            .then((sources) => {
                if (!cancelled) setLoaded({key, sources, error: null});
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setLoaded({key, sources: [], error: err instanceof Error ? err.message : 'Failed to load sources'});
            });

        return () => {
            cancelled = true;
        };
    }, [outbreakName, status, key]);

    const removeSource = useCallback((id: string) => {
        setLoaded((previous) => previous && {...previous, sources: previous.sources.filter((source) => source.id !== id)});
    }, []);

    const current = loaded?.key === key ? loaded : null;
    return {
        sources: current?.sources ?? [],
        loading: outbreakName !== '' && current === null,
        loadError: current?.error ?? null,
        removeSource,
    };
}

