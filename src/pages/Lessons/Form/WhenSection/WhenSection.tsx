import { type ReactNode } from 'react';
import { m } from '@/paraglide/messages';
import { SectionLabel, TextField, FieldError, Icon } from '@/shared/ui';
import type { IconName } from '@/shared/ui';
import { cx } from '@/shared/lib';
import styles from './WhenSection.module.scss';

export type DateMode = 'today' | 'tomorrow' | 'custom';
export type DurationMode = '45' | '60' | '90' | 'custom';

interface WhenSectionProps {
  dateMode: DateMode;
  onDateModeChange: (mode: DateMode) => void;
  customDate: string;
  onCustomDateChange: (value: string) => void;
  maxDate: string;
  dateError?: string;
  time: string;
  onTimeChange: (value: string) => void;
  timeError?: string;
  durationMinutes: number;
  durationMode: DurationMode;
  onDurationModeChange: (mode: DurationMode) => void;
  customDuration: string;
  onCustomDurationChange: (value: string) => void;
  durationError?: string;
  /** Non-blocking warning when the device zone differs from the tutor's profile zone. */
  tzHint?: string;
}

const DURATION_PRESETS = ['45', '60', '90'] as const;

/** "Кінець" — derived from `time` + `durationMinutes`, wrapping past midnight. */
function computeEndTime(time: string, durationMinutes: number): string {
  const [h, min] = time.split(':').map(Number);
  if (!time || Number.isNaN(h) || Number.isNaN(min) || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return '–:–';
  }
  const total = (h * 60 + min + durationMinutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function Chip({ active, icon, onClick, children }: { active: boolean; icon?: IconName; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={cx(styles.chip, active && styles['chip--active'])} onClick={onClick}>
      {icon && <Icon name={icon} size={18} className={styles.chipIcon} />}
      {children}
    </button>
  );
}

/** "КОЛИ" — see design-system.html F8 lines 1106-1130. */
export function WhenSection({
  dateMode,
  onDateModeChange,
  customDate,
  onCustomDateChange,
  maxDate,
  dateError,
  time,
  onTimeChange,
  timeError,
  durationMinutes,
  durationMode,
  onDurationModeChange,
  customDuration,
  onCustomDurationChange,
  durationError,
  tzHint,
}: WhenSectionProps) {
  return (
    <div className={styles.section}>
      <SectionLabel>{m.lesson_form_section_when()}</SectionLabel>

      <div className={styles.chips}>
        <Chip active={dateMode === 'today'} onClick={() => onDateModeChange('today')}>
          {m.lesson_form_when_today()}
        </Chip>
        <Chip active={dateMode === 'tomorrow'} onClick={() => onDateModeChange('tomorrow')}>
          {m.lesson_form_when_tomorrow()}
        </Chip>
        <Chip active={dateMode === 'custom'} icon="calendar_month" onClick={() => onDateModeChange('custom')}>
          {m.lesson_form_when_date()}
        </Chip>
      </div>
      {dateMode === 'custom' ? (
        <TextField
          header={m.lesson_form_date()}
          value={customDate}
          onChange={onCustomDateChange}
          type="date"
          max={maxDate}
          error={dateError}
          required
        />
      ) : (
        dateError && <FieldError message={dateError} />
      )}

      <div className={styles.timeCard}>
        <label className={styles.timeCell}>
          <span className={styles.timeLabel}>{m.lesson_form_time_start()}</span>
          <input
            type="time"
            className={styles.timeInput}
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
          />
        </label>
        <div className={styles.timeDivider} />
        <div className={styles.timeCell}>
          <span className={styles.timeLabel}>{m.lesson_form_time_end()}</span>
          <span className={styles.timeValue}>{computeEndTime(time, durationMinutes)}</span>
        </div>
      </div>
      {timeError && <FieldError message={timeError} />}
      {tzHint && <div className={styles.hint}>{tzHint}</div>}

      <div className={styles.durationChips}>
        {DURATION_PRESETS.map((d) => (
          <button
            key={d}
            type="button"
            className={cx(styles.durationChip, durationMode === d && styles['durationChip--active'])}
            onClick={() => onDurationModeChange(d)}
          >
            {m.minutes({ count: Number(d) })}
          </button>
        ))}
        <button
          type="button"
          className={cx(styles.durationChip, durationMode === 'custom' && styles['durationChip--active'])}
          onClick={() => onDurationModeChange('custom')}
        >
          {m.lesson_form_duration_custom()}
        </button>
      </div>
      {durationMode === 'custom' && (
        <div className={styles.customDuration}>
          <input
            className={styles.customDurationInput}
            inputMode="numeric"
            value={customDuration}
            onChange={(e) => onCustomDurationChange(e.target.value)}
            placeholder="60"
          />
          <span className={styles.customDurationSuffix}>{m.lesson_form_duration_helper()}</span>
        </div>
      )}
      {durationError && <FieldError message={durationError} />}
    </div>
  );
}
