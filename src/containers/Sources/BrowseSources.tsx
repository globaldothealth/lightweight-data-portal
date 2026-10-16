import {useMemo, useState} from "react";
import {Alert, Box, Button, CircularProgress, TextField, Typography} from "@mui/material";
import {Add as AddIcon, Close as CloseIcon, Delete as DeleteIcon, OpenInNew as OpenInNewIcon} from '@mui/icons-material';
import {OutbreakName} from '../../config/outbreaks';
import {deleteSnapshot, SnapshotRecord, SourceRecord, unverifySnapshot} from '../../utils/sourcesApi';
import AddSnapshotDialog from "./AddSnapshotDialog";
import ConfirmDialog from "./ConfirmDialog";
import OutbreakSelect from "./OutbreakSelect";
import SourceCard from "./SourceCard";
import {useOpenSnapshotPdf} from "./useOpenSnapshotPdf";
import {useSnapshotList} from "./useSnapshotList";

interface SourceGroup {
    sourceId: string;
    url: string;
    snapshots: SnapshotRecord[];
}

/** Groups snapshots by source, keeping the order of the (already sorted) input. */
function groupBySource(snapshots: SnapshotRecord[]): SourceGroup[] {
    const groups = new Map<string, SourceGroup>();
    snapshots.forEach((snapshot) => {
        const group = groups.get(snapshot.sourceId) ?? {sourceId: snapshot.sourceId, url: snapshot.url, snapshots: []};
        group.snapshots.push(snapshot);
        groups.set(snapshot.sourceId, group);
    });
    return [...groups.values()];
}

/** Verified snapshots of an outbreak, per source. Only shown to curators, who can send a snapshot back to verification. */
export default function BrowseSources() {
    const [outbreakName, setOutbreakName] = useState<OutbreakName | ''>('Ebola BVD');
    const [query, setQuery] = useState('');
    const {snapshots, loading, loadError, removeSnapshot, reload} = useSnapshotList(outbreakName, 'VERIFIED');
    const [actionError, setActionError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const {openingId, openPdf} = useOpenSnapshotPdf(setActionError);
    const [addTarget, setAddTarget] = useState<SourceRecord | null>(null);
    const [pendingUnverify, setPendingUnverify] = useState<SnapshotRecord | null>(null);
    const [unverifyingId, setUnverifyingId] = useState<string | null>(null);
    const [pendingRemove, setPendingRemove] = useState<SnapshotRecord | null>(null);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const busy = unverifyingId !== null || removingId !== null;

    const groups = useMemo(() => {
        const needle = query.trim().toLowerCase();
        const matching = needle
            ? snapshots.filter((snapshot) => snapshot.url.toLowerCase().includes(needle) || snapshot.capturedAt.includes(needle))
            : snapshots;
        return groupBySource(matching);
    }, [snapshots, query]);

    const snapshotCount = groups.reduce((total, group) => total + group.snapshots.length, 0);

    const handleConfirmUnverify = async () => {
        if (!pendingUnverify) return;

        const {id} = pendingUnverify;
        setPendingUnverify(null);
        setUnverifyingId(id);
        setActionError(null);
        setSuccessMessage(null);

        try {
            await unverifySnapshot(id);
            removeSnapshot(id);
            setSuccessMessage('Snapshot moved back to pending verification.');
        } catch (err: unknown) {
            setActionError(err instanceof Error ? err.message : 'Failed to unverify snapshot');
        } finally {
            setUnverifyingId(null);
        }
    };

    const handleConfirmRemove = async () => {
        if (!pendingRemove) return;

        const snapshot = pendingRemove;
        setPendingRemove(null);
        setRemovingId(snapshot.id);
        setActionError(null);
        setSuccessMessage(null);

        try {
            await deleteSnapshot(snapshot);
            removeSnapshot(snapshot.id);
            setSuccessMessage(`Snapshot of ${snapshot.capturedAt} removed.`);
        } catch (err: unknown) {
            reload(); // the record may already be gone even if the PDF deletion failed
            setActionError(err instanceof Error ? err.message : 'Failed to remove snapshot');
        } finally {
            setRemovingId(null);
        }
    };

    const handleAdded = (message: string) => {
        setActionError(null);
        setSuccessMessage(message);
        reload();
    };

    const error = loadError ?? actionError;

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <OutbreakSelect
                id="browse-sources-outbreak"
                value={outbreakName}
                onChange={setOutbreakName}
                disabled={loading || busy}
            />

            {outbreakName && (
                <>
                    <TextField
                        label="Search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="URL or date (YYYY-MM-DD)"
                        size="small"
                        disabled={loading || busy}
                    />

                    {loading && <CircularProgress size={24}/>}
                    {error && <Alert severity="error">{error}</Alert>}
                    {successMessage && <Alert severity="success" onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}

                    {!loading && !loadError && (
                        <>
                            <Typography color="text.secondary">
                                {snapshotCount} verified snapshot{snapshotCount === 1 ? '' : 's'} of {groups.length} source{groups.length === 1 ? '' : 's'}
                            </Typography>

                            {groups.length === 0 ? (
                                <Typography color="text.secondary">No verified sources for this outbreak.</Typography>
                            ) : (
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                    {groups.map((group) => (
                                        <SourceCard
                                            key={group.sourceId}
                                            url={group.url}
                                            actions={
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<AddIcon/>}
                                                    onClick={() => setAddTarget({id: group.sourceId, url: group.url, outbreakName})}
                                                    disabled={busy}
                                                >
                                                    Add snapshot
                                                </Button>
                                            }
                                        >
                                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, mt: 1.5}}>
                                                {group.snapshots.map((snapshot) => (
                                                    <Box
                                                        key={snapshot.id}
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            flexWrap: 'wrap',
                                                            borderTop: 1,
                                                            borderColor: 'divider',
                                                            pt: 1,
                                                        }}
                                                    >
                                                        <Box>
                                                            <Typography variant="body2">{snapshot.capturedAt}</Typography>
                                                            {snapshot.verifiedBy && snapshot.verifiedAt && (
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Verified by {snapshot.verifiedBy} on {new Date(snapshot.verifiedAt).toLocaleDateString()}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        <Box sx={{display: 'flex', gap: 1}}>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                startIcon={<OpenInNewIcon/>}
                                                                onClick={() => openPdf(snapshot)}
                                                                disabled={openingId === snapshot.id || busy}
                                                            >
                                                                {openingId === snapshot.id ? 'Loading...' : 'Open PDF'}
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="warning"
                                                                size="small"
                                                                startIcon={<CloseIcon/>}
                                                                onClick={() => setPendingUnverify(snapshot)}
                                                                disabled={busy}
                                                            >
                                                                {unverifyingId === snapshot.id ? 'Unverifying...' : 'Unverify'}
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                size="small"
                                                                startIcon={<DeleteIcon/>}
                                                                onClick={() => setPendingRemove(snapshot)}
                                                                disabled={busy}
                                                            >
                                                                {removingId === snapshot.id ? 'Removing...' : 'Remove'}
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </SourceCard>
                                    ))}
                                </Box>
                            )}
                        </>
                    )}
                </>
            )}

            {addTarget && outbreakName && (
                <AddSnapshotDialog
                    outbreakName={outbreakName}
                    fixedSource={addTarget}
                    onClose={() => setAddTarget(null)}
                    onAdded={handleAdded}
                />
            )}

            <ConfirmDialog
                open={pendingUnverify !== null}
                title="Confirm Unverify"
                message={`Are you sure you want to unverify the snapshot of ${pendingUnverify?.capturedAt ?? 'this date'}? It will return to Verify Sources and will no longer be visible in Browse Sources.`}
                confirmLabel="Unverify"
                confirmColor="warning"
                onConfirm={handleConfirmUnverify}
                onCancel={() => setPendingUnverify(null)}
            />

            <ConfirmDialog
                open={pendingRemove !== null}
                title="Confirm Remove"
                message={`Are you sure you want to remove the snapshot of ${pendingRemove?.capturedAt ?? 'this date'}? The snapshot and its PDF will be permanently deleted.`}
                confirmLabel="Remove"
                confirmColor="error"
                onConfirm={handleConfirmRemove}
                onCancel={() => setPendingRemove(null)}
            />
        </Box>
    );
}

