// JS-side design tokens. Mirror the CSS `--ds-*` contract so inline styles and
// SCSS stay in sync from one place.

/** Number of avatar colors defined as `--ds-avatar-1..N` (see global.scss). */
const AVATAR_RAMP_SIZE = 5;

/**
 * Deterministic avatar background — a solid `--ds-avatar-N` color picked from
 * the name. Same hash as the design prototype so colors are stable per student.
 */
export function avatarColor(name: string): string {
  const str = String(name ?? '');
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % AVATAR_RAMP_SIZE;
  return `var(--ds-avatar-${h + 1})`;
}

/** Single uppercase initial from a name, e.g. "Марія Коваленко" → "М" (design-system.html "Аватар — літера імені"). */
export function avatarInitials(name: string): string {
  return String(name ?? '')
    .trim()
    .charAt(0)
    .toUpperCase();
}
