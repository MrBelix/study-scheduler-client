// Split out from `ScheduleCard.tsx` so the constant can be imported by
// `SeriesEditPage` (to derive the initial duration mode) without a
// component file exporting non-component values (react-refresh/only-export-components).
export type DurationMode = '45' | '60' | '90' | 'custom';
export const DURATION_PRESETS: readonly DurationMode[] = ['45', '60', '90'];
