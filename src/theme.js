'use client';
import { createTheme } from '@mui/material/styles';
import { Noto_Sans } from 'next/font/google';

const inter = Noto_Sans({
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
});

export const Colors = {
  primary: '#2D1999', // LIVE site color
  secondary: '#DF9755', // LIVE site color 
  tertiary: '#EF5A28',
  // primary: '#0097a7', // TEST site color
  // secondary: '#5e35b1', // TEST site color
  error: '#dc3545',
  warning: '#c29200',
  info: '#0277bd',
  success: '#198754',
  black: '#000000',
  white: '#ffffff',
  gray: '#757575',
};

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
    disableCssColorScheme: true,
  },
  typography: {
    fontFamily: inter.style.fontFamily,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'capitalize',
        },
      },
      defaultProps: {
        // disableRipple: true,
        disableElevation: true,
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      s_sm: 450,
      sm: 600,
      s_md: 769,
      md: 900,
      s_lg: 1024,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    // mode: 'dark',
    primary: {
      main: Colors.primary,
      contrastText: Colors.white,
    },
    secondary: {
      main: Colors.secondary,
      contrastText: Colors.white,
    },
    tertiary: {
      main: Colors.tertiary,
      contrastText: Colors.white,
    },
    error: {
      main: Colors.error,
      contrastText: Colors.white,
    },
    warning: {
      main: Colors.warning,
      contrastText: Colors.white,
    },
    info: {
      main: Colors.info,
      contrastText: Colors.white,
    },
    success: {
      main: Colors.success,
      contrastText: Colors.white,
    },
    white: {
      main: Colors.white,
      contrastText: Colors.black,
    },
    black: {
      main: Colors.black,
      contrastText: Colors.white,
    },
    gray: {
      main: Colors.gray,
      contrastText: Colors.white,
    },
  },
  colorSchemes: {
    light: true,
    dark: {
      palette: {
        primary: {
          main: '#3f97d6',
          contrastText: Colors.white,
        },
        secondary: {
          main: '#5f3611',
          contrastText: Colors.white,
        },
      },
    },
  },
});

export default theme;
