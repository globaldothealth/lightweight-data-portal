import {useEffect, useRef, useState} from "react";
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
    Typography,
} from "@mui/material";
import {Check as CheckIcon, CloudUpload as CloudUploadIcon, OpenInNew as OpenInNewIcon} from '@mui/icons-material';
import {getUrl, uploadData} from "aws-amplify/storage";
import {useAppSelector} from "../../hooks/redux";
import {selectUserProfile} from "../../redux/app/selectors";
import {OUTBREAK_OPTIONS, OutbreakName} from '../../config/outbreaks';
import {fetchSourcesForOutbreak, SourceRecord, SOURCES_BUCKET, verifySource} from '../../utils/sourcesApi';

export default function VerifySources() {
    const userProfile = useAppSelector(selectUserProfile);
    const [outbreakName, setOutbreakName] = useState<OutbreakName | ''>('Ebola BVD');
    const [sources, setSources] = useState<SourceRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openingPdf, setOpeningPdf] = useState<string | null>(null);
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedSourceForUpload, setSelectedSourceForUpload] = useState<SourceRecord | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{open: boolean; sourceId: string | null; action: 'verify'} | null>(null);

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

    const handleReplacePdf = (source: SourceRecord) => {
        setSelectedSourceForUpload(source);
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedSourceForUpload) {
            return;
        }

        if (!file.type.includes('pdf')) {
            setError('Please select a PDF file');
            return;
        }

        setUploadingId(selectedSourceForUpload.id);
        setError(null);
        setSuccessMessage(null);

        try {
            const s3Path = `${selectedSourceForUpload.outbreakName}/${selectedSourceForUpload.id}.pdf`;
            await uploadData({
                path: s3Path,
                data: file,
                options: {
                    bucket: SOURCES_BUCKET,
                    contentType: 'application/pdf',
                },
            }).result;
            setSuccessMessage(`PDF replaced successfully!`);
            setUploadingId(null);
            setSelectedSourceForUpload(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload PDF');
            setUploadingId(null);
        } finally {
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleVerifyClick = (source: SourceRecord) => {
        setConfirmDialog({open: true, sourceId: source.id, action: 'verify'});
    };

    const handleConfirmVerify = async () => {
        if (!confirmDialog?.sourceId || !userProfile?.email) return;

        const sourceId = confirmDialog.sourceId;
        setConfirmDialog(null);
        setVerifyingId(sourceId);
        setError(null);
        setSuccessMessage(null);

        try {
            await verifySource(sourceId, userProfile.email);
            setSuccessMessage(`Source verified successfully!`);
            // Reload sources after verification to ensure consistency
            setTimeout(async () => {
                try {
                    const updated = await fetchSourcesForOutbreak(outbreakName, 'PENDING_VERIFICATION');
                    setSources(updated);
                } catch (err) {
                    console.error('Failed to reload sources:', err);
                }
                setVerifyingId(null);
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to verify source');
            setVerifyingId(null);
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
        fetchSourcesForOutbreak(outbreakName, 'PENDING_VERIFICATION')
            .then((items) => setSources(items))
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : 'Failed to load sources');
                setSources([]);
            })
            .finally(() => setLoading(false));
    }, [outbreakName]);

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                style={{display: 'none'}}
            />

            <FormControl fullWidth>
                <InputLabel id="verify-sources-outbreak-label">Outbreak</InputLabel>
                <Select
                    labelId="verify-sources-outbreak-label"
                    value={outbreakName}
                    label="Outbreak"
                    onChange={(event) => setOutbreakName(event.target.value as OutbreakName)}
                    disabled={loading || verifyingId !== null || uploadingId !== null}
                >
                    {OUTBREAK_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {outbreakName && (
                <>
                    {loading && <CircularProgress size={24} />}
                    {error && <Alert severity="error">{error}</Alert>}
                    {successMessage && <Alert severity="success" onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}

                    {!loading && !error && (
                        <>
                            <Typography color="text.secondary">
                                {sources.length} source{sources.length > 1 && 's'} pending verification
                            </Typography>

                            {sources.length === 0 ? (
                                <Typography color="text.secondary">
                                    No sources awaiting verification for this outbreak.
                                </Typography>
                            ) : (
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                    {sources.map((source) => (
                                        <Paper key={source.id} sx={{p: 2, border: 1, borderColor: 'divider'}}>
                                            <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start'}}>
                                                <Box sx={{minWidth: 0, flex: 1}}>
                                                    <Link href={source.url} target="_blank" rel="noreferrer" sx={{wordBreak: 'break-all', display: 'block', mb: 1}}>
                                                        {source.url}
                                                    </Link>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {source.outbreakName}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap'}}>
                                                    {source.id && (
                                                        <>
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                size="small"
                                                                startIcon={<OpenInNewIcon />}
                                                                onClick={() => handleOpenPdf(source)}
                                                                disabled={openingPdf === source.id || verifyingId !== null || uploadingId !== null}
                                                            >
                                                                {openingPdf === source.id ? 'Loading...' : 'Open PDF'}
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color='warning'
                                                                size="small"
                                                                startIcon={<CloudUploadIcon />}
                                                                onClick={() => handleReplacePdf(source)}
                                                                disabled={verifyingId !== null || uploadingId !== null}
                                                            >
                                                                {uploadingId === source.id ? 'Uploading...' : 'Replace PDF'}
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        startIcon={<CheckIcon />}
                                                        onClick={() => handleVerifyClick(source)}
                                                        disabled={verifyingId !== null || uploadingId !== null}
                                                    >
                                                        {verifyingId === source.id ? 'Verifying...' : 'Verify'}
                                                    </Button>
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
                <DialogTitle>Confirm Verify</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to verify this source? It will be marked as verified and visible in Browse Sources.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
                    <Button onClick={handleConfirmVerify} color="success" variant="contained">
                        Verify
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

