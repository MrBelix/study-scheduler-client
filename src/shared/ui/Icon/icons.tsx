import { type ReactNode } from 'react';

// Icon registry — single source for the app's glyphs. All render inside a 24×24
// viewBox as outline line-icons (stroke, round caps). Add new icons here by name.

export const icons: Record<string, ReactNode> = {
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.2 2.7-5 6-5s6 1.8 6 5" />
      <path d="M16 5.2a3 3 0 010 5.6" />
      <path d="M17.5 15c2.4.3 3.8 1.9 3.8 4.6" />
    </>
  ),
  barChart: (
    <>
      <path d="M4 20V11M10 20V5M16 20v-7" />
      <path d="M3 20h18" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c0-3.6 3.3-6 7.5-6s7.5 2.4 7.5 6" />
    </>
  ),
};

export type IconName = keyof typeof icons;
