/**
 * Comic-style design tokens for Hobson Collectibles.
 * Use these constants throughout components instead of raw Tailwind colour strings.
 */

export const COLORS = {
  // Brand palette — aligned with FatCat Collectibles
  BLACK: "#1A1A1A",
  WHITE: "#FFFFFF",
  YELLOW: "#F0C417",          // FatCat secondary accent
  RED: "#F83A3A",             // FatCat sale / error red
  BLUE: "#0057FF",
  PURPLE: "#803CEE",          // FatCat badge / highlight
  INK: "#1A1A1A",             // near-black for text on light backgrounds

  // Surface colours
  SURFACE_LIGHT: "#F0F0F0",  // FatCat page background (light grey)
  SURFACE_WHITE: "#FFFFFF",  // product cards, footer
  SURFACE_DARK: "#1A1A1A",
  SURFACE_YELLOW: "#F0C417",
  SURFACE_RED: "#F83A3A",
  SURFACE_BLUE: "#0057FF",

  // Text
  TEXT_ON_LIGHT: "#1A1A1A",
  TEXT_ON_DARK: "#FFFFFF",
  TEXT_ON_YELLOW: "#1A1A1A",
  TEXT_MUTED: "#737373",

  // Borders
  BORDER: "#1A1A1A",          // thick comic ink line

  // Accents for hover / active states
  YELLOW_DARK: "#C9A20F",
  RED_DARK: "#D42E2E",
  BLUE_DARK: "#003DBF",
  PURPLE_DARK: "#6833C4",

  // Rating stars
  STAR: "#FFB74A",            // FatCat amber star colour
} as const;

export const SHADOWS = {
  /** Hard-offset drop shadow — classic comic panel look */
  COMIC_SM: "3px 3px 0px #1A1A1A",
  COMIC_MD: "4px 4px 0px #1A1A1A",
  COMIC_LG: "6px 6px 0px #1A1A1A",
  COMIC_XL: "8px 8px 0px #1A1A1A",
} as const;

export const BORDERS = {
  THIN: "2px solid #1A1A1A",
  NORMAL: "3px solid #1A1A1A",
  THICK: "4px solid #1A1A1A",
} as const;

/** CSS custom-property names — kept in sync with globals.css */
export const CSS_VARS = {
  FONT_COMIC: "var(--font-bangers)",
  FONT_BODY: "var(--font-inter)",
} as const;
