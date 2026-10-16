import {type ReactNode, type SyntheticEvent} from "react";
import {
    Box,
    Grid,
    Paper,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../../hooks/redux";
import {selectActiveTab, selectVisibleTabs} from "../../redux/sources/selectors";
import {setSelectedTab, type SourcesTabKey} from "../../redux/sources/slice";
import BrowseSources from "./BrowseSources";
import VerifySources from "./VerifySources";
import MissingSources from "./MissingSources";
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


const TAB_CONTENT: Record<SourcesTabKey, ReactNode> = {
    browse: <BrowseSources/>,
    verify: <VerifySources/>,
    missing: <MissingSources/>,
    import: <ImportSources/>,
};

export default function Sources() {
    const dispatch = useAppDispatch();
    const tabs = useAppSelector(selectVisibleTabs);
    const activeKey = useAppSelector(selectActiveTab);

    const handleTabChange = (_event: SyntheticEvent, newKey: SourcesTabKey) => {
        dispatch(setSelectedTab(newKey));
    };

    return (
        <Grid container spacing={2}>
            <Grid size={12}>
                <Typography variant={'h2'} sx={{color: "text.primary"}}>Sources</Typography>
            </Grid>
            <Grid size={12}>
                <Paper sx={{p: '1rem'}}>
                    {!activeKey ? (
                        <Typography color="text.secondary">You do not have access to any source tools.</Typography>
                    ) : tabs.length === 1 ? (
                        TAB_CONTENT[activeKey]
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
                                    {TAB_CONTENT[tab.key]}
                                </TabPanel>
                            ))}
                        </>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
}
