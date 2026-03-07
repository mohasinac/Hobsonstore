/**
 * Comic-style design tokens for Hobson Collectibles.
 * Use these constants throughout components instead of raw Tailwind colour strings.
 */

export const COLORS = {
  // Brand palette
  BLACK: "#0D0D0D",
  WHITE: "#FFFFFF",
  YELLOW: "#FFE500",
  RED: "#E8001C",
  BLUE: "#0057FF",
  INK: "#1A1A2E",            // near-black for text on light backgrounds

  // Surface colours
  SURFACE_LIGHT: "#FFFEF0",  // warm off-white
  SURFACE_DARK: "#0D0D0D",
  SURFACE_YELLOW: "#FFE500",
  SURFACE_RED: "#E8001C",
  SURFACE_BLUE: "#0057FF",

  // Text
  TEXT_ON_LIGHT: "#0D0D0D",
  TEXT_ON_DARK: "#FFFFFF",
  TEXT_ON_YELLOW: "#0D0D0D",
  TEXT_MUTED: "#6B6B6B",

  // Borders
  BORDER: "#0D0D0D",          // thick comic ink line

  // Accents for hover / active states
  YELLOW_DARK: "#D4BF00",
  RED_DARK: "#B50016",
  BLUE_DARK: "#003DBF",
} as const;

export const SHADOWS = {
  /** Hard-offset drop shadow — classic comic panel look */
  COMIC_SM: "3px 3px 0px #0D0D0D",
  COMIC_MD: "4px 4px 0px #0D0D0D",
  COMIC_LG: "6px 6px 0px #0D0D0D",
  COMIC_XL: "8px 8px 0px #0D0D0D",
} as const;

export const BORDERS = {
  THIN: "2px solid #0D0D0D",
  NORMAL: "3px solid #0D0D0D",
  THICK: "4px solid #0D0D0D",
} as const;

/** CSS custom-property names — kept in sync with globals.css */
export const CSS_VARS = {
  FONT_COMIC: "var(--font-bangers)",
  FONT_BODY: "var(--font-inter)",
} as const;
