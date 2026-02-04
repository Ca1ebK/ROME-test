"use client";

import { createTheme, ThemeOptions } from "@mui/material/styles";

// M3 Color Palette - Default Material Design 3 (Blue/Purple baseline)
// Based on Google's default M3 dark theme
const m3Colors = {
  // Primary - M3 Default Blue
  primary: {
    main: "#D0BCFF",
    light: "#EADDFF",
    dark: "#6750A4",
    contrastText: "#381E72",
  },
  // Secondary
  secondary: {
    main: "#CCC2DC",
    light: "#E8DEF8",
    dark: "#625B71",
    contrastText: "#332D41",
  },
  // Tertiary
  tertiary: {
    main: "#EFB8C8",
    light: "#FFD8E4",
    dark: "#7D5260",
    contrastText: "#492532",
  },
  // Error
  error: {
    main: "#F2B8B5",
    light: "#F9DEDC",
    dark: "#B3261E",
    contrastText: "#601410",
  },
  // Success
  success: {
    main: "#A8DAB5",
    light: "#C8EED2",
    dark: "#386A20",
    contrastText: "#1B5000",
  },
  // Warning
  warning: {
    main: "#FFD599",
    light: "#FFEAC2",
    dark: "#7D5800",
    contrastText: "#4A3800",
  },
  // Surface colors for dark theme (M3 default)
  surface: {
    main: "#141218",
    dim: "#141218",
    bright: "#3B383E",
    containerLowest: "#0F0D13",
    containerLow: "#1D1B20",
    container: "#211F26",
    containerHigh: "#2B2930",
    containerHighest: "#36343B",
  },
  // On-surface colors
  onSurface: {
    main: "#E6E0E9",
    variant: "#CAC4D0",
  },
  // Outline
  outline: {
    main: "#938F99",
    variant: "#49454F",
  },
};

// M3 Typography Scale
const m3Typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  // Display
  displayLarge: {
    fontSize: "3.5625rem", // 57px
    fontWeight: 400,
    lineHeight: 1.12,
    letterSpacing: "-0.25px",
  },
  displayMedium: {
    fontSize: "2.8125rem", // 45px
    fontWeight: 400,
    lineHeight: 1.16,
    letterSpacing: "0px",
  },
  displaySmall: {
    fontSize: "2.25rem", // 36px
    fontWeight: 400,
    lineHeight: 1.22,
    letterSpacing: "0px",
  },
  // Headline
  headlineLarge: {
    fontSize: "2rem", // 32px
    fontWeight: 400,
    lineHeight: 1.25,
    letterSpacing: "0px",
  },
  headlineMedium: {
    fontSize: "1.75rem", // 28px
    fontWeight: 400,
    lineHeight: 1.29,
    letterSpacing: "0px",
  },
  headlineSmall: {
    fontSize: "1.5rem", // 24px
    fontWeight: 400,
    lineHeight: 1.33,
    letterSpacing: "0px",
  },
  // Title
  titleLarge: {
    fontSize: "1.375rem", // 22px
    fontWeight: 500,
    lineHeight: 1.27,
    letterSpacing: "0px",
  },
  titleMedium: {
    fontSize: "1rem", // 16px
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: "0.15px",
  },
  titleSmall: {
    fontSize: "0.875rem", // 14px
    fontWeight: 500,
    lineHeight: 1.43,
    letterSpacing: "0.1px",
  },
  // Label
  labelLarge: {
    fontSize: "0.875rem", // 14px
    fontWeight: 500,
    lineHeight: 1.43,
    letterSpacing: "0.1px",
  },
  labelMedium: {
    fontSize: "0.75rem", // 12px
    fontWeight: 500,
    lineHeight: 1.33,
    letterSpacing: "0.5px",
  },
  labelSmall: {
    fontSize: "0.6875rem", // 11px
    fontWeight: 500,
    lineHeight: 1.45,
    letterSpacing: "0.5px",
  },
  // Body
  bodyLarge: {
    fontSize: "1rem", // 16px
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: "0.5px",
  },
  bodyMedium: {
    fontSize: "0.875rem", // 14px
    fontWeight: 400,
    lineHeight: 1.43,
    letterSpacing: "0.25px",
  },
  bodySmall: {
    fontSize: "0.75rem", // 12px
    fontWeight: 400,
    lineHeight: 1.33,
    letterSpacing: "0.4px",
  },
};

// M3 Shape (corner radius) tokens
const m3Shape = {
  borderRadius: 12, // Medium (default)
  // Additional shape tokens
  none: 0,
  extraSmall: 4,
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 28,
  full: 9999,
};

// M3 Motion tokens
const m3Motion = {
  duration: {
    short1: 50,
    short2: 100,
    short3: 150,
    short4: 200,
    medium1: 250,
    medium2: 300,
    medium3: 350,
    medium4: 400,
    long1: 450,
    long2: 500,
    long3: 550,
    long4: 600,
    extraLong1: 700,
    extraLong2: 800,
    extraLong3: 900,
    extraLong4: 1000,
  },
  easing: {
    emphasized: "cubic-bezier(0.2, 0, 0, 1)",
    emphasizedDecelerate: "cubic-bezier(0.05, 0.7, 0.1, 1)",
    emphasizedAccelerate: "cubic-bezier(0.3, 0, 0.8, 0.15)",
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    standardDecelerate: "cubic-bezier(0, 0, 0, 1)",
    standardAccelerate: "cubic-bezier(0.3, 0, 1, 1)",
    legacy: "cubic-bezier(0.4, 0, 0.2, 1)",
    legacyDecelerate: "cubic-bezier(0, 0, 0.2, 1)",
    legacyAccelerate: "cubic-bezier(0.4, 0, 1, 1)",
    linear: "cubic-bezier(0, 0, 1, 1)",
  },
};

// Create the theme
const themeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: m3Colors.primary,
    secondary: m3Colors.secondary,
    error: m3Colors.error,
    success: m3Colors.success,
    warning: m3Colors.warning,
    background: {
      default: m3Colors.surface.main,
      paper: m3Colors.surface.container,
    },
    text: {
      primary: m3Colors.onSurface.main,
      secondary: m3Colors.onSurface.variant,
    },
    divider: m3Colors.outline.variant,
  },
  typography: {
    fontFamily: m3Typography.fontFamily,
    h1: m3Typography.displayLarge,
    h2: m3Typography.displayMedium,
    h3: m3Typography.displaySmall,
    h4: m3Typography.headlineLarge,
    h5: m3Typography.headlineMedium,
    h6: m3Typography.headlineSmall,
    subtitle1: m3Typography.titleLarge,
    subtitle2: m3Typography.titleMedium,
    body1: m3Typography.bodyLarge,
    body2: m3Typography.bodyMedium,
    button: m3Typography.labelLarge,
    caption: m3Typography.bodySmall,
    overline: m3Typography.labelSmall,
  },
  shape: {
    borderRadius: m3Shape.medium,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: m3Colors.surface.main,
          color: m3Colors.onSurface.main,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: m3Shape.full,
          textTransform: "none",
          fontWeight: 500,
          padding: "10px 24px",
          transition: `all ${m3Motion.duration.short4}ms ${m3Motion.easing.standard}`,
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 1px 3px 1px rgba(0,0,0,0.15), 0px 1px 2px 0px rgba(0,0,0,0.3)",
          },
        },
        outlined: {
          borderColor: m3Colors.outline.main,
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: `all ${m3Motion.duration.short4}ms ${m3Motion.easing.standard}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: m3Shape.large,
          backgroundColor: m3Colors.surface.container,
          backgroundImage: "none",
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        rounded: {
          borderRadius: m3Shape.large,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: m3Shape.small,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: m3Colors.surface.containerHigh,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: m3Shape.extraSmall,
            "& fieldset": {
              borderColor: m3Colors.outline.main,
            },
            "&:hover fieldset": {
              borderColor: m3Colors.onSurface.main,
            },
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 52,
          height: 32,
          padding: 0,
        },
        switchBase: {
          padding: 4,
          "&.Mui-checked": {
            transform: "translateX(20px)",
            "& + .MuiSwitch-track": {
              backgroundColor: m3Colors.primary.main,
              opacity: 1,
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
          boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
        },
        track: {
          borderRadius: m3Shape.full,
          backgroundColor: m3Colors.surface.containerHighest,
          opacity: 1,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: m3Shape.extraLarge,
          backgroundColor: m3Colors.surface.containerHigh,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          height: 16,
        },
        thumb: {
          width: 20,
          height: 20,
        },
        track: {
          borderRadius: m3Shape.full,
        },
        rail: {
          borderRadius: m3Shape.full,
          backgroundColor: m3Colors.surface.containerHighest,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: m3Shape.large,
          textTransform: "none",
          boxShadow: "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: m3Shape.full,
          height: 8,
          backgroundColor: m3Colors.surface.containerHighest,
        },
        bar: {
          borderRadius: m3Shape.full,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: m3Colors.primary.main,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: m3Shape.medium,
        },
        standardError: {
          backgroundColor: "rgba(186, 26, 26, 0.1)",
          color: m3Colors.error.light,
        },
        standardSuccess: {
          backgroundColor: "rgba(56, 106, 32, 0.1)",
          color: m3Colors.success.light,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: m3Colors.primary.main,
          color: m3Colors.primary.contrastText,
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: m3Shape.medium,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: m3Shape.medium,
          transition: `all ${m3Motion.duration.short4}ms ${m3Motion.easing.standard}`,
          "&:hover": {
            backgroundColor: m3Colors.surface.containerHigh,
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: m3Shape.full,
          textTransform: "none",
          fontWeight: 500,
          borderColor: m3Colors.outline.main,
          "&.Mui-selected": {
            backgroundColor: m3Colors.secondary.main,
            color: m3Colors.secondary.contrastText,
            "&:hover": {
              backgroundColor: m3Colors.secondary.dark,
            },
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          backgroundColor: m3Colors.surface.container,
          borderRadius: m3Shape.full,
          padding: 4,
          gap: 4,
        },
        grouped: {
          border: 0,
          "&:not(:first-of-type)": {
            borderRadius: m3Shape.full,
            marginLeft: 0,
          },
          "&:first-of-type": {
            borderRadius: m3Shape.full,
          },
        },
      },
    },
  },
};

export const theme = createTheme(themeOptions);

// Export M3 tokens for use in custom components
export const m3Tokens = {
  colors: m3Colors,
  typography: m3Typography,
  shape: m3Shape,
  motion: m3Motion,
};

// Export type for m3Tokens
export type M3Tokens = typeof m3Tokens;
