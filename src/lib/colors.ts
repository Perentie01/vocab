/**
 * Vox Color Palette System
 * Rusty Red and Teal theme with complementary colors
 * All colors defined in OKLCH format for better color harmony
 */

export const VoxPalette = {
  // Primary: Rusty Red
  primary: {
    light: 'oklch(0.65 0.18 25)',
    main: 'oklch(0.55 0.2 25)',
    dark: 'oklch(0.5 0.22 25)',
    darker: 'oklch(0.45 0.2 25)',
    darkest: 'oklch(0.4 0.18 25)',
  },

  // Accent: Teal (Complementary)
  accent: {
    light: 'oklch(0.8 0.12 200)',
    main: 'oklch(0.7 0.15 200)',
    dark: 'oklch(0.5 0.15 200)',
  },

  // Neutral: Grays
  neutral: {
    50: 'oklch(0.98 0.001 0)',
    100: 'oklch(0.95 0.001 0)',
    200: 'oklch(0.92 0.004 286.32)',
    300: 'oklch(0.85 0.005 65)',
    400: 'oklch(0.7 0.005 65)',
    500: 'oklch(0.552 0.016 285.938)',
    600: 'oklch(0.4 0.015 65)',
    700: 'oklch(0.235 0.015 65)',
    800: 'oklch(0.141 0.005 285.823)',
    900: 'oklch(0.1 0.005 65)',
  },

  // Semantic Colors
  success: 'oklch(0.65 0.18 142)',
  warning: 'oklch(0.7 0.18 60)',
  error: 'oklch(0.577 0.245 27.325)',
  info: 'oklch(0.65 0.18 200)',

  // Background & Text
  background: {
    light: 'oklch(1 0 0)',
    dark: 'oklch(0.141 0.005 285.823)',
  },
  text: {
    light: 'oklch(0.235 0.015 65)',
    dark: 'oklch(0.85 0.005 65)',
  },
} as const;

// Tailwind utility classes for quick access
export const colorClasses = {
  primary: {
    bg: 'bg-[oklch(0.55_0.2_25)]',
    text: 'text-[oklch(0.55_0.2_25)]',
    border: 'border-[oklch(0.55_0.2_25)]',
  },
  accent: {
    bg: 'bg-[oklch(0.7_0.15_200)]',
    text: 'text-[oklch(0.7_0.15_200)]',
    border: 'border-[oklch(0.7_0.15_200)]',
  },
} as const;
