import {type ReactNode, type SyntheticEvent, useState} from "react";
import {Grid, Typography, Paper, Tabs, Tab, Box} from "@mui/material";
import {useAppSelector} from "../../hooks/redux";
import {selectUserProfile} from "../../redux/app/selectors";
import {Group} from "../../models/User";
import ImportSources from "./ImportSources";


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
    return (
        <Typography variant="body1" sx={{color: "text.secondary"}}>
            Browse verified sources for infectious disease outbreaks.
            {/* TODO: Add outbreak selector and sources list */}
        </Typography>
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
                        // Standard users only get the Browse content, without a tab bar
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
