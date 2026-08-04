import { m } from '@/paraglide/messages';
import { SectionLabel, FieldError } from '@/shared/ui';
import { cx } from '@/shared/lib';
import { DURATION_PRESETS } from './durationPresets';
import type { DurationMode } from './durationPresets';
import styles from './ScheduleCard.module.scss';

/** "Кінець" — derived from `time` + `durationMinutes`, wrapping past midnight. Mirrors F8's `WhenSection`. */
function computeEndTime(time: string, durationMinutes: number): string {
  const [h, min] = time.split(':').map(Number);
  if (!time || Number.isNaN(h) || Number.isNaN(min) || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return '–:–';
  }
  const total = (h * 60 + min + durationMinutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

interface ScheduleCardProps {
  time: string;
  onTimeChange: (value: string) => void;
  timeError?: string;
  durationMinutes: number;
  durationMode: DurationMode;
  onDurationModeChange: (mode: DurationMode) => void;
  customDuration: string;
  onCustomDurationChange: (value: string) => void;
  durationError?: string;
}

/** "Розклад" — time card (Початок/Кінець) + duration chips, adapted from F8's `WhenSection`. */
export function ScheduleCard({
  time,
  onTimeChange,
  timeError,
  durationMinutes,
  durationMode,
  onDurationModeChange,
  customDuration,
  onCustomDurationChange,
  durationError,
}: ScheduleCardProps) {
  return (
    <div className={styles.section}>
      <SectionLabel>{m.lesson_series_schedule()}</SectionLabel>

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
