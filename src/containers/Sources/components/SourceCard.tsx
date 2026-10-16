import type {ReactNode} from "react";
import {Box, Link, Paper, Typography} from "@mui/material";

interface SourceCardProps {
    url: string;
    /** Small grey line under the URL. */
    caption?: string;
    /** Buttons shown on the right side of the header. */
    actions?: ReactNode;
    /** Extra content below the header, e.g. a list of snapshots. */
    children?: ReactNode;
}

export default function SourceCard({url, caption, actions, children}: SourceCardProps) {
    return (
        <Paper sx={{p: 2, border: 1, borderColor: 'divider'}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start'}}>
                <Box sx={{minWidth: 0, flex: 1}}>
                    <Link href={url} target="_blank" rel="noreferrer" sx={{wordBreak: 'break-all', display: 'block', mb: 0.5}}>
                        {url}
                    </Link>
                    {caption && (
                        <Typography variant="caption" color="text.secondary">
                            {caption}
                        </Typography>
                    )}
                </Box>
                {actions && (
                    <Box sx={{display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap'}}>
                        {actions}
                    </Box>
                )}
            </Box>
            {children}
        </Paper>
    );
}

