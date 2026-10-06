import {useEffect, useMemo, useState} from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
    Link,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import {Close as CloseIcon, OpenInNew as OpenInNewIcon} from '@mui/icons-material';
import {getUrl} from "aws-amplify/storage";
import {useAppSelector} from "../../hooks/redux";
import {selectUserProfile} from "../../redux/app/selectors";
import {Group} from "../../models/User";
import {OUTBREAK_OPTIONS, OutbreakName} from '../../config/outbreaks';
import {fetchSourcesForOutbreak, SourceRecord, SOURCES_BUCKET, unverifySource} from '../../utils/sourcesApi';

export default function BrowseSources() {
    const userProfile = useAppSelector(selectUserProfile);
    const [outbreakName, setOutbreakName] = useState<OutbreakName | ''>('Ebola BVD');
    const [query, setQuery] = useState('');
    const [sources, setSources] = useState<SourceRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openingPdf, setOpeningPdf] = useState<string | null>(null);
    const [unverifyingId, setUnverifyingId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{open: boolean; sourceId: string | null; action: 'unverify'} | null>(null);

    const groups = userProfile?.groups ?? [];
    const isAdmin = groups.includes(Group.ADMINS);
    const isCurator = groups.includes(Group.CURATORS);
    const canUnverify = isAdmin || isCurator;

    const handleOpenPdf = async (source: SourceRecord) => {
        setOpeningPdf(source.id);
        try {
            const url = await getUrl({
                path: `${source.outbreakName}/${source.id}.pdf`,
                options: {bucket: SOURCES_BUCKET},
            });
            window.open(url.url.toString(), '_blank');
        } catch (err) {
            console.error('Failed to open PDF:', err);
            alert(`Failed to open PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setOpeningPdf(null);
        }
    };

    const handleUnverifyClick = (source: SourceRecord) => {
        setConfirmDialog({open: true, sourceId: source.id, action: 'unverify'});
    };

    const handleConfirmUnverify = async () => {
        if (!confirmDialog?.sourceId) return;

        const sourceId = confirmDialog.sourceId;
        setConfirmDialog(null);
        setUnverifyingId(sourceId);
        setError(null);
        setSuccessMessage(null);

        try {
            await unverifySource(sourceId);
            setSuccessMessage(`Source moved back to pending verification.`);
            // Reload sources after unverification to ensure consistency
            setTimeout(async () => {
                try {
                    const updated = await fetchSourcesForOutbreak(outbreakName, 'VERIFIED');
                    setSources(updated);
                } catch (err) {
                    console.error('Failed to reload sources:', err);
                }
                setUnverifyingId(null);
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to unverify source');
            setUnverifyingId(null);
        }
    };

    const handleCloseConfirmDialog = () => {
        setConfirmDialog(null);
    };

    useEffect(() => {
        if (!outbreakName) {
            setSources([]);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        fetchSourcesForOutbreak(outbreakName, 'VERIFIED')
            .then((items) => setSources(items))
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : 'Failed to load sources');
                setSources([]);
            })
            .finally(() => setLoading(false));
    }, [outbreakName]);

    const filteredSources = useMemo(() => {
        const nextQuery = query.trim().toLowerCase();
        if (!nextQuery) return sources;
        return sources.filter((source) =>
            source.id.toLowerCase().includes(nextQuery)
            || source.url.toLowerCase().includes(nextQuery)
        );
    }, [sources, query]);

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <FormControl fullWidth>
                <InputLabel id="browse-sources-outbreak-label">Outbreak</InputLabel>
                <Select
                    labelId="browse-sources-outbreak-label"
                    value={outbreakName}
                    label="Outbreak"
                    onChange={(event) => setOutbreakName(event.target.value as OutbreakName)}
                    disabled={loading || unverifyingId !== null}
                >
                    {OUTBREAK_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {outbreakName && (
                <>
                    <Box sx={{display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap'}}>
                        <TextField
                            label="Search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="ID or URL"
                            size="small"
                            sx={{flex: 1, minWidth: 220}}
                            disabled={loading || unverifyingId !== null}
                        />
                    </Box>

                    {loading && <CircularProgress size={24} />}
                    {error && <Alert severity="error">{error}</Alert>}
                    {successMessage && <Alert severity="success" onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}

                    {!loading && !error && (
                        <>
                            <Typography color="text.secondary">
                                {filteredSources.length} verified source{filteredSources.length > 1 && 's'} available
                            </Typography>

                            {filteredSources.length === 0 ? (
                                <Typography color="text.secondary">
                                    No verified sources for this outbreak.
                                </Typography>
                            ) : (
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                    {filteredSources.map((source) => (
                                        <Paper key={source.id} sx={{p: 2, border: 1, borderColor: 'divider'}}>
                                            <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start'}}>
                                                <Box sx={{minWidth: 0, flex: 1}}>
                                                    <Link href={source.url} target="_blank" rel="noreferrer" sx={{wordBreak: 'break-all', display: 'block', mb: 1}}>
                                                        {source.url}
                                                    </Link>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {source.outbreakName}
                                                    </Typography>
                                                    {source.verifiedBy && source.verifiedAt && (
                                                        <Typography variant="caption" color="text.secondary" sx={{display: 'block', mt: 0.5}}>
                                                            Verified by {source.verifiedBy} on {new Date(source.verifiedAt).toLocaleDateString()}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Box sx={{display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap'}}>
                                                    {source.id && (
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            startIcon={<OpenInNewIcon />}
                                                            onClick={() => handleOpenPdf(source)}
                                                            disabled={openingPdf === source.id || unverifyingId !== null}
                                                        >
                                                            {openingPdf === source.id ? 'Loading...' : 'Open PDF'}
                                                        </Button>
                                                    )}
                                                    {canUnverify && (
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            size="small"
                                                            startIcon={<CloseIcon />}
                                                            onClick={() => handleUnverifyClick(source)}
                                                            disabled={unverifyingId !== null}
                                                        >
                                                            {unverifyingId === source.id ? 'Unverifying...' : 'Unverify'}
                                                        </Button>
                                                    )}
                                                </Box>
                                            </Box>
                                            {source.errorMessage && (
                                                <Typography variant="body2" color="error.main" sx={{mt: 1}}>
                                                    {source.errorMessage}
                                                </Typography>
                                            )}
                                        </Paper>
                                    ))}
                                </Box>
                            )}
                        </>
                    )}
                </>
            )}

            <Dialog open={confirmDialog?.open ?? false} onClose={handleCloseConfirmDialog}>
                <DialogTitle>Confirm Unverify</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to move this source back to pending verification? It will no longer be visible in Browse Sources.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
                    <Button onClick={handleConfirmUnverify} color="error" variant="contained">
                        Unverify
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

