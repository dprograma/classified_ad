import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3B82F6', // Modern blue
      light: '#60A5FA',
      dark: '#1E40AF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8B5CF6', // Purple accent
      light: '#A78BFA',
      dark: '#7C3AED',
      contrastText: '#FFFFFF',
    },
    tertiary: {
      main: '#10B981', // Emerald green
      light: '#34D399',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAFBFC',
      paper: '#FFFFFF',
      accent: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #10B981 100%)',
      subtle: '#F8FAFC',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      disabled: '#94A3B8',
    },
    divider: '#E2E8F0',
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    fontWeightExtraBold: 700,
    h1: {
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      fontWeight: 700,
      letterSpacing: '-0.04em',
      lineHeight: 1.1,
      color: '#1E293B',
    },
    h2: {
      fontSize: 'clamp(2rem, 4vw, 3rem)',
      fontWeight: 600,
      letterSpacing: '-0.03em',
      lineHeight: 1.2,
      color: '#1E293B',
    },
    h3: {
      fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.3,
      color: '#1E293B',
    },
    h4: {
      fontSize: 'clamp(1.25rem, 2.5vw, 1.875rem)',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
      color: '#1E293B',
    },
    h5: {
      fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
      fontWeight: 500,
      lineHeight: 1.4,
      color: '#1E293B',
    },
    h6: {
      fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#1E293B',
    },
    subtitle1: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.6,
      color: '#64748B',
    },
    subtitle2: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.6,
      color: '#64748B',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
      color: '#475569',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#64748B',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
      color: '#94A3B8',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: '#94A3B8',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.05)',
    '0px 4px 6px rgba(0, 0, 0, 0.05)',
    '0px 10px 15px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px rgba(0, 0, 0, 0.05)',
    '0px 25px 50px rgba(0, 0, 0, 0.05)',
    ...Array(19).fill('0px 25px 50px rgba(0, 0, 0, 0.1)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E1 #F1F5F9',
          '&::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#F1F5F9',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#CBD5E1',
            borderRadius: 4,
            '&:hover': {
              backgroundColor: '#94A3B8',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontWeight: 600,
          transition: 'all 0.2s ease-in-out',
          boxShadow: 'none',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          color: '#FFFFFF',
          '&:hover': {
            background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
          color: '#FFFFFF',
          '&:hover': {
            background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.02), 0px 10px 15px rgba(0, 0, 0, 0.03)',
          border: '1px solid #F1F5F9',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 20px 25px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #F1F5F9',
        },
        elevation1: {
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.02)',
        },
        elevation2: {
          boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.03)',
        },
        elevation4: {
          boxShadow: '0px 20px 25px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #E2E8F0',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            '&:hover fieldset': {
              borderColor: '#3B82F6',
            },
            '&.Mui-focused fieldset': {
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '24px',
          paddingRight: '24px',
          '@media (min-width: 600px)': {
            paddingLeft: '32px',
            paddingRight: '32px',
          },
        },
      },
    },
  },
});

export default theme;

