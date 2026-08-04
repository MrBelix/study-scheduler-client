import { useEffect, useState } from 'react';
import { m } from '@/paraglide/messages';
import { Icon, Button, showToast } from '@/shared/ui';
import { useBackButton } from '@/shared/tg';
import { cx, dateKey, isValidDuration } from '@/shared/lib';
import { useCreateLesson } from '@/features/lessons/queries';
import { WEEKDAY_FLAGS, weekdayShortLabel, weekdaysLabel } from '@/features/lessons/model';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { StepHeading } from '../StepHeading/StepHeading';
import { StepActions } from '../StepActions/StepActions';
import styles from './FirstLessonsStep.module.scss';

interface FirstLessonsStepProps {
  studentId: string;
  studentName: string;
  onFinish: () => void;
  onManual: () => void;
  onBack: () => void;
}

/** "Початок" defaults to the next full hour (same rule F8's LessonFormPage uses) so the form never opens with an empty required time field. */
function nextFullHour(from: Date): string {
  const hour = (from.getHours() + (from.getMinutes() > 0 ? 1 : 0)) % 24;
  return `${String(hour).padStart(2, '0')}:00`;
}

/**
 * O4 — the just-created student's first weekly series, created through the
 * same `POST /lessons` + `repeat` route as F8. No price/topic/end-date here —
 * price falls back to the student's rate, the series stays open-ended (design-
 * system.html O4 "Онбординг — перші уроки"). The ghost action exits to a
 * one-off lesson for a tutor whose schedule isn't weekly. `onBack` returns to
 * O3 with the created student, which switches that step into edit mode.
 */
export function FirstLessonsStep({ studentId, studentName, onFinish, onManual, onBack }: FirstLessonsStepProps) {
  const [weekdays, setWeekdays] = useState<Set<string>>(new Set());
  const [time, setTime] = useState(() => nextFullHour(new Date()));
  const [duration, setDuration] = useState('60');
  const [title, setTitle] = useState('');

  const createSeries = useCreateLesson();

  useBackButton(onBack);

  useEffect(() => {
    if (createSeries.isError) showToast(m.form_error_save());
  }, [createSeries.isError]);

  const toggleWeekday = (flag: string) => {
    setWeekdays((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) next.delete(flag);
      else next.add(flag);
      return next;
    });
  };

  const durationMinutes = Number(duration);
  const valid = weekdays.size > 0 && time !== '' && isValidDuration(durationMinutes);
  const effectiveTitle = title.trim() || undefined;
  const selectedDays = WEEKDAY_FLAGS.filter((d) => weekdays.has(d));

  const finish = () => {
    if (!valid || createSeries.isPending) return;
    createSeries.mutate(
      {
        studentId,
        date: dateKey(new Date()),
        startTimeLocal: `${time}:00`,
        durationMinutes,
        repeat: {
          weekdays: selectedDays.join(', '),
          title: effectiveTitle,
        },
      },
      { onSuccess: onFinish },
    );
  };

  return (
    <div className={styles.step}>
      <div className={styles.scroll}>
        <ProgressBar step={3} total={4} />
        <StepHeading
          title={m.onboarding_lessons_title({ name: studentName })}
          subtitle={m.onboarding_lessons_subtitle()}
        />

        <div className={styles.weekdays}>
          {WEEKDAY_FLAGS.map((flag, i) => (
            <button
              key={flag}
              type="button"
              className={cx(styles.weekday, weekdays.has(flag) && styles['weekday--active'])}
              onClick={() => toggleWeekday(flag)}
            >
              {weekdayShortLabel(i)}
            </button>
          ))}
        </div>

        <div className={styles.card}>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{m.lesson_form_time()}</span>
            <input
              type="time"
              className={styles.rowInput}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className={styles.divider} />
          <div className={styles.row}>
            <span className={styles.rowLabel}>{m.onboarding_lessons_duration_label()}</span>
            <input
              className={styles.rowInputNumeric}
              inputMode="numeric"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              onFocus={(e) => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' })}
            />
            <span className={styles.rowSuffix}>{m.onboarding_lessons_minutes_suffix()}</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.row}>
            <span className={styles.rowLabel}>{m.lesson_form_title()}</span>
            <input
              className={styles.rowInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={(e) => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' })}
              placeholder={m.lesson_form_title_placeholder()}
            />
          </div>
        </div>

        {weekdays.size > 0 && time !== '' && (
          <div className={styles.hint}>
            <Icon name="event_repeat" filled size={20} className={styles.hintIcon} />
            <span className={styles.hintText}>
              {effectiveTitle
                ? m.lesson_form_repeat_summary_titled({
                    title: effectiveTitle,
                    days: weekdaysLabel(selectedDays.join(', ')),
                    time,
                    duration: durationMinutes,
                  })
                : m.lesson_form_repeat_summary_plain({
                    days: weekdaysLabel(selectedDays.join(', ')),
                    time,
                    duration: durationMinutes,
                  })}
            </span>
          </div>
        )}
      </div>

      <StepActions>
        <Button
          variant="success"
          fullWidth
          icon="check_circle"
          iconFilled
          onClick={finish}
          disabled={!valid}
          loading={createSeries.isPending}
        >
          {m.onboarding_lessons_finish()}
        </Button>
        <Button variant="ghost" fullWidth onClick={onManual}>
          {m.onboarding_lessons_manual()}
        </Button>
      </StepActions>
    </div>
  );
}
