import {useRef, useState} from "react";
import {
    Alert,
    Box,
    Button,
    FormControl,
    InputLabel,
    LinearProgress,
    MenuItem,
    Select,
    SelectChangeEvent,
    Typography,
} from "@mui/material";

import {OUTBREAK_OPTIONS, OutbreakName} from "../../config/outbreaks";
import {buildImportPlan, ImportPlan, parseSourceCsv, ParsedSourceCsv} from "../../utils/sourceImport";
import {applyImportPlan, fetchExistingSources, fetchSourceFileIds, ImportResult} from "../../utils/sourcesApi";

type Phase = 'idle' | 'analyzing' | 'ready' | 'importing' | 'done';

const MAX_LISTED_ISSUES = 10;

export default function ImportSources() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [outbreakName, setOutbreakName] = useState<OutbreakName | ''>('');
    const [fileName, setFileName] = useState<string | null>(null);
    const [phase, setPhase] = useState<Phase>('idle');
    const [parsed, setParsed] = useState<ParsedSourceCsv | null>(null);
    const [plan, setPlan] = useState<ImportPlan | null>(null);
    const [progress, setProgress] = useState({done: 0, total: 0});
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const reset = () => {
        setFileName(null);
        setPhase('idle');
        setParsed(null);
        setPlan(null);
        setProgress({done: 0, total: 0});
        setResult(null);
        setError(null);
    };

    const handleOutbreakChange = (event: SelectChangeEvent) => {
        setOutbreakName(event.target.value as OutbreakName);
        reset();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = ''; // allow selecting the same file again
        if (!file || !outbreakName) return;

        reset();
        setFileName(file.name);
        setPhase('analyzing');

        try {
            const parsedCsv = parseSourceCsv(await file.text());
            setParsed(parsedCsv);
            if (parsedCsv.error) {
                setPhase('idle');
                return;
            }

            const [existing, fileIds] = await Promise.all([
                fetchExistingSources(outbreakName),
                fetchSourceFileIds(outbreakName),
            ]);
            setPlan(buildImportPlan(parsedCsv.rows, existing, fileIds));
            setPhase('ready');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            setPhase('idle');
        }
    };

    const handleImport = async () => {
        if (!plan || !outbreakName) return;

        setPhase('importing');
        setProgress({done: 0, total: plan.toCreate.length + plan.toUpdate.length});
        try {
            const importResult = await applyImportPlan(plan, outbreakName, (done, total) => setProgress({done, total}));
            setResult(importResult);
            setPhase('done');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            setPhase('ready');
        }
    };

    const busy = phase === 'analyzing' || phase === 'importing';
    const nothingToWrite = !plan || plan.toCreate.length + plan.toUpdate.length === 0;

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <Typography color="text.secondary">
                Select an outbreak first, then choose a CSV file with a <code>url</code> column and an optional{' '}
                <code>id</code> column. Rows without an id are saved too, with an id generated from the URL; if the
                PDF is not in S3 yet, a curator will need to upload it. The import is safe to repeat: new sources
                are added, sources that were waiting for a file are updated once the PDF exists in S3, and sources
                already awaiting verification or verified are never changed.
            </Typography>

            <FormControl fullWidth>
                <InputLabel id="import-sources-outbreak-label">Outbreak Name</InputLabel>
                <Select
                    labelId="import-sources-outbreak-label"
                    value={outbreakName}
                    label="Outbreak Name"
                    onChange={handleOutbreakChange}
                    disabled={busy}
                >
                    {OUTBREAK_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                style={{display: 'none'}}
                data-testid="import-sources-file-input"
            />
            <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                disabled={!outbreakName || busy}
            >
                Select CSV File
            </Button>
            <Typography color="text.secondary">
                {fileName ? `Selected file: ${fileName}` : 'No file selected'}
            </Typography>

            {phase === 'analyzing' && <LinearProgress/>}

            {error && <Alert severity="error">{error}</Alert>}
            {parsed?.error && <Alert severity="error">{parsed.error}</Alert>}

            {parsed && !parsed.error && parsed.invalid.length > 0 && (
                <Alert severity="warning">
                    {parsed.invalid.length} invalid row(s) will be skipped:
                    {parsed.invalid.slice(0, MAX_LISTED_ISSUES).map((issue) => (
                        <div key={issue.rowNumber}>Row {issue.rowNumber}: {issue.reason}</div>
                    ))}
                    {parsed.invalid.length > MAX_LISTED_ISSUES &&
                        <div>…and {parsed.invalid.length - MAX_LISTED_ISSUES} more.</div>}
                </Alert>
            )}

            {plan && (phase === 'ready' || phase === 'importing') && (
                <Alert severity="info">
                    <div>{plan.toCreate.length} new source(s) to create</div>
                    <div>{plan.toUpdate.length} existing source(s) to update (PDF now present)</div>
                    <div>{plan.unchanged} unchanged</div>
                </Alert>
            )}

            {phase === 'importing' && (
                <>
                    <LinearProgress
                        variant="determinate"
                        value={progress.total ? (progress.done / progress.total) * 100 : 0}
                    />
                    <Typography color="text.secondary">{progress.done} / {progress.total}</Typography>
                </>
            )}

            {phase === 'ready' && (
                <Button variant="contained" onClick={handleImport} disabled={nothingToWrite}>
                    {nothingToWrite ? 'Nothing to import' : 'Import'}
                </Button>
            )}

            {phase === 'done' && result && (
                <>
                    <Alert severity={result.failed.length ? 'warning' : 'success'}>
                        Import finished: {result.created} created, {result.updated} updated
                        {result.failed.length > 0 && `, ${result.failed.length} failed`}.
                    </Alert>
                    {result.failed.length > 0 && (
                        <Alert severity="error">
                            {result.failed.slice(0, MAX_LISTED_ISSUES).map((failure) => (
                                <div key={failure.id}>{failure.id}: {failure.message}</div>
                            ))}
                            {result.failed.length > MAX_LISTED_ISSUES &&
                                <div>…and {result.failed.length - MAX_LISTED_ISSUES} more.</div>}
                        </Alert>
                    )}
                </>
            )}
        </Box>
    );
}

