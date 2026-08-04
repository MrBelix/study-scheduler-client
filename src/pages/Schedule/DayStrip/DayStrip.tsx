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
 * · DayCell states". Keeps the selected day scrolled into view (covers both
 * the initial "today visible on mount" requirement and the "jump to today"
 * chip, which just re-selects today). Centered rather than `nearest` so the
 * upcoming days — the primary browsing direction — stay visible instead of
 * the selected cell parking at the trailing edge.
 */
export function DayStrip({ days, byDay, selectedKey, todayKey, onSelect }: DayStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current
      ?.querySelector<HTMLElement>(`[data-day="${selectedKey}"]`)
      ?.scrollIntoView({ inline: 'center', block: 'nearest' });
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
