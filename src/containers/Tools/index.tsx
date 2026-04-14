import {useMemo} from "react";
import {Grid, Paper, Typography} from "@mui/material";


export default function Tools() {
    const tools = useMemo(() => [
        {
            name: 'Grapevne',
            link: 'https://global.health/tools/grapevne/',
            logo: '/grapevne-logo.jpg',
            description: 'A graphical platform for building and validating infectious disease pipelines.'
        },
        {
            name: 'DART',
            link: 'https://global.health/tools/dart/',
            logo: '/dart-square-logo.png',
            description: 'Scalable, open-access and multidisciplinary data integration pipeline for climate-sensitive diseases.'
        },
        {
            name: 'Insight Board',
            link: 'https://global.health/tools/insightboard/',
            logo: '/insight-board-logo.png',
            description: 'Open-source AI-assisted tool for integrating, cleaning, and visualizing infectious disease outbreak data.'
        }
    ], []);

    return <>
        <Grid container spacing={2}>
            <Grid size={12}>
                <Typography variant={'h2'} sx={{color: "text.primary"}}>Tools</Typography>
            </Grid>
            <Grid size={12}>
                <Paper sx={{p: '1rem'}}>
                    <Typography>
                        Explore tools from the Global.health team that build, integrate, and visualize infectious
                        disease data for outbreak preparedness and response.
                    </Typography>
                </Paper>
            </Grid>
            {tools.map(tool =>
                <Grid size={{xs: 12, sm: 12, md: 6}} key={tool.name}>
                    <Paper sx={{height: '100%'}}>
                        <a target="_blank" rel="noopener noreferrer" href={tool.link}>
                            <img style={{width: '100%'}} src={tool.logo} alt={tool.name}/>
                        </a>
                        <Typography sx={{p: '1rem'}}>{tool.description}</Typography>
                    </Paper>
                </Grid>
            )}
        </Grid>
    </>
}