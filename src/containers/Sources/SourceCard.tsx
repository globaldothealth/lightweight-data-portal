import type {ReactNode} from "react";
import {Box, Link, Paper, Typography} from "@mui/material";
import type {SourceRecord} from "../../utils/sourcesApi";

interface SourceCardProps {
    source: SourceRecord;
    /** Buttons shown on the right side of the card. */
    actions: ReactNode;
}

export default function SourceCard({source, actions}: SourceCardProps) {
    return (
        <Paper sx={{p: 2, border: 1, borderColor: 'divider'}}>
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
                    {actions}
                </Box>
            </Box>
            {source.errorMessage && (
                <Typography variant="body2" color="error.main" sx={{mt: 1}}>
                    {source.errorMessage}
                </Typography>
            )}
        </Paper>
    );
}

