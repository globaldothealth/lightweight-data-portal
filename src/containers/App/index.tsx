import {useEffect, useState, useMemo} from "react";
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';
import {
    Menu as MenuIcon,
    BrowserUpdated as BrowserUpdatedIcon,
    Public as PublicIcon,
} from '@mui/icons-material';
import {AppBar, Box, CssBaseline, IconButton, Toolbar, Link, Typography} from '@mui/material';

import DataDownloads from "../DataDownloads";
import LocationAdminExplorer from "../LocationAdminExplorer";
import Sidebar from "../../components/Sidebar";
import {useAppDispatch} from '../../hooks/redux';
import {getUserProfile, logout} from "../../redux/app/thunk.ts";
import GHLogo from "../../components/GHLogo.tsx";


export default function App() {
    const dispatch = useAppDispatch();
    const [drawerOpen, setDrawerOpen] = useState(true);
    const location = useLocation();

    const drawerWidth = 240

    useEffect(() => {
        dispatch(getUserProfile());
    }, [dispatch]);

    const handleLogout = () => {
        dispatch(logout())
    }

    const menuList = useMemo(() => [
        {
            text: 'Data Downloads',
            icon: <BrowserUpdatedIcon/>,
            to: '/data-downloads',
        },
        {
            text: 'Location Admin Explorer',
            icon: <PublicIcon/>,
            to: '/location-admin-explorer',
        },
    ], []);

    const selectedMenuIndex = useMemo(() => menuList.findIndex((menuItem) => (
        menuItem.to === location.pathname
    )), [location.pathname, menuList]);

    return (
        <>
            <Box sx={{display: 'flex'}}>
                <CssBaseline/>
                <AppBar position="fixed" sx={{zIndex: (theme) => theme.zIndex.drawer + 1}}>
                    <Toolbar>
                        <IconButton
                            aria-label="toggle drawer"
                            onClick={() => setDrawerOpen(!drawerOpen)}
                            edge="start"
                            data-testid="toggle-sidebar"
                            size="large"
                            sx={{color: 'primary.main', marginRight: '1rem'}}
                        >
                            <MenuIcon/>
                        </IconButton>
                        <GHLogo/>
                    </Toolbar>
                </AppBar>
                <Sidebar drawerOpen={drawerOpen} menuList={menuList} selectedMenuIndex={selectedMenuIndex}
                         handleLogout={handleLogout} drawerWidth={drawerWidth}/>
                <Box sx={{
                    flexGrow: 1,
                    ml: !drawerOpen ? `-${drawerWidth}px` : 0,
                    transition: "all .2s",
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh'
                }}>
                    <Toolbar/>
                    <Box sx={{ flexGrow: 1, p: 1, maxWidth: '45rem' }}>
                        <Routes>
                            <Route path="/data-downloads" element={<DataDownloads/>}/>
                            <Route path="/location-admin-explorer" element={<LocationAdminExplorer/>}/>
                            <Route
                                path="*"
                                element={
                                    <Navigate to='/data-downloads' replace/>
                                }
                            />
                        </Routes>
                    </Box>
                    <Box component="footer" sx={{mt: 'auto'}}>
                        <Typography variant="body2" color="secondary.main" align="left">
                            <Link href="https://global.health/privacy/" sx={{marginRight: '1rem'}}>
                                Privacy Policy
                            </Link>
                            |
                            <Link href="https://global.health/about/terms-of-use/" sx={{marginLeft: '1rem'}}>
                                Terms of Use
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </>
    );
}
