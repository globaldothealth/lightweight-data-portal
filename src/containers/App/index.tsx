import {useEffect, useState} from "react";
import {Navigate, Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import {
    Menu as MenuIcon,
    BrowserUpdated as BrowserUpdatedIcon,
    Public as PublicIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import {
    AppBar,
    Box,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
} from '@mui/material';

import DataDownloads from "../DataDownloads";
import LocationAdminExplorer from "../LocationAdminExplorer";
import {useAppDispatch} from '../../hooks/redux';
import {getUserProfile, logout} from "../../redux/app/thunk.ts";


export default function App() {
    const dispatch = useAppDispatch();
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [selectedMenuIndex, setSelectedMenuIndex] = useState<number>();
    const location = useLocation();
    const navigate = useNavigate();

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
    }, [location.pathname, menuList]);


    const drawerWidth = 240;
    console.log(menuList)


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
                <Drawer
                    open={drawerOpen}
                    variant="persistent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: {width: drawerWidth, boxSizing: 'border-box'},
                    }}
                >
                    <Toolbar/>
                    <Box sx={{overflow: 'auto'}}>
                        <List>
                            {menuList.map(
                                (item, index) =>
                                    <ListItem
                                        key={item.text}
                                    >
                                        <ListItemButton
                                            onClick={() => navigate(item.to, {state: {lastLocation: location.pathname}})}
                                            selected={selectedMenuIndex === index}>
                                            <ListItemIcon>{item.icon}</ListItemIcon>
                                            <ListItemText primary={item.text}/>
                                        </ListItemButton>
                                    </ListItem>
                            )}
                        </List>
                        <Divider/>
                        <List>
                            <ListItem>
                                <ListItemButton onClick={handleLogout}>
                                    <ListItemIcon>
                                        <LogoutIcon/>
                                    </ListItemIcon>
                                    <ListItemText primary={'Logout'}/>
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Box>
                </Drawer>
                <Box component="main" sx={{flexGrow: 1, p: 3}}>
                    <Toolbar/>
                    <Routes>
                        <Route path="/data-downloads" element={<DataDownloads/>}/>
                        <Route path="/location-admin-explorer" element={<LocationAdminExplorer/>}/>
                        <Route
                            path="/"
                            element={
                                <Navigate
                                    to={{
                                        pathname: '/data-downloads',
                                    }}
                                    replace
                                />
                            }
                        />
                    </Routes>
                </Box>
            </Box>
        </>
    );
}
