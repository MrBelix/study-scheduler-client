// JS-side design tokens. Mirror the CSS `--ds-*` contract so inline styles and
// SCSS stay in sync from one place.

/** Status color for a 0–100 progress/score value. Returns a `--ds-*` CSS var. */
export function statusColor(value: number): string {
  if (value >= 85) return 'var(--ds-color-success)';
  if (value >= 75) return 'var(--ds-color-warning)';
  return 'var(--ds-color-danger)';
}

/** Number of avatar gradients defined as `--ds-avatar-1..N` (see global.scss). */
const AVATAR_RAMP_SIZE = 7;

/**
 * Deterministic avatar background — a `--ds-avatar-N` CSS gradient picked from
 * the name. Same hash as the design prototype so colors are stable per student.
 */
export function avatarGradient(name: string): string {
  const str = String(name ?? '');
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % AVATAR_RAMP_SIZE;
  return `var(--ds-avatar-${h + 1})`;
}

/** 1–2 uppercase initials from a name, e.g. "Марія Коваленко" → "МК". */
export function avatarInitials(name: string): string {
  return String(name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
}
