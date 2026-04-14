import {useEffect, useState, useMemo} from "react";
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';
import {
    Menu as MenuIcon,
    BrowserUpdated as OutbreakDataIcon,
    Public as LocationAdminExplorerIcon,
    Satellite as DengueGeodataIcon,
    People as PeopleIcon,
    Construction as ConstructionIcon,
} from '@mui/icons-material';
import {AppBar, Box, CssBaseline, IconButton, Toolbar, Link, Typography, CircularProgress, Paper} from '@mui/material';

import DataDownloads from "../DataDownloads";
import Tools from "../Tools";
import DengueGeodata from "../DengueGeodata";
import ManageUsers from "../ManageUsers";
import LocationAdminExplorer from "../LocationAdminExplorer";
import Sidebar from "../../components/Sidebar";
import {useAppDispatch, useAppSelector} from '../../hooks/redux';
import {getUserProfile, logout} from "../../redux/app/thunk.ts";
import GHLogo from "../../components/GHLogo.tsx";
import {selectUserProfile} from "../../redux/app/selectors.ts";
import {selectIsLoading} from "../../redux/app/selectors.ts";
import {Group} from "../../models/User.ts";


export default function App() {
    const dispatch = useAppDispatch();
    const [drawerOpen, setDrawerOpen] = useState(true);
    const location = useLocation();
    const userProfile = useAppSelector(selectUserProfile);
    const isLoading = useAppSelector(selectIsLoading);

    const drawerWidth = 240

    useEffect(() => {
        dispatch(getUserProfile());
    }, [dispatch]);

    const handleLogout = () => {
        dispatch(logout())
    }

    const menuList = useMemo(() => [
        {
            text: 'Outbreak Data',
            icon: <OutbreakDataIcon/>,
            to: '/data-downloads',
        },
        {
            text: 'Tools',
            icon: <ConstructionIcon/>,
            to: '/tools',
        },
        {
            text: 'Dengue Geodata',
            icon: <DengueGeodataIcon/>,
            to: '/dengue-geodata',
            groups: [Group.ADMINS, Group.CURATORS, Group.RESEARCHERS],
        },
        {
            text: 'Location Admin Explorer',
            icon: <LocationAdminExplorerIcon/>,
            to: '/location-admin-explorer',
            groups: [Group.ADMINS, Group.CURATORS],
        },
        {
            text: 'Manage Users',
            icon: <PeopleIcon/>,
            to: '/manage-users',
            groups: [Group.ADMINS],
        },
    ].filter(item => {
        if (!item.groups) return true;
        if (!userProfile?.groups) return false;
        return item.groups.some(group => userProfile.groups.includes(group));
    }), [userProfile]);

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
                         handleLogout={handleLogout} drawerWidth={drawerWidth} userProfileLoaded={!!userProfile && !isLoading}/>
                <Box sx={{
                    flexGrow: 1,
                    ml: !drawerOpen ? `-${drawerWidth}px` : 0,
                    transition: "all .2s",
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh'
                }}>
                    <Toolbar/>
                    <Box sx={{ flexGrow: 1, p: '1rem', maxWidth: '45rem' }}>
                        {(isLoading || !userProfile) ? <Paper sx={{p: '20% 0 20% 0', textAlign: 'center'}}><CircularProgress/></Paper> :
                        <Routes>
                            {menuList.some(item => item.to === '/data-downloads') && (
                                <Route path="/data-downloads" element={<DataDownloads/>}/>
                            )}
                            {menuList.some(item => item.to === '/tools') && (
                                <Route path="/tools" element={<Tools/>}/>
                            )}
                            {menuList.some(item => item.to === '/dengue-geodata') && (
                                <Route path="/dengue-geodata" element={<DengueGeodata/>}/>
                            )}
                            {menuList.some(item => item.to === '/location-admin-explorer') && (
                                <Route path="/location-admin-explorer" element={<LocationAdminExplorer/>}/>
                            )}
                            {menuList.some(item => item.to === '/manage-users') && (
                                <Route path="/manage-users" element={<ManageUsers/>}/>
                            )}
                            <Route
                                path="*"
                                element={
                                    <Navigate to={menuList.length > 0 ? menuList[0].to : '/data-downloads'} replace/>
                                }
                            />
                        </Routes>}
                    </Box>
                    <Box component="footer" sx={{p: '1rem'}}>
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
