import {useRef, useState} from "react";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from "@mui/material";
import {OutbreakName} from "../../config/outbreaks";
import {useAppSelector} from "../../hooks/redux";
import {selectUserProfile} from "../../redux/app/selectors";
import {isValidSnapshotDate, snapshotPdfPath, todayUtc} from "../../utils/snapshot";
import {createSnapshot, SourceRecord} from "../../utils/sourcesApi";

interface AddSnapshotDialogProps {
    outbreakName: OutbreakName;
    /** When set, the source is fixed and cannot be changed. */
    fixedSource?: SourceRecord;
    onClose: () => void;
    /** Called after the snapshot was created. */
    onAdded: (message: string) => void;
}

/** Adds a snapshot (capture date + PDF) to a source. Mount it only while it should be shown, so its state resets. */
export default function AddSnapshotDialog({outbreakName, fixedSource, onClose, onAdded}: AddSnapshotDialogProps) {
    const userProfile = useAppSelector(selectUserProfile);

    const [capturedAt, setCapturedAt] = useState(todayUtc());
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0] ?? null;
        event.target.value = ''; // allow selecting the same file again
        if (selected && selected.type !== 'application/pdf') {
            setError('Please select a PDF file');
            return;
        }
        setError(null);
        setFile(selected);
    };

    const dateIsValid = isValidSnapshotDate(capturedAt);
    const targetPath =  dateIsValid ? snapshotPdfPath({outbreakName, sourceId: fixedSource?.id ?? '', capturedAt}) : null;

    const handleSubmit = async () => {
        if (!fixedSource) return;
        if (!userProfile?.email) {
            setError('User email not found');
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            await createSnapshot(fixedSource, capturedAt, userProfile.email, file ?? undefined);
            onAdded(`Snapshot of ${capturedAt} added and verified. It is visible in Browse Sources.`);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to add snapshot');
            setSubmitting(false);
        }
    };

    return (
        <Dialog open onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>Add snapshot</DialogTitle>
            <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important'}}>
                <TextField
                    label="Snapshot date"
                    type="date"
                    value={capturedAt}
                    onChange={(event) => setCapturedAt(event.target.value)}
                    error={capturedAt !== '' && !dateIsValid}
                    helperText="The day the content was captured (UTC)."
                    disabled={submitting}
                    slotProps={{inputLabel: {shrink: true}}}
                />

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    style={{display: 'none'}}
                />
                <Button variant="outlined" onClick={() => fileInputRef.current?.click()} disabled={submitting}>
                    {file ? `PDF: ${file.name}` : 'Select PDF'}
                </Button>
                <Typography variant="caption" color="text.secondary">
                    {targetPath
                        ? `Without a file, the PDF already stored at ${targetPath} is used.`
                        : 'Choose a source and a date. Without a file, a PDF already stored in S3 for that date is used.'}
                </Typography>

                {error && <Alert severity="error">{error}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={submitting}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!fixedSource || !dateIsValid || submitting}>
                    {submitting ? 'Adding...' : 'Add snapshot'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

