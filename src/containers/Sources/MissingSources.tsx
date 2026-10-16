import {useCallback, useState} from "react";
import {Alert, Box, Button, CircularProgress, Typography} from "@mui/material";
import {CloudUpload as CloudUploadIcon} from '@mui/icons-material';
import {OutbreakName} from '../../config/outbreaks';
import type {SourceRecord} from '../../utils/sourcesApi';
import AddSnapshotDialog from "./components/AddSnapshotDialog.tsx";
import OutbreakSelect from "./components/OutbreakSelect.tsx";
import SourceCard from "./components/SourceCard.tsx";
import {useMissingSources} from "./hooks/useMissingSources.ts";

/** Sources that have no snapshot at all. A curator attaches a PDF, which creates a verified snapshot. */
export default function MissingSources() {
    const [outbreakName, setOutbreakName] = useState<OutbreakName | ''>('Ebola BVD');
    const {sources, loading, loadError} = useMissingSources(outbreakName);
    const [target, setTarget] = useState<SourceRecord | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // The store drops the source from the list once its snapshot is added.
    const handleAdded = useCallback((message: string) => {
        setSuccessMessage(message);
    }, []);


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

