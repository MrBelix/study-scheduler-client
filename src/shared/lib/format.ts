const NBSP = ' ';

/** Absolute integer with thin-space (NBSP) thousands, e.g. 1050 → "1 050". */
export function fmt(n: number): string {
  return String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

/** Money with the hryvnia symbol, e.g. 2400 → "2 400 ₴". */
export function money(n: number): string {
  return `${fmt(n)} ₴`;
}

/** "450" / "450,50" / "1 050" → number; empty/invalid → undefined. */
export function parsePrice(raw: string): number | undefined {
  const cleaned = raw.replace(/\s/g, '').replace(',', '.');
  if (cleaned === '') return undefined;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : undefined;
}

/** Lesson duration rule shared by the forms: whole minutes, 15–600. */
export function isValidDuration(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes >= 15 && minutes <= 600;
}
