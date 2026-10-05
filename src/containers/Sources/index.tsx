import {type ReactNode, type SyntheticEvent, useEffect, useMemo, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
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
import {OpenInNew as OpenInNewIcon} from '@mui/icons-material';
import {getUrl} from "aws-amplify/storage";
import {useAppSelector} from "../../hooks/redux";
import {selectUserProfile} from "../../redux/app/selectors";
import {Group} from "../../models/User";
import ImportSources from "./ImportSources";
import {OUTBREAK_OPTIONS, OutbreakName} from '../../config/outbreaks';
import {fetchSourcesForOutbreak, formatSourceStatus, SOURCE_STATUSES, SourceRecord, SOURCES_BUCKET} from '../../utils/sourcesApi';
import type {SourceStatus} from '../../utils/sourceImport';

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
    const [outbreakName, setOutbreakName] = useState<OutbreakName | ''>('');
    const [statusFilter, setStatusFilter] = useState<SourceStatus | 'ALL'>('ALL');
    const [query, setQuery] = useState('');
    const [sources, setSources] = useState<SourceRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openingPdf, setOpeningPdf] = useState<string | null>(null);

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

    useEffect(() => {
        if (!outbreakName) {
            setSources([]);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);
        fetchSourcesForOutbreak(outbreakName, statusFilter)
            .then((items) => setSources(items))
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : 'Failed to load sources');
                setSources([]);
            })
            .finally(() => setLoading(false));
    }, [outbreakName, statusFilter]);

    const filteredSources = useMemo(() => {
        const nextQuery = query.trim().toLowerCase();
        if (!nextQuery) return sources;
        return sources.filter((source) =>
            source.id.toLowerCase().includes(nextQuery)
            || source.url.toLowerCase().includes(nextQuery)
            || source.status.toLowerCase().includes(nextQuery)
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
                >
                    {OUTBREAK_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {outbreakName && (
                <>
                    <Box sx={{display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap'}}>
                        <FormControl sx={{minWidth: 220}}>
                            <InputLabel id="browse-sources-status-label">Status</InputLabel>
                            <Select
                                labelId="browse-sources-status-label"
                                value={statusFilter}
                                label="Status"
                                onChange={(event) => setStatusFilter(event.target.value as SourceStatus | 'ALL')}
                            >
                                <MenuItem value="ALL">All</MenuItem>
                                {SOURCE_STATUSES.map((status) => (
                                    <MenuItem key={status} value={status}>{formatSourceStatus(status)}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="ID, URL, or status"
                            size="small"
                            sx={{flex: 1, minWidth: 220}}
                        />
                    </Box>

                    {loading && <CircularProgress size={24} />}
                    {error && <Alert severity="error">{error}</Alert>}

                    {!loading && !error && (
                        <>
                            <Typography color="text.secondary">
                                {filteredSources.length} source(s) shown
                            </Typography>

                            {filteredSources.length === 0 ? (
                                <Typography color="text.secondary">
                                    No sources match the current outbreak and filters.
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
                                                </Box>
                                                <Box sx={{display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap'}}>
                                                    {source.id && (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<OpenInNewIcon />}
                                                            onClick={() => handleOpenPdf(source)}
                                                            disabled={openingPdf === source.id}
                                                        >
                                                            {openingPdf === source.id ? 'Loading...' : 'Open PDF'}
                                                        </Button>
                                                    )}
                                                    <Chip label={formatSourceStatus(source.status)} color={
                                                        source.status === 'VERIFIED' ? 'success' : 'warning'
                                                    } />
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
    return (
        <Typography variant="body1" sx={{color: "text.secondary"}}>
            Verify and manage sources for availability to users.
            {/* TODO: Add source verification interface */}
        </Typography>
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
