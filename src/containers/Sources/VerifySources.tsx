import {useRef, useState} from "react";
import {Alert, Box, Button, CircularProgress, Typography} from "@mui/material";
import {
    Check as CheckIcon,
    CloudUpload as CloudUploadIcon,
    OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import {useAppDispatch, useAppSelector} from "../../hooks/redux";
import {selectUserProfile} from "../../redux/app/selectors";
import {replaceSnapshotFile, thunkErrorMessage, verifySnapshotById} from "../../redux/sources/thunk";
import {OutbreakName} from '../../config/outbreaks';
import type {SnapshotRecord} from '../../utils/snapshotsApi';
import ConfirmDialog from "./components/ConfirmDialog.tsx";
import OutbreakSelect from "./components/OutbreakSelect.tsx";
import SourceCard from "./components/SourceCard.tsx";
import {useOpenSnapshotPdf} from "./hooks/useOpenSnapshotPdf.ts";
import {useSnapshotList} from "./hooks/useSnapshotList.ts";

/**
 * Snapshots waiting for review. Curators and admins can open or replace a snapshot's PDF, and verify it.
 */
export default function VerifySources() {
    const dispatch = useAppDispatch();
    const userProfile = useAppSelector(selectUserProfile);
    const [outbreakName, setOutbreakName] = useState<OutbreakName | ''>('Ebola BVD');
    const {snapshots, loading, loadError} = useSnapshotList(outbreakName, 'PENDING_VERIFICATION');
    const [actionError, setActionError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const {openingId, openPdf} = useOpenSnapshotPdf(setActionError);
    const [pendingVerify, setPendingVerify] = useState<SnapshotRecord | null>(null);
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const replaceTarget = useRef<SnapshotRecord | null>(null);

    const busy = verifyingId !== null || uploadingId !== null;

    const handleReplaceClick = (snapshot: SnapshotRecord) => {
        replaceTarget.current = snapshot;
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = ''; // allow selecting the same file again
        const snapshot = replaceTarget.current;
        if (!file || !snapshot) return;

        if (file.type !== 'application/pdf') {
            setActionError('Please select a PDF file');
            return;
        }

        setUploadingId(snapshot.id);
        setActionError(null);
        setSuccessMessage(null);

        try {
            await dispatch(replaceSnapshotFile({snapshot, file})).unwrap();
            setSuccessMessage('PDF replaced successfully!');
        } catch (err: unknown) {
            setActionError(thunkErrorMessage(err, 'Failed to upload PDF'));
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
            await dispatch(verifySnapshotById({id, verifiedBy: userProfile.email})).unwrap();
            setSuccessMessage('Snapshot verified successfully!');
        } catch (err: unknown) {
            setActionError(thunkErrorMessage(err, 'Failed to verify snapshot'));
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
                                {snapshots.length} snapshot{snapshots.length === 1 ? '' : 's'} pending verification
                            </Typography>

                            {snapshots.length === 0 ? (
                                <Typography color="text.secondary">
                                    No snapshots awaiting verification for this outbreak. Sources are only URLs; use "Add snapshot" to attach a capture date and PDF to a source.
                                </Typography>
                            ) : (
                                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                                    {snapshots.map((snapshot) => (
                                        <SourceCard
                                            key={snapshot.id}
                                            url={snapshot.url}
                                            caption={`Snapshot of ${snapshot.capturedAt}`}
                                            actions={
                                                <>
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
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<CloudUploadIcon/>}
                                                        onClick={() => handleReplaceClick(snapshot)}
                                                        disabled={busy}
                                                    >
                                                        {uploadingId === snapshot.id ? 'Uploading...' : 'Replace PDF'}
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        startIcon={<CheckIcon/>}
                                                        onClick={() => setPendingVerify(snapshot)}
                                                        disabled={busy}
                                                    >
                                                        {verifyingId === snapshot.id ? 'Verifying...' : 'Verify'}
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
                message={`Are you sure you want to verify the snapshot of ${pendingVerify?.capturedAt ?? 'this date'}? It will be marked as verified and visible in Browse Sources.`}
                confirmLabel="Verify"
                confirmColor="success"
                onConfirm={handleConfirmVerify}
                onCancel={() => setPendingVerify(null)}
            />
        </Box>
    );
}

