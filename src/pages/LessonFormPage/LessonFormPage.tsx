import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { TextField, useMainButton } from '@/shared/ui';
import { useBackButton } from '@/shared/tg';
import { ApiError } from '@/shared/api';
import { useStudents } from '@/features/students/queries';
import { StudentPickerField } from '@/features/students/StudentPickerField';
import { useCreateLesson } from '@/features/lessons/queries';
import { ConflictList } from '@/features/lessons/ConflictList';
import { dateKey, parsePrice } from '@/features/lessons/model';
import styles from './LessonFormPage.module.scss';

/** One-off lesson. `?studentId=` (from the student page) locks the student. */
export function LessonFormPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const lockedStudent = params.has('studentId');

  const [studentId, setStudentId] = useState(params.get('studentId') ?? '');
  const [date, setDate] = useState(() => dateKey(new Date()));
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [price, setPrice] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data: students } = useStudents();
  const selectedStudent = students?.find((s) => s.id === studentId);

  const createLesson = useCreateLesson();

  const durationValue = Number(duration);
  const durationValid = Number.isInteger(durationValue) && durationValue >= 15 && durationValue <= 600;
  const valid = studentId !== '' && date !== '' && time !== '' && durationValid;

  const save = () => {
    if (!valid || createLesson.isPending) return;
    createLesson.mutate(
      {
        studentId,
        startUtc: new Date(`${date}T${time}`).toISOString(),
        durationMinutes: durationValue,
        price: parsePrice(price),
        topic: topic.trim() || undefined,
        description: description.trim() || undefined,
      },
      { onSuccess: () => navigate(-1) },
    );
  };

  // Back closes the student sheet first, then leaves the form.
  useBackButton(() => {
    if (pickerOpen) setPickerOpen(false);
    else navigate(-1);
  });
  useMainButton({
    text: m.lesson_form_save(),
    onClick: save,
    enabled: valid && !createLesson.isPending,
  });

  // ---- error breakdown of the last save attempt ----
  const error = createLesson.error;
  const conflicts = error instanceof ApiError ? error.conflicts : undefined;
  const fieldErrors = error instanceof ApiError ? error.fields : undefined;
  const fieldError = (key: string) => (fieldErrors?.[key] ?? fieldErrors?.[key.toLowerCase()])?.[0];
  const mappedKeys = ['StudentId', 'StartUtc', 'DurationMinutes', 'Price', 'Topic', 'Description'];
  const unmappedMessages = fieldErrors
    ? Object.entries(fieldErrors)
        .filter(([key]) => !mappedKeys.some((k) => k.toLowerCase() === key.toLowerCase()))
        .flatMap(([, messages]) => messages)
    : [];
  const genericError =
    error && !conflicts && !fieldErrors
      ? error instanceof ApiError && error.isAuthExpired
        ? m.error_auth_expired()
        : m.form_error_save()
      : undefined;

  return (
    <div className={styles['form']}>
      <div className={styles['form__fields']}>
        <StudentPickerField
          students={students ?? []}
          value={studentId}
          onChange={setStudentId}
          locked={lockedStudent}
          error={fieldError('StudentId')}
          open={pickerOpen}
          onOpenChange={setPickerOpen}
        />
        <TextField
          header={m.lesson_form_date()}
          value={date}
          onChange={setDate}
          type="date"
          error={fieldError('StartUtc')}
        />
        <TextField header={m.lesson_form_time()} value={time} onChange={setTime} type="time" />
        <TextField
          header={m.lesson_form_duration()}
          value={duration}
          onChange={setDuration}
          inputMode="numeric"
          helper={m.lesson_form_duration_helper()}
          error={fieldError('DurationMinutes')}
        />
        <TextField
          header={m.lesson_form_price()}
          placeholder={selectedStudent?.rate ? String(selectedStudent.rate) : ''}
          value={price}
          onChange={setPrice}
          inputMode="numeric"
          helper={m.lesson_form_price_helper()}
          error={fieldError('Price')}
        />
        <TextField
          header={m.lesson_form_topic()}
          placeholder={m.lesson_form_topic_placeholder()}
          value={topic}
          onChange={setTopic}
          error={fieldError('Topic')}
        />
        <TextField
          header={m.lesson_form_description()}
          placeholder={m.lesson_form_description_placeholder()}
          value={description}
          onChange={setDescription}
          error={fieldError('Description')}
        />

        {conflicts && <ConflictList conflicts={conflicts} />}
        {unmappedMessages.map((message, i) => (
          <div key={i} className={styles['form__error']}>
            {message}
          </div>
        ))}
        {genericError && <div className={styles['form__error']}>{genericError}</div>}
      </div>
    </div>
  );
}
