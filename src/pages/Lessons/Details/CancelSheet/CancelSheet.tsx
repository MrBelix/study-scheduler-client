import { useEffect, useState } from 'react';
import { m } from '@/paraglide/messages';
import { BottomSheet, Button, Switch, Icon, showToast } from '@/shared/ui';
import { haptic } from '@/shared/tg';
import type { Lesson, LessonSeries } from '@/shared/api';
import { addDays, apiFormErrors, cx, dateKey, formatDayMonth } from '@/shared/lib';
import { useUpdateLesson, useUpdateSeries, useCancelSeries } from '@/features/lessons/queries';
import { weekdaysLabel } from '@/features/lessons/model';
import { SheetHeader } from '../SheetHeader/SheetHeader';
import styles from './CancelSheet.module.scss';

type Scope = 'single' | 'series';

interface CancelSheetProps {
  lesson: Lesson;
  series: LessonSeries | undefined;
  onClose: () => void;
  /** Fired once "this and all future" lands — the occurrence's own id usually stops resolving. */
  onSeriesCancelled: () => void;
}

/**
 * F3 — see design-system.html lines 539-591. The scope choice (this lesson vs.
 * this-and-all-future) only exists for a series-linked lesson; a one-off
 * lesson skips straight to a plain confirm.
 *
 * "This and all future" normally PATCHes the series' `endDate` to the day
 * BEFORE this occurrence (not `POST .../cancel`, which ends as of TODAY), so
 * lessons still due earlier than the one being viewed are left alone. But
 * when the viewed occurrence IS the series' first one, there's nothing
 * earlier to protect — and "day before the first occurrence" would land
 * before the series' own `startDate`, which the backend rejects
 * (`LessonSeries.EndDateBeforeStartDate`). That case falls back to
 * `POST /lessons/series/{id}/cancel` instead. There is no "payment stays"
 * switch — the backend forbids a cancelled lesson from ever being marked
 * paid, so keeping that etalon control would just produce a guaranteed
 * validation error.
 */
export function CancelSheet({ lesson, series, onClose, onSeriesCancelled }: CancelSheetProps) {
  const seriesLinked = lesson.seriesId != null;
  const [scope, setScope] = useState<Scope>('single');
  const [keepCustomized, setKeepCustomized] = useState(true);

  const cancelLesson = useUpdateLesson();
  const endSeries = useUpdateSeries();
  const cancelSeriesNow = useCancelSeries();
  const mutating = cancelLesson.isPending || endSeries.isPending || cancelSeriesNow.isPending;

  useEffect(() => {
    if (cancelLesson.isError) showToast(m.form_error_save());
  }, [cancelLesson.isError]);

  useEffect(() => {
    if (!endSeries.error) return;
    const { unmappedMessages, genericError } = apiFormErrors(endSeries.error);
    if (unmappedMessages.length > 0) showToast(unmappedMessages.join(' '));
    else if (genericError) showToast(genericError);
  }, [endSeries.error]);

  useEffect(() => {
    if (!cancelSeriesNow.error) return;
    const { unmappedMessages, genericError } = apiFormErrors(cancelSeriesNow.error);
    if (unmappedMessages.length > 0) showToast(unmappedMessages.join(' '));
    else if (genericError) showToast(genericError);
  }, [cancelSeriesNow.error]);

  // Only read below behind a `seriesLinked` gate — the API guarantees `seriesId`/`occurrenceDate`
  // are set together, so no non-series fallback is needed (one built from `startUtc` would be an
  // invalid date string here, since it's combined with a `T00:00` time-of-day suffix below).
  const occurrenceDate = lesson.occurrenceDate!;
  const seriesLabel = series
    ? (series.title ?? m.series_slot({ days: weekdaysLabel(series.weekdays), time: series.startTimeLocal.slice(0, 5) }))
    : null;
  // No earlier occurrence exists before the series' own first one, so there's
  // nothing an `endDate` tightening would need to protect.
  const isFirstOccurrence = series != null && occurrenceDate <= series.startDate;

  const confirm = () => {
    if (mutating) return;
    haptic('medium');
    if (seriesLinked && scope === 'series') {
      if (isFirstOccurrence) {
        cancelSeriesNow.mutate({ id: lesson.seriesId!, keepCustomized }, { onSuccess: onSeriesCancelled });
        return;
      }
      const endDate = dateKey(addDays(new Date(`${occurrenceDate}T00:00`), -1));
      endSeries.mutate({ id: lesson.seriesId!, body: { endDate, keepCustomized } }, { onSuccess: onSeriesCancelled });
      return;
    }
    cancelLesson.mutate({ id: lesson.id, body: { status: 'Cancelled' } }, { onSuccess: onClose });
  };

  return (
    <BottomSheet onClose={onClose}>
      <div className={styles.sheet}>
        <SheetHeader
          title={m.lesson_cancel_title()}
          hint={seriesLabel ? m.lesson_cancel_hint_series({ title: seriesLabel }) : undefined}
        />

        {seriesLinked && (
          <div className={styles.options}>
            <button type="button" className={styles.option} onClick={() => setScope('single')}>
              <span className={cx(styles.optionIcon, styles['optionIcon--accent'])}>
                <Icon name="event_busy" size={19} />
              </span>
              <span className={styles.optionText}>
                <span className={styles.optionTitle}>{m.lesson_cancel_scope_single()}</span>
                <span className={styles.optionSub}>
                  {m.lesson_cancel_scope_single_sub({ date: formatDayMonth(occurrenceDate) })}
                </span>
              </span>
              <span className={cx(styles.radio, scope === 'single' && styles['radio--checked'])}>
                {scope === 'single' && <span className={styles.radioDot} />}
              </span>
            </button>
            <button type="button" className={styles.option} onClick={() => setScope('series')}>
              <span className={cx(styles.optionIcon, styles['optionIcon--danger'])}>
                <Icon name="delete_forever" size={19} />
              </span>
              <span className={styles.optionText}>
                <span className={styles.optionTitle}>{m.lesson_cancel_scope_series()}</span>
                <span className={styles.optionSub}>{m.lesson_cancel_scope_series_sub({ title: seriesLabel ?? '' })}</span>
              </span>
              <span className={cx(styles.radio, scope === 'series' && styles['radio--checked'])}>
                {scope === 'series' && <span className={styles.radioDot} />}
              </span>
            </button>
          </div>
        )}

        {seriesLinked && scope === 'series' && (
          <div className={styles.keepRow}>
            <span className={styles.keepText}>
              <span className={styles.keepTitle}>{m.lesson_cancel_keep_customized()}</span>
              <span className={styles.keepHint}>{m.lesson_cancel_keep_customized_hint()}</span>
            </span>
            <Switch checked={keepCustomized} onChange={setKeepCustomized} disabled={mutating} />
          </div>
        )}

        <div className={styles.actions}>
          <Button variant="destructive" fullWidth loading={mutating} onClick={confirm}>
            {m.lesson_cancel()}
          </Button>
          <Button variant="ghost" fullWidth disabled={mutating} onClick={onClose}>
            {m.lesson_cancel_dismiss()}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
