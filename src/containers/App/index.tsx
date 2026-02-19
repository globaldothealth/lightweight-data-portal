import {useEffect, useState} from "react";
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';
import {
    Menu as MenuIcon,
    BrowserUpdated as BrowserUpdatedIcon,
    Public as PublicIcon,
} from '@mui/icons-material';
import {AppBar, Box, CssBaseline, IconButton, Toolbar,} from '@mui/material';

import DataDownloads from "../DataDownloads";
import LocationAdminExplorer from "../LocationAdminExplorer";
import Sidebar from "../../components/Sidebar";
import {useAppDispatch} from '../../hooks/redux';
import {getUserProfile, logout} from "../../redux/app/thunk.ts";


export default function App() {
    const dispatch = useAppDispatch();
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [selectedMenuIndex, setSelectedMenuIndex] = useState<number>();
    const location = useLocation();

    const drawerWidth = 240

    useEffect(() => {
        dispatch(getUserProfile());
    }, [dispatch]);

    const handleLogout = () => {
        dispatch(logout())
    }

    const menuList = [
        {
            text: 'Data downloads',
            icon: <BrowserUpdatedIcon/>,
            to: '/data-downloads',
        },
        {
            text: 'Location admin explorer',
            icon: <PublicIcon/>,
            to: '/location-admin-explorer',
        },
    ]

    useEffect(() => {
        const menuIndex = menuList.findIndex((menuItem) => (
            menuItem.to === location.pathname
        ));
        setSelectedMenuIndex(menuIndex);
    }, [location.pathname]);

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
                            style={{color: 'white'}}
                        >
                            <MenuIcon/>
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Sidebar drawerOpen={drawerOpen} menuList={menuList} selectedMenuIndex={selectedMenuIndex}
                         handleLogout={handleLogout} drawerWidth={drawerWidth}/>
                <Box sx={{ flexGrow: 1, p: 1, ml: !drawerOpen ? `-${drawerWidth}px` : 0, transition: "all .2s" }}>
                    <Toolbar/>
                    <Routes>
                        <Route path="/data-downloads" element={<DataDownloads/>}/>
                        <Route path="/location-admin-explorer" element={<LocationAdminExplorer/>}/>
                        <Route
                            path="/"
                            element={
                                <Navigate to='/data-downloads' replace/>
                            }
                        />
                    </Routes>
                </Box>
            </Box>
        </>
    );
}
