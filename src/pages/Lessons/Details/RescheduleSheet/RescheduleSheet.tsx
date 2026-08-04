import { useEffect, useState } from 'react';
import { m } from '@/paraglide/messages';
import { BottomSheet, TextField, Button, showToast } from '@/shared/ui';
import type { Lesson } from '@/shared/api';
import { dateKey, apiFormErrors } from '@/shared/lib';
import { useUpdateLesson } from '@/features/lessons/queries';
import { ConflictList } from '@/features/lessons/ConflictList';
import { SheetHeader } from '../SheetHeader/SheetHeader';
import styles from './RescheduleSheet.module.scss';

interface RescheduleSheetProps {
  lesson: Lesson;
  onClose: () => void;
}

/**
 * "Move this lesson" — reschedules just this occurrence's date/time. Its own
 * component so it can hold its own reschedule-form state (date/time/mutation),
 * unwound on close/unmount. Save is rendered inline in the sheet itself
 * (rather than via `useMainButton`) since the sheet is a full-screen portal
 * that visually covers the global MainButtonBar.
 */
export function RescheduleSheet({ lesson, onClose }: RescheduleSheetProps) {
  const start = new Date(lesson.startUtc);
  const [date, setDate] = useState(dateKey(start));
  const [time, setTime] = useState(`${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`);

  const updateLesson = useUpdateLesson();
  const valid = date !== '' && time !== '';

  const save = () => {
    if (!valid || updateLesson.isPending) return;
    updateLesson.mutate(
      { id: lesson.id, body: { startUtc: new Date(`${date}T${time}`).toISOString() } },
      { onSuccess: onClose },
    );
  };

  const { conflicts, fieldError } = apiFormErrors(updateLesson.error, ['StartUtc']);

  // Generic errors aren't tied to the date field — surface them as a toast
  // instead of inline text.
  useEffect(() => {
    if (!updateLesson.error) return;
    const { genericError } = apiFormErrors(updateLesson.error, ['StartUtc']);
    if (genericError) showToast(genericError);
  }, [updateLesson.error]);

  return (
    <BottomSheet onClose={onClose}>
      <SheetHeader title={m.lesson_reschedule()} />
      <div className={styles.fields}>
        <TextField
          header={m.lesson_form_date()}
          value={date}
          onChange={setDate}
          type="date"
          error={fieldError('StartUtc')}
          required
        />
        <TextField header={m.lesson_form_time()} value={time} onChange={setTime} type="time" required />
        {conflicts && <ConflictList conflicts={conflicts} />}
        <Button fullWidth loading={updateLesson.isPending} disabled={!valid} onClick={save}>
          {m.form_save()}
        </Button>
      </div>
    </BottomSheet>
  );
}
