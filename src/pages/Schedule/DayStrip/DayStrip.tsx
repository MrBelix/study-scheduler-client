import { useEffect, useRef } from 'react';
import { Icon } from '@/shared/ui';
import type { Lesson } from '@/shared/api';
import { cx, dateKey } from '@/shared/lib';
import { dayCellState, dayDots, weekdayShortLabel } from '@/features/lessons/model';
import styles from './DayStrip.module.scss';

interface DayStripProps {
  /** Continuous day range to render (amendment 1) — not necessarily a whole number of weeks. */
  days: Date[];
  byDay: Map<string, Lesson[]>;
  selectedKey: string;
  todayKey: string;
  onSelect: (day: Date) => void;
}

/**
 * Horizontally scrolling multi-week strip — see design-system.html "DayStrip
 * · DayCell states". Keeps the selected day reachable (covers both the initial
 * "today visible on mount" requirement and the "jump to today" chip, which just
 * re-selects today), but only moves when it has to: re-centering a day that is
 * already on screen made every tap yank the strip sideways. Scrolling is done
 * on the strip's own `scrollLeft` rather than via `scrollIntoView`, which also
 * scrolls the ancestors and so jerked the whole page vertically whenever the
 * strip sat partly above the fold.
 */
export function DayStrip({ days, byDay, selectedKey, todayKey, onSelect }: DayStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = containerRef.current;
    const cell = strip?.querySelector<HTMLElement>(`[data-day="${selectedKey}"]`);
    if (!strip || !cell) return;

    // Measured against the strip's content (the strip is positioned, so
    // `offsetLeft` is relative to it) rather than against the viewport: the
    // content never moves, so the target below is absolute and re-running this
    // lands in the same place. A delta-based `scrollBy` was not idempotent —
    // WebKit applies a programmatic scroll asynchronously, so a second pass
    // re-measured the *pre-scroll* rects and applied the same delta again,
    // opening the strip half a screen past today on iOS.
    const start = cell.offsetLeft;
    const end = start + cell.offsetWidth;

    // If the tutor can see the day, they tapped what they meant — leave the
    // scroll exactly where they put it. Only a clipped or off-screen day is
    // worth moving for: a partly hidden cell, or the "today" chip after
    // browsing away. On mount the selected day sits a week or more past
    // the right edge, so this same check is what brings today into view at all.
    if (start >= strip.scrollLeft && end <= strip.scrollLeft + strip.clientWidth) return;

    // Centered when it does move, so the upcoming days — the primary browsing
    // direction — stay visible instead of the selected cell parking at the
    // trailing edge. The centred stop is itself a snap point, so the strip
    // lands where it is told instead of being nudged again afterwards.
    strip.scrollLeft = start - (strip.clientWidth - cell.offsetWidth) / 2;
  }, [selectedKey]);

  return (
    <div className={styles['strip']} ref={containerRef}>
      {days.map((day) => {
        const key = dateKey(day);
        const lessons = byDay.get(key) ?? [];
        const state = dayCellState(day, lessons, selectedKey, todayKey);
        const { dots, overflow } = dayDots(lessons);

        return (
          <button key={key} type="button" data-day={key} className={styles['cell']} onClick={() => onSelect(day)}>
            <span className={cx(styles['label'], state === 'today' && styles['label--today'])}>
              {weekdayShortLabel((day.getDay() + 6) % 7)}
            </span>
            <span className={cx(styles['circle'], styles[`circle--${state}`])}>
              {state === 'done' ? <Icon name="check" size={20} filled /> : day.getDate()}
            </span>
            <span className={styles['dotsRow']}>
              {overflow ? (
                <span className={styles['overflow']}>3+</span>
              ) : (
                dots.map((tone, i) => <span key={i} className={cx(styles['dot'], styles[`dot--${tone}`])} />)
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
