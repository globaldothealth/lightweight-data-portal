import {type ReactNode, type SyntheticEvent, useEffect, useMemo, useState, useRef} from "react";
import {
    Alert,
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    Link,
    MenuItem,
    Paper,
    Select,
    Tab,
    Tabs,
    TextField,
    Typography,
    CircularProgress,
} from "@mui/material";
import {OpenInNew as OpenInNewIcon, Check as CheckIcon, CloudUpload as CloudUploadIcon, Close as CloseIcon} from '@mui/icons-material';
import {getUrl, uploadData} from "aws-amplify/storage";
import {useAppSelector} from "../../hooks/redux";
import {selectUserProfile} from "../../redux/app/selectors";
import {Group} from "../../models/User";
import ImportSources from "./ImportSources";
import {OUTBREAK_OPTIONS, OutbreakName} from '../../config/outbreaks';
import {fetchSourcesForOutbreak, SourceRecord, SOURCES_BUCKET, verifySource, unverifySource} from '../../utils/sourcesApi';

interface TabPanelProps {
    children?: ReactNode;
    tabKey: string;
    value: string;
}

function TabPanel({children, value, tabKey}: TabPanelProps) {
    return (
        <div
            role="tabpanel"
            hidden={value !== tabKey}
            id={`sources-tabpanel-${tabKey}`}
            aria-labelledby={`sources-tab-${tabKey}`}
        >
            {value === tabKey && <Box sx={{pt: 2}}>{children}</Box>}
        </div>
    );
}

function BrowseSources() {
    const userProfile = useAppSelector(selectUserProfile);
    const [outbreakName, setOutbreakName] = useState<OutbreakName | ''>('');
    const [query, setQuery] = useState('');
    const [sources, setSources] = useState<SourceRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openingPdf, setOpeningPdf] = useState<string | null>(null);
    const [unverifyingId, setUnverifyingId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

    const handleUnverifySource = async (source: SourceRecord) => {
        setUnverifyingId(source.id);
        setError(null);
        setSuccessMessage(null);

        try {
            await unverifySource(source.id);
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
                                {filteredSources.length} verified source(s) shown
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
                                                            variant="outlined"
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
                                                            onClick={() => handleUnverifySource(source)}
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
        </Box>
    );
}

function VerifySources() {
    const userProfile = useAppSelector(selectUserProfile);
    const [outbreakName, setOutbreakName] = useState<OutbreakName | ''>('');
    const [sources, setSources] = useState<SourceRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openingPdf, setOpeningPdf] = useState<string | null>(null);
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedSourceForUpload, setSelectedSourceForUpload] = useState<SourceRecord | null>(null);

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

    const handleVerifySource = async (source: SourceRecord) => {
        if (!userProfile?.email) {
            setError('User email not found');
            return;
        }

        setVerifyingId(source.id);
        setError(null);
        setSuccessMessage(null);

        try {
            await verifySource(source.id, userProfile.email);
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
                                {sources.length} source(s) pending verification
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
                                                                variant="outlined"
                                                                size="small"
                                                                startIcon={<OpenInNewIcon />}
                                                                onClick={() => handleOpenPdf(source)}
                                                                disabled={openingPdf === source.id || verifyingId !== null || uploadingId !== null}
                                                            >
                                                                {openingPdf === source.id ? 'Loading...' : 'Open PDF'}
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
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
                                                        onClick={() => handleVerifySource(source)}
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
        </Box>
    );
}

export default function Sources() {
    const [selectedKey, setSelectedKey] = useState('browse');
    const userProfile = useAppSelector(selectUserProfile);

    const groups = userProfile?.groups ?? [];
    const isAdmin = groups.includes(Group.ADMINS);
    const canVerifySources = isAdmin || groups.includes(Group.CURATORS);

    const tabs = [
        {key: 'browse', label: 'Browse Sources', visible: true, content: <BrowseSources/>},
        {key: 'verify', label: 'Verify Sources', visible: canVerifySources, content: <VerifySources/>},
        {key: 'import', label: 'Import Sources', visible: isAdmin, content: <ImportSources/>},
    ].filter((tab) => tab.visible);

    const activeKey = tabs.some((tab) => tab.key === selectedKey) ? selectedKey : tabs[0].key;

    const handleTabChange = (_event: SyntheticEvent, newKey: string) => {
        setSelectedKey(newKey);
    };

    return (
        <Grid container spacing={2}>
            <Grid size={12}>
                <Typography variant={'h2'} sx={{color: "text.primary"}}>Sources</Typography>
            </Grid>
            <Grid size={12}>
                <Paper sx={{p: '1rem'}}>
                    {tabs.length === 1 ? (
                        tabs[0].content
                    ) : (
                        <>
                            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                                <Tabs value={activeKey} onChange={handleTabChange} aria-label="sources tabs">
                                    {tabs.map((tab) => (
                                        <Tab
                                            key={tab.key}
                                            value={tab.key}
                                            label={tab.label}
                                            id={`sources-tab-${tab.key}`}
                                            aria-controls={`sources-tabpanel-${tab.key}`}
                                        />
                                    ))}
                                </Tabs>
                            </Box>
                            {tabs.map((tab) => (
                                <TabPanel key={tab.key} value={activeKey} tabKey={tab.key}>
                                    {tab.content}
                                </TabPanel>
                            ))}
                        </>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
}
