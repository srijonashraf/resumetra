/**
 * Formats a numeric score for display.
 *
 * - Integers show without decimals (e.g., 7 → "7")
 * - Floats show one decimal (e.g., 6.5 → "6.5")
 * - Repeating decimals are truncated (e.g., 6.6666 → "6.7")
 * - Null/undefined/NaN returns "0"
 */
export function formatScore(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "0";

  const rounded = Math.round(value * 10) / 10;

  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
}
