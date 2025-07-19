import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6C47FF', // Modern purple accent
      contrastText: '#fff',
    },
    secondary: {
      main: '#00C6AE', // Teal accent
      contrastText: '#fff',
    },
    background: {
      default: '#F7F8FA', // Soft neutral background
      paper: '#FFFFFF',
      accent: 'linear-gradient(90deg, #6C47FF 0%, #00C6AE 100%)',
    },
    text: {
      primary: '#222B45',
      secondary: '#6B7280',
    },
    divider: '#E5E7EB',
  },
  typography: {
    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 800,
      letterSpacing: '-0.03em',
      lineHeight: 1.1,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.15,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.7,
    },
    body2: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      fontSize: '1rem',
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 2px 8px rgba(108, 71, 255, 0.08)', // subtle shadow for cards/buttons
    ...Array(23).fill('0px 2px 8px rgba(108, 71, 255, 0.08)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(108, 71, 255, 0.08)',
          fontWeight: 700,
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #6C47FF 0%, #00C6AE 100%)',
          color: '#fff',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 2px 16px rgba(108, 71, 255, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '32px',
          paddingRight: '32px',
        },
      },
    },
  },
});

export default theme;

