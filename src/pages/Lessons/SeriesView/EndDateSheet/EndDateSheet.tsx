import { useEffect, useState } from 'react';
import { m } from '@/paraglide/messages';
import { BottomSheet, TextField, Switch, Button, showToast } from '@/shared/ui';
import type { LessonSeries } from '@/shared/api';
import { apiFormErrors, dateKey } from '@/shared/lib';
import { useUpdateSeries } from '@/features/lessons/queries';
import { ConflictBanner } from '@/features/lessons/ConflictBanner';
import { notify } from '@/shared/tg';
import styles from './EndDateSheet.module.scss';

interface EndDateSheetProps {
  series: LessonSeries;
  onClose: () => void;
}

const MAPPED_FIELDS = ['EndDate'];

/**
 * "Закінчити датою" — see design-system.html F6b lines 928-935 (the row) plus
 * the F3 `keepCustomized` convention (`CancelSheet`). PATCHes `endDate` (never
 * `clearEndDate` — reopening an ended series isn't offered from this row) and
 * sweeps/regenerates the future the new window no longer covers. Extending
 * the end date can collide with another lesson already in that weekly slot,
 * so — like `SeriesEditPage` — a 409 renders as a `ConflictBanner`. Own
 * centered 20/700 head (no `BottomSheet` `title` prop), same as `CancelSeriesSheet`.
 */
export function EndDateSheet({ series, onClose }: EndDateSheetProps) {
  const [date, setDate] = useState(series.endDate ?? dateKey(new Date()));
  const [keepCustomized, setKeepCustomized] = useState(true);

  const updateSeries = useUpdateSeries();
  const valid = date !== '' && date >= series.startDate;

  const save = () => {
    if (!valid || updateSeries.isPending) return;
    updateSeries.mutate(
      { id: series.id, body: { endDate: date, keepCustomized } },
      {
        onSuccess: (res) => {
          if (res.removedLessons.length > 0) notify(m.series_view_end_removed({ count: res.removedLessons.length }));
          onClose();
        },
      },
    );
  };

  const { fieldError, conflicts } = apiFormErrors(updateSeries.error, MAPPED_FIELDS);

  // Unmapped/generic errors aren't tied to the date field — surface them as a toast.
  useEffect(() => {
    if (!updateSeries.error) return;
    const { unmappedMessages, genericError } = apiFormErrors(updateSeries.error, MAPPED_FIELDS);
    if (unmappedMessages.length > 0) showToast(unmappedMessages.join(' '));
    else if (genericError) showToast(genericError);
  }, [updateSeries.error]);

  return (
    <BottomSheet onClose={onClose}>
      <div className={styles.head}>
        <span className={styles.title}>{m.series_view_action_end_title()}</span>
      </div>
      <div className={styles.fields}>
        <TextField
          header={m.lesson_form_end_date()}
          value={date}
          onChange={setDate}
          type="date"
          min={series.startDate}
          error={fieldError('EndDate')}
          required
        />
        <div className={styles.keepRow}>
          <span className={styles.keepText}>
            <span className={styles.keepTitle}>{m.lesson_cancel_keep_customized()}</span>
            <span className={styles.keepHint}>{m.lesson_cancel_keep_customized_hint()}</span>
          </span>
          <Switch checked={keepCustomized} onChange={setKeepCustomized} disabled={updateSeries.isPending} />
        </div>
        {conflicts && <ConflictBanner conflicts={conflicts} />}
        <div className={styles.actions}>
          <Button fullWidth loading={updateSeries.isPending} disabled={!valid} onClick={save}>
            {m.form_save()}
          </Button>
          <Button variant="ghost" fullWidth disabled={updateSeries.isPending} onClick={onClose}>
            {m.lesson_cancel_dismiss()}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
