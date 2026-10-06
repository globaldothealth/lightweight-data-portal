import {useRef, useState} from "react";
import {Alert, Box, Button, CircularProgress, Typography} from "@mui/material";
import {Check as CheckIcon, CloudUpload as CloudUploadIcon, OpenInNew as OpenInNewIcon} from '@mui/icons-material';
import {uploadData} from "aws-amplify/storage";
import {useAppSelector} from "../../hooks/redux";
import {selectUserProfile} from "../../redux/app/selectors";
import {OutbreakName} from '../../config/outbreaks';
import {SOURCES_BUCKET, SourceRecord, sourcePdfPath, verifySource} from '../../utils/sourcesApi';
import ConfirmDialog from "./ConfirmDialog";
import OutbreakSelect from "./OutbreakSelect";
import SourceCard from "./SourceCard";
import {useOpenSourcePdf} from "./useOpenSourcePdf";
import {useSourceList} from "./useSourceList";

/** Sources waiting for review: curators and admins can open or replace the PDF, then verify the source. */
export default function VerifySources() {
    const userProfile = useAppSelector(selectUserProfile);
    const [outbreakName, setOutbreakName] = useState<OutbreakName | ''>('Ebola BVD');
    const {sources, loading, loadError, removeSource} = useSourceList(outbreakName, 'PENDING_VERIFICATION');
    const [actionError, setActionError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const {openingId, openPdf} = useOpenSourcePdf(setActionError);
    const [pendingVerify, setPendingVerify] = useState<SourceRecord | null>(null);
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const replaceTarget = useRef<SourceRecord | null>(null);

    const busy = verifyingId !== null || uploadingId !== null;

    const handleReplaceClick = (source: SourceRecord) => {
        replaceTarget.current = source;
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = ''; // allow selecting the same file again
        const source = replaceTarget.current;
        if (!file || !source) return;

        if (file.type !== 'application/pdf') {
            setActionError('Please select a PDF file');
            return;
        }

        setUploadingId(source.id);
        setActionError(null);
        setSuccessMessage(null);

        try {
            // Same key as the existing file (the id is the file name), so the PDF is replaced.
            await uploadData({
                path: sourcePdfPath(source),
                data: file,
                options: {bucket: SOURCES_BUCKET, contentType: 'application/pdf'},
            }).result;
            setSuccessMessage('PDF replaced successfully!');
        } catch (err: unknown) {
            setActionError(err instanceof Error ? err.message : 'Failed to upload PDF');
        } finally {
            setUploadingId(null);
        }
    };

    const handleConfirmVerify = async () => {
        if (!pendingVerify) return;

        const {id} = pendingVerify;
        setPendingVerify(null);
        if (!userProfile?.email) {
            setActionError('User email not found');
            return;
        }

        setVerifyingId(id);
        setActionError(null);
        setSuccessMessage(null);

        try {
            await verifySource(id, userProfile.email);
            removeSource(id);
            setSuccessMessage('Source verified successfully!');
        } catch (err: unknown) {
            setActionError(err instanceof Error ? err.message : 'Failed to verify source');
        } finally {
            setVerifyingId(null);
        }
    };

    const error = loadError ?? actionError;

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                style={{display: 'none'}}
            />

            <OutbreakSelect
                id="verify-sources-outbreak"
                value={outbreakName}
                onChange={setOutbreakName}
                disabled={loading || busy}
            />

            {outbreakName && (
                <>
                    {loading && <CircularProgress size={24}/>}
                    {error && <Alert severity="error">{error}</Alert>}
                    {successMessage && <Alert severity="success" onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}

                    {!loading && !loadError && (
                        <>
                            <Typography color="text.secondary">
                                {sources.length} source{sources.length === 1 ? '' : 's'} pending verification
                            </Typography>

                            {sources.length === 0 ? (
                                <Typography color="text.secondary">
                                    No sources awaiting verification for this outbreak.
                                </Typography>
                            ) : (
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                    {sources.map((source) => (
                                        <SourceCard
                                            key={source.id}
                                            source={source}
                                            actions={
                                                <>
                                                    {source.id && (
                                                        <>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                startIcon={<OpenInNewIcon/>}
                                                                onClick={() => openPdf(source)}
                                                                disabled={openingId === source.id || busy}
                                                            >
                                                                {openingId === source.id ? 'Loading...' : 'Open PDF'}
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                startIcon={<CloudUploadIcon/>}
                                                                onClick={() => handleReplaceClick(source)}
                                                                disabled={busy}
                                                            >
                                                                {uploadingId === source.id ? 'Uploading...' : 'Replace PDF'}
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        startIcon={<CheckIcon/>}
                                                        onClick={() => setPendingVerify(source)}
                                                        disabled={busy}
                                                    >
                                                        {verifyingId === source.id ? 'Verifying...' : 'Verify'}
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
                open={pendingVerify !== null}
                title="Confirm Verify"
                message="Are you sure you want to verify this source? It will be marked as verified and visible in Browse Sources."
                confirmLabel="Verify"
                confirmColor="success"
                onConfirm={handleConfirmVerify}
                onCancel={() => setPendingVerify(null)}
            />
        </Box>
    );
}

