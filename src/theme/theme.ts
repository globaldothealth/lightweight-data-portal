import {createTheme} from '@mui/material/styles';

// to use our custom theme values in TypeScript we need to extend the Theme/ThemeOptions types via module augmentation.
declare module '@mui/material/styles' {
    interface Theme {
        custom: {
            palette: {
                button: {
                    buttonCaption: string;
                    customizeButtonColor: string;
                };
                tooltip: {
                    backgroundColor: string;
                    textColor: string;
                };
                appBar: {
                    backgroundColor: string;
                };
                landingPage: {
                    descriptionTextColor: string;
                };
                link: {
                    color: string;
                };
            };
        };
        drawerWidth: number;
    }

    // allow configuration using `createTheme`
    interface ThemeOptions {
        custom?: {
            palette?: {
                button?: {
                    buttonCaption?: string;
                    customizeButtonColor?: string;
                };
                tooltip?: {
                    backgroundColor?: string;
                    textColor?: string;
                };
                appBar?: {
                    backgroundColor?: string;
                };
                landingPage?: {
                    descriptionTextColor?: string;
                };
                link?: {
                    color?: string;
                };
            };
        };
        drawerWidth?: number;
    }
}

export const theme = createTheme({
    palette: {
        text: {
            secondary: "#454545",
            primary: "#1E1E1E",
        },
        background: {
            default: '#ECF3F0',
            paper: '#fff',
        },
        primary: {
            main: '#0E7569',
            light: "#00C6AF",
            contrastText: '#fff',
        },
        secondary: {
            main: '#BAC0BE',
            contrastText: '#fff',
        },
        error: {
            main: '#FD685B',
            contrastText: '#454545',
        },
    },
    typography: {
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        h1: {
            fontSize: '2rem',
            fontWeight: 'bold',
        },
        h2: {
            fontSize: '1.8rem',
            fontWeight: 'bold',
        },
        h3: {
            fontSize: '1.6rem',
            fontWeight: 'bold',
        },
        h4: {
            fontSize: '1.4rem',
            fontWeight: 'bold',
        },
        h5: {
            fontSize: '1.2rem',
            fontWeight: 'bold',
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 'bold',
        },
    },
    shape: {
        borderRadius: 4,
    },
    components: {
        MuiListItem: {
            styleOverrides: {
                root: {
                    color: '#5D5D5D',
                    borderRadius: '4px',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    color: '#5D5D5D',
                    borderRadius: '4px',
                    '& .MuiSvgIcon-root': {
                        color: '#5D5D5D',
                    },
                    '&.Mui-selected': {
                        backgroundColor: '#ecf3f0',
                        color: '#0E7569',
                        '& .MuiSvgIcon-root': {
                            color: '#0E7569',
                        },
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                colorPrimary: {
                    backgroundColor: '#ECF3F0',
                },
            },
        },
        MuiCheckbox: {
            styleOverrides: {
                colorSecondary: {
                    '&.Mui-checked': {
                        color: '#31A497',
                    },
                },
            },
        },
        MuiTablePagination: {
            styleOverrides: {
                root: {
                    border: 'unset',
                    fontFamily: 'Inter',
                    '& .MuiTablePagination-select': {
                        fontFamily: 'Inter',
                    },
                    '&&& .MuiTypography-root': {
                        fontFamily: 'Inter',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    fontFamily: 'Inter',
                    '&&& .MuiTypography-root': {
                        fontFamily: 'Inter',
                    },
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    fontFamily: 'Inter',
                    '&&& .MuiTypography-root': {
                        fontFamily: 'Inter',
                    },
                },
            },
        },
    },
    custom: {
        palette: {
            button: {
                buttonCaption: '#ECF3F0',
                customizeButtonColor: '#ECF3F0',
            },
            tooltip: {
                backgroundColor: '#FEEFC3',
                textColor: 'rgba(0, 0, 0, 0.87)',
            },
            appBar: {
                backgroundColor: '#31A497',
            },
            landingPage: {
                descriptionTextColor: '#838D89',
            },
            link: {
                color: '#5D5D5D',
            },
        },
    },
    drawerWidth: 240,
});
