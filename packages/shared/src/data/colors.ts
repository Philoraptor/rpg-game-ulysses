/**
 * Legacy 16-Color Text Palette
 *
 * @module shared/data/colors
 * @fileoverview The original engine's 16 text colors (reference_sheet.txt:14-29).
 * Message color indices in the protocol refer to this table.
 */

export const LEGACY_COLORS: readonly string[] = [
  '#000000', // 0  Black
  '#0000aa', // 1  Blue
  '#00aa00', // 2  Green
  '#00aaaa', // 3  Cyan
  '#aa0000', // 4  Red
  '#aa00aa', // 5  Magenta
  '#aa5500', // 6  Brown
  '#aaaaaa', // 7  Grey
  '#555555', // 8  DarkGrey
  '#5555ff', // 9  BrightBlue
  '#55ff55', // 10 BrightGreen
  '#55ffff', // 11 BrightCyan
  '#ff5555', // 12 BrightRed
  '#ff55ff', // 13 BrightMagenta
  '#ffff55', // 14 Yellow
  '#ffffff', // 15 White
];

export const C = {
  Black: 0,
  Blue: 1,
  Green: 2,
  Cyan: 3,
  Red: 4,
  Magenta: 5,
  Brown: 6,
  Grey: 7,
  DarkGrey: 8,
  BrightBlue: 9,
  BrightGreen: 10,
  BrightCyan: 11,
  BrightRed: 12,
  BrightMagenta: 13,
  Yellow: 14,
  White: 15,
} as const;
