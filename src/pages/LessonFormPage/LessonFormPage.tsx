import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { TextField, useMainButton } from '@/shared/ui';
import { useBackButton } from '@/shared/tg';
import { dateKey, parsePrice, isValidDuration, apiFormErrors } from '@/shared/lib';
import { useProfile } from '@/features/profile/queries';
import { useStudents } from '@/features/students/queries';
import { StudentPickerField } from '@/features/students/StudentPickerField';
import { useCreateLesson } from '@/features/lessons/queries';
import { ConflictList } from '@/features/lessons/ConflictList';
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

  // The picked date+time is interpreted in the DEVICE zone, while series run
  // in the PROFILE zone — warn (non-blocking) when the two differ.
  const { data: profile } = useProfile();
  const deviceZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const profileZone = profile?.timeZoneId;
  const tzMismatch = Boolean(profileZone) && profileZone !== deviceZone;

  const createLesson = useCreateLesson();

  const durationValue = Number(duration);
  const durationValid = isValidDuration(durationValue);
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
  const { conflicts, fieldError, unmappedMessages, genericError } = apiFormErrors(createLesson.error, [
    'StudentId',
    'StartUtc',
    'DurationMinutes',
    'Price',
    'Topic',
    'Description',
  ]);

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
        {tzMismatch && (
          <div className={styles['form__hint']}>
            {m.lesson_form_tz_mismatch({ device: deviceZone, profile: profileZone! })}
          </div>
        )}
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
