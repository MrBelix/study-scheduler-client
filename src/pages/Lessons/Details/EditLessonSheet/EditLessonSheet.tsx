import { useEffect, useState } from 'react';
import { m } from '@/paraglide/messages';
import { BottomSheet, TextField, Button, showToast } from '@/shared/ui';
import type { Lesson, UpdateLessonRequest } from '@/shared/api';
import { apiFormErrors, isValidDuration, parsePrice } from '@/shared/lib';
import { useUpdateLesson } from '@/features/lessons/queries';
import { ConflictList } from '@/features/lessons/ConflictList';
import { SheetHeader } from '../SheetHeader/SheetHeader';
import styles from './EditLessonSheet.module.scss';

interface EditLessonSheetProps {
  lesson: Lesson;
  onClose: () => void;
}

const MAPPED_FIELDS = ['DurationMinutes', 'Price', 'Topic', 'Description'];

/**
 * "Змінити" — the comprehensive edit sheet for a lesson's own details:
 * duration, price, topic and notes. Deliberately doesn't touch date/time —
 * that's "Перенести" (`RescheduleSheet`)'s job, so the two don't duplicate
 * each other. Reachable from the actions grid's "Змінити" tile and from the
 * topic row's pencil icon alike (see `NotesCard`).
 */
export function EditLessonSheet({ lesson, onClose }: EditLessonSheetProps) {
  const [duration, setDuration] = useState(String(lesson.durationMinutes));
  const [price, setPrice] = useState(String(lesson.price));
  const [topic, setTopic] = useState(lesson.topic ?? '');
  const [description, setDescription] = useState(lesson.description ?? '');

  const updateLesson = useUpdateLesson();

  const durationValue = Number(duration);
  const durationValid = isValidDuration(durationValue);
  const priceValue = parsePrice(price);
  const valid = durationValid && priceValue !== undefined;

  const save = () => {
    if (!valid || updateLesson.isPending) return;

    // PATCH applies only provided fields — only the ones the tutor actually changed go out.
    const body: UpdateLessonRequest = {};
    if (durationValue !== lesson.durationMinutes) body.durationMinutes = durationValue;
    if (priceValue !== lesson.price) body.price = priceValue;
    const trimmedTopic = topic.trim();
    if (trimmedTopic !== (lesson.topic ?? '')) body.topic = trimmedTopic;
    const trimmedDescription = description.trim();
    if (trimmedDescription !== (lesson.description ?? '')) body.description = trimmedDescription;

    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }
    updateLesson.mutate({ id: lesson.id, body }, { onSuccess: onClose });
  };

  const { conflicts, fieldError } = apiFormErrors(updateLesson.error, MAPPED_FIELDS);

  // Unmapped/generic errors aren't tied to a field on this form — surface them as a toast.
  useEffect(() => {
    if (!updateLesson.error) return;
    const { unmappedMessages, genericError } = apiFormErrors(updateLesson.error, MAPPED_FIELDS);
    if (unmappedMessages.length > 0) showToast(unmappedMessages.join(' '));
    else if (genericError) showToast(genericError);
  }, [updateLesson.error]);

  return (
    <BottomSheet onClose={onClose}>
      <SheetHeader title={m.lesson_edit_title()} />
      <div className={styles.fields}>
        <TextField
          header={m.lesson_form_duration()}
          value={duration}
          onChange={setDuration}
          inputMode="numeric"
          helper={m.lesson_form_duration_helper()}
          error={fieldError('DurationMinutes')}
          required
        />
        <TextField
          header={m.lesson_form_price()}
          value={price}
          onChange={setPrice}
          inputMode="numeric"
          error={fieldError('Price')}
          required
        />
        <TextField
          header={m.lesson_form_topic()}
          placeholder={m.lesson_form_topic_placeholder()}
          value={topic}
          onChange={setTopic}
          error={fieldError('Topic')}
        />
        <TextField
          header={m.lesson_description()}
          placeholder={m.lesson_notes_placeholder()}
          value={description}
          onChange={setDescription}
          error={fieldError('Description')}
        />
        {conflicts && <ConflictList conflicts={conflicts} />}
        <Button fullWidth loading={updateLesson.isPending} disabled={!valid} onClick={save}>
          {m.form_save()}
        </Button>
      </div>
    </BottomSheet>
  );
}
