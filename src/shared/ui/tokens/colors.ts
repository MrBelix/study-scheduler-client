// JS-side design tokens. Mirror the CSS `--ds-*` contract so inline styles and
// SCSS stay in sync from one place.

/** Status color for a 0–100 progress/score value. Returns a `--ds-*` CSS var. */
export function statusColor(value: number): string {
  if (value >= 85) return 'var(--ds-color-success)';
  if (value >= 75) return 'var(--ds-color-warning)';
  return 'var(--ds-color-danger)';
}

/** Deterministic avatar background palette. */
export const AVATAR_PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#DDA0DD', '#F7B731', '#78C8C8',
] as const;

/** Pick a stable avatar color from a seed (e.g. a name). */
export function avatarColor(seed: string): string {
  return AVATAR_PALETTE[seed.charCodeAt(0) % AVATAR_PALETTE.length];
}
