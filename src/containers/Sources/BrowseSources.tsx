import {useMemo, useState} from "react";
import {Alert, Box, Button, CircularProgress, TextField, Typography} from "@mui/material";
import {Close as CloseIcon, OpenInNew as OpenInNewIcon} from '@mui/icons-material';
import {OutbreakName} from '../../config/outbreaks';
import {SourceRecord, unverifySource} from '../../utils/sourcesApi';
import ConfirmDialog from "./ConfirmDialog";
import OutbreakSelect from "./OutbreakSelect";
import SourceCard from "./SourceCard";
import {useOpenSourcePdf} from "./useOpenSourcePdf";
import {useSourceList} from "./useSourceList";

/** Verified sources of an outbreak. Only shown to curators, who can send a source back to verification. */
export default function BrowseSources() {
    const [outbreakName, setOutbreakName] = useState<OutbreakName | ''>('Ebola BVD');
    const [query, setQuery] = useState('');
    const {sources, loading, loadError, removeSource} = useSourceList(outbreakName, 'VERIFIED');
    const [actionError, setActionError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const {openingId, openPdf} = useOpenSourcePdf(setActionError);
    const [pendingUnverify, setPendingUnverify] = useState<SourceRecord | null>(null);
    const [unverifyingId, setUnverifyingId] = useState<string | null>(null);

    const filteredSources = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return needle ? sources.filter((source) => source.url.toLowerCase().includes(needle)) : sources;
    }, [sources, query]);

    const handleConfirmUnverify = async () => {
        if (!pendingUnverify) return;

        const {id} = pendingUnverify;
        setPendingUnverify(null);
        setUnverifyingId(id);
        setActionError(null);
        setSuccessMessage(null);

        try {
            await unverifySource(id);
            removeSource(id);
            setSuccessMessage('Source moved back to pending verification.');
        } catch (err: unknown) {
            setActionError(err instanceof Error ? err.message : 'Failed to unverify source');
        } finally {
            setUnverifyingId(null);
        }
    };

    const error = loadError ?? actionError;

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <OutbreakSelect
                id="browse-sources-outbreak"
                value={outbreakName}
                onChange={setOutbreakName}
                disabled={loading || unverifyingId !== null}
            />

            {outbreakName && (
                <>
                    <TextField
                        label="Search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="URL"
                        size="small"
                        disabled={loading || unverifyingId !== null}
                    />

                    {loading && <CircularProgress size={24}/>}
                    {error && <Alert severity="error">{error}</Alert>}
                    {successMessage && <Alert severity="success" onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}

                    {!loading && !loadError && (
                        <>
                            <Typography color="text.secondary">
                                {filteredSources.length} verified source{filteredSources.length === 1 ? '' : 's'} available
                            </Typography>

                            {filteredSources.length === 0 ? (
                                <Typography color="text.secondary">No verified sources for this outbreak.</Typography>
                            ) : (
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                    {filteredSources.map((source) => (
                                        <SourceCard
                                            key={source.id}
                                            source={source}
                                            actions={
                                                <>
                                                    {source.id && (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<OpenInNewIcon/>}
                                                            onClick={() => openPdf(source)}
                                                            disabled={openingId === source.id || unverifyingId !== null}
                                                        >
                                                            {openingId === source.id ? 'Loading...' : 'Open PDF'}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                        startIcon={<CloseIcon/>}
                                                        onClick={() => setPendingUnverify(source)}
                                                        disabled={unverifyingId !== null}
                                                    >
                                                        {unverifyingId === source.id ? 'Unverifying...' : 'Unverify'}
                                                    </Button>
                                                </>
                                            }
                                        />
                                    ))}
                                </Box>
                            )}
                        </>
                    )}
                </>
            )}

            <ConfirmDialog
                open={pendingUnverify !== null}
                title="Confirm Unverify"
                message="Are you sure you want to move this source back to pending verification? It will no longer be visible in Browse Sources."
                confirmLabel="Unverify"
                confirmColor="error"
                onConfirm={handleConfirmUnverify}
                onCancel={() => setPendingUnverify(null)}
            />
        </Box>
    );
}

