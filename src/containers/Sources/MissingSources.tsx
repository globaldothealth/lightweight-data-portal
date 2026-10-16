import {useCallback, useEffect, useState} from "react";
import {Alert, Box, Button, CircularProgress, Typography} from "@mui/material";
import {CloudUpload as CloudUploadIcon} from '@mui/icons-material';
import {OutbreakName} from '../../config/outbreaks';
import {fetchSourcesWithoutSnapshots, SourceRecord} from '../../utils/sourcesApi';
import AddSnapshotDialog from "./AddSnapshotDialog";
import OutbreakSelect from "./OutbreakSelect";
import SourceCard from "./SourceCard";

interface LoadedSources {
    /** Which outbreak/reload this result belongs to, so a stale result is never shown for another selection. */
    key: string;
    sources: SourceRecord[];
    error: string | null;
}

/** Sources that have no snapshot at all. A curator attaches a PDF, which creates a verified snapshot. */
export default function MissingSources() {
    const [outbreakName, setOutbreakName] = useState<OutbreakName | ''>('Ebola BVD');
    const [version, setVersion] = useState(0);
    const key = `${outbreakName}|${version}`;
    const [loaded, setLoaded] = useState<LoadedSources | null>(null);
    const [target, setTarget] = useState<SourceRecord | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!outbreakName) return;

        let cancelled = false;
        fetchSourcesWithoutSnapshots(outbreakName)
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
    }, [outbreakName, key]);

    const handleAdded = useCallback((message: string) => {
        setSuccessMessage(message);
        setVersion((current) => current + 1);
    }, []);

    const current = loaded?.key === key ? loaded : null;
    const loading = outbreakName !== '' && current === null;
    const sources = current?.sources ?? [];
    const loadError = current?.error ?? null;

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <OutbreakSelect
                id="missing-sources-outbreak"
                value={outbreakName}
                onChange={setOutbreakName}
                disabled={loading}
            />

            {outbreakName && (
                <>
                    {loading && <CircularProgress size={24}/>}
                    {loadError && <Alert severity="error">{loadError}</Alert>}
                    {successMessage && <Alert severity="success" onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}

                    {!loading && !loadError && (
                        <>
                            <Typography color="text.secondary">
                                {sources.length} source{sources.length === 1 ? '' : 's'} without a snapshot
                            </Typography>

                            {sources.length === 0 ? (
                                <Typography color="text.secondary">Every source of this outbreak has at least one snapshot.</Typography>
                            ) : (
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                    {sources.map((source) => (
                                        <SourceCard
                                            key={source.id}
                                            url={source.url}
                                            actions={
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<CloudUploadIcon/>}
                                                    onClick={() => setTarget(source)}
                                                >
                                                    Attach PDF
                                                </Button>
                                            }
                                        />
                                    ))}
                                </Box>
                            )}
                        </>
                    )}
                </>
            )}

            {target && outbreakName && (
                <AddSnapshotDialog
                    outbreakName={outbreakName}
                    fixedSource={target}
                    onClose={() => setTarget(null)}
                    onAdded={handleAdded}
                />
            )}
        </Box>
    );
}

