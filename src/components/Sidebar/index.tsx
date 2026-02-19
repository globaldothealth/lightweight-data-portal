import {JSX} from "react";
import {useLocation, useNavigate} from 'react-router-dom';
import {Logout as LogoutIcon} from '@mui/icons-material';
import {
    Box,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
} from '@mui/material';


interface SidebarProps {
    drawerOpen: boolean;
    menuList: { text: string; icon: JSX.Element; to: string }[];
    selectedMenuIndex: number | undefined;
    handleLogout: () => void;
    drawerWidth: number
}

export default function Sidebar({drawerOpen, menuList, selectedMenuIndex, handleLogout, drawerWidth}: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    return (<Drawer
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
    </Drawer>)
}

