import {useEffect, useState} from "react";
import "@aws-amplify/ui-react/styles.css";
import {AppBar, Box, Drawer,CssBaseline, Toolbar, List, Divider, ListItem, ListItemButton, ListItemText, ListItemIcon, IconButton} from '@mui/material';
import DataDownloads from "../DataDownloads";
import LocationAdminExplorer from "../LocationAdminExplorer";
import LogoutIcon from '@mui/icons-material/Logout';
import PublicIcon from '@mui/icons-material/Public';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import MenuIcon from '@mui/icons-material/Menu';
import {useAppDispatch} from '../../hooks/redux';
import {getUserProfile, logout} from "../../redux/app/thunk.ts";
import {
    Link,
    Route,
    Routes,
    Navigate,
    useLocation,useNavigate

} from 'react-router-dom';


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
            icon: <BrowserUpdatedIcon />,
            to: { pathname: '/data-downloads', search: '' },
            displayCheck: (): boolean => true,
        },
        {
            text: 'Location admin explorer',
            icon: <PublicIcon />,
            to: { pathname: '/location-admin-explorer', search: '' },
            displayCheck: (): boolean => true,
        },
    ]

    useEffect(() => {
        const menuIndex = menuList.findIndex((menuItem) => {
            const pathname =
                typeof menuItem.to === 'string'
                    ? menuItem.to
                    : menuItem.to.pathname;
            return pathname === location.pathname;
        });
        setSelectedMenuIndex(menuIndex);
    }, [location.pathname, menuList]);


    const drawerWidth = 240;
    console.log(menuList)



    return (
        <>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <Toolbar>
                        <IconButton
                            aria-label="toggle drawer"
                            onClick={() => setDrawerOpen(!drawerOpen)}
                            edge="start"
                            data-testid="toggle-sidebar"
                            size="large"
                            style={{color: 'white'}}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Drawer
                    open={drawerOpen}
                    variant="persistent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                    }}
                >
                    <Toolbar />
                    <Box sx={{ overflow: 'auto' }}>
                        <List>
                            {menuList.map(
                                (item, index) =>
                                    item.displayCheck() && (

                                            <ListItem
                                                key={item.text}

                                            >

                                                <ListItemButton  onClick={() => navigate(item.to, { state: { lastLocation: location.pathname } })}selected={selectedMenuIndex === index}>
                                                <ListItemIcon>{item.icon}</ListItemIcon>

                                                <ListItemText primary={item.text}  />
                                                </ListItemButton>

                                            </ListItem>

                                    ),
                            )}
                        </List>
                        <Divider />
                        <List>
                            <ListItem>
                                <ListItemButton onClick={handleLogout}>
                                    <ListItemIcon>
                                        <LogoutIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={'Logout'} />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </Box>
                </Drawer>
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Toolbar />
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
            {/*<AppBar position="fixed" elevation={0}>*/}
            {/*    <Toolbar style={{marginLeft: 'auto', marginRight: '0px'}}>*/}
            {/*        <Button onClick={toggleDrawer(!drawerOpen)} variant="contained" color="secondary"*/}
            {/*                style={{height: '100%', width: '150px'}}>Open drawer</Button>*/}
            {/*        <Button onClick={handleLogout} variant="contained" color="error"*/}
            {/*                style={{height: '100%', width: '150px'}}>Sign Out</Button>*/}
            {/*    </Toolbar>*/}
            {/*</AppBar>*/}
            {/*<Drawer open={drawerOpen} onClose={toggleDrawer(false)} variant="persistent"*/}
            {/*        anchor="left"      sx={{*/}
            {/*    width: drawerWidth,*/}
            {/*    flexShrink: 0,*/}
            {/*    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },*/}
            {/*}}>*/}
            {/*    {DrawerList}*/}
            {/*</Drawer>*/}
            {/*<Routes>*/}
            {/*    <Route path="/data-downloads" element={<DataDownloads/>}/>*/}
            {/*    <Route*/}
            {/*        path="/"*/}
            {/*        element={*/}
            {/*            <Navigate*/}
            {/*                to={{*/}
            {/*                    pathname: '/data-downloads',*/}
            {/*                }}*/}
            {/*                replace*/}
            {/*            />*/}
            {/*        }*/}
            {/*    />*/}
            {/*</Routes>*/}
            {/*/!*<Grid container spacing={2} style={{width: '100%'}}>*!/*/}
            {/*/!*    <Grid size={10}></Grid>*!/*/}
            {/*/!*    <Grid size={2}>*!/*/}
            {/*/!*        <Button onClick={handleLogout} variant="contained" color="error"*!/*/}
            {/*/!*                style={{height: '100%', width: '100%'}}>Sign*!/*/}
            {/*/!*            Out</Button>*!/*/}
            {/*/!*    </Grid>*!/*/}
            {/*/!*    <DataDownloads/>*!/*/}
            {/*/!*</Grid>*!/*/}
        </>

    );
}
