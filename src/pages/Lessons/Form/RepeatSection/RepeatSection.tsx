import { useState } from 'react';
import { m } from '@/paraglide/messages';
import { SectionLabel, SegmentedControl, Icon, FieldError } from '@/shared/ui';
import type { SegmentItem } from '@/shared/ui';
import { cx, formatDate } from '@/shared/lib';
import { WEEKDAY_FLAGS, weekdayShortLabel, weekdaysLabel } from '@/features/lessons/model';
import styles from './RepeatSection.module.scss';

type RepeatMode = 'never' | 'weekly';

interface RepeatSectionProps {
  mode: RepeatMode;
  onModeChange: (mode: RepeatMode) => void;
  weekdays: Set<string>;
  onToggleWeekday: (flag: string) => void;
  weekdaysError?: string;
  title: string;
  onTitleChange: (value: string) => void;
  /** Input placeholder only — topic when set, else a generic example. */
  titlePlaceholder: string;
  /** The name the series would actually get (typed title, else topic) — undefined shows the untitled summary sentence. */
  effectiveTitle: string | undefined;
  endDate: string;
  onEndDateChange: (value: string) => void;
  /** The lesson's own start date — a series can't end before it started. */
  minEndDate: string;
  endDateError?: string;
  time: string;
  durationMinutes: number;
}

/** "ПОВТОРЮВАТИ" — see design-system.html F8 lines 1148-1180. */
export function RepeatSection({
  mode,
  onModeChange,
  weekdays,
  onToggleWeekday,
  weekdaysError,
  title,
  onTitleChange,
  titlePlaceholder,
  effectiveTitle,
  endDate,
  onEndDateChange,
  minEndDate,
  endDateError,
  time,
  durationMinutes,
}: RepeatSectionProps) {
  const [endDateOpen, setEndDateOpen] = useState(Boolean(endDate));
  const segments: SegmentItem<RepeatMode>[] = [
    { label: m.lesson_form_repeat_never(), value: 'never' },
    { label: m.lesson_form_repeat_weekly(), value: 'weekly' },
  ];

  return (
    <div className={styles.section}>
      <SectionLabel>{m.lesson_form_section_repeat()}</SectionLabel>
      <SegmentedControl items={segments} value={mode} onChange={onModeChange} />

      {mode === 'weekly' && (
        <>
          <div className={styles.weekdays}>
            {WEEKDAY_FLAGS.map((flag, i) => (
              <button
                key={flag}
                type="button"
                className={cx(styles.weekday, weekdays.has(flag) && styles['weekday--active'])}
                onClick={() => onToggleWeekday(flag)}
              >
                {weekdayShortLabel(i)}
              </button>
            ))}
          </div>
          {weekdaysError && <FieldError message={weekdaysError} />}

          <div className={styles.card}>
            <div className={styles.row}>
              <span className={styles.rowLabel}>{m.lesson_form_title()}</span>
              <input
                className={styles.rowInput}
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                onFocus={(e) => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' })}
                placeholder={titlePlaceholder}
              />
            </div>
            <div className={styles.divider} />
            <button type="button" className={styles.row} onClick={() => setEndDateOpen((o) => !o)}>
              <span className={styles.rowLabel}>{m.lesson_form_end_row()}</span>
              <span className={styles.rowValue}>{endDate ? formatDate(endDate) : m.lesson_form_end_none()}</span>
              <Icon name="chevron_right" size={20} className={styles.rowChevron} />
            </button>
          </div>
          {endDateOpen && (
            <div className={styles.endEditor}>
              <input
                type="date"
                className={styles.endInput}
                value={endDate}
                min={minEndDate}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
              {endDate && (
                <button type="button" className={styles.endClear} onClick={() => onEndDateChange('')}>
                  {m.lesson_form_end_none()}
                </button>
              )}
            </div>
          )}
          {endDateError && <FieldError message={endDateError} />}

          {weekdays.size > 0 && time !== '' && (
            <div className={styles.banner}>
              <Icon name="event_repeat" filled size={20} className={styles.bannerIcon} />
              <span className={styles.bannerText}>
                {effectiveTitle
                  ? m.lesson_form_repeat_summary_titled({
                      title: effectiveTitle,
                      days: weekdaysLabel(WEEKDAY_FLAGS.filter((f) => weekdays.has(f)).join(', ')),
                      time,
                      duration: durationMinutes,
                    })
                  : m.lesson_form_repeat_summary_plain({
                      days: weekdaysLabel(WEEKDAY_FLAGS.filter((f) => weekdays.has(f)).join(', ')),
                      time,
                      duration: durationMinutes,
                    })}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
