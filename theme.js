// Theme configuration — edit this file to customize the look and feel.
//
// NOTE: index.html has a matching body background to prevent flash-of-white
// on load. If you change colors.bg, update the <style> in index.html too.

export const colors = {
  // Backgrounds & surfaces
  bg:           "#fdf8f0",
  surface:      "#f6eede",
  surfaceLight: "#fff",
  border:       "#e6dcc8",

  // Text
  text:         "#352f28",
  muted:        "#8a8174",

  // Accents — bright and friendly
  cyan:         "#1f8fb3",
  magenta:      "#e0537a",
  gold:         "#d99100",
  green:        "#3aa364",
  orange:       "#e8762b",
  purple:       "#8a5cd1",

  // Slice / pie palette (used for cutting up wholes)
  slice:        "#f6b545",

  // Grid overlay (used in SVG plots)
  grid:         "rgba(120, 110, 90, 0.10)",
  gridAxis:     "rgba(80, 75, 60, 0.25)",
};

export const fonts = {
  mono: "'Baloo 2', 'Gill Sans', Calibri, sans-serif",
};

// Maps color names used in :::callout, :::takehome directives to hex values.
export const accentMap = {
  cyan:    colors.cyan,
  magenta: colors.magenta,
  gold:    colors.gold,
  green:   colors.green,
  orange:  colors.orange,
  purple:  colors.purple,
  muted:   colors.muted,
};
