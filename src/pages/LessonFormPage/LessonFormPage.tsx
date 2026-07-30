import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { TextField, useMainButton, showToast } from '@/shared/ui';
import { useBackButton } from '@/shared/tg';
import { dateKey, parsePrice, isValidDuration, apiFormErrors } from '@/shared/lib';
import { useProfile } from '@/features/profile/queries';
import { useStudents } from '@/features/students/queries';
import { StudentPickerField } from '@/features/students/StudentPickerField';
import { useCreateLesson } from '@/features/lessons/queries';
import { ConflictList } from '@/features/lessons/ConflictList';
import styles from './LessonFormPage.module.scss';

const MAPPED_FIELDS = ['StudentId', 'StartUtc', 'DurationMinutes', 'Price', 'Topic', 'Description'];

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
    loading: createLesson.isPending,
  });

  // ---- error breakdown of the last save attempt ----
  const { conflicts, fieldError } = apiFormErrors(createLesson.error, MAPPED_FIELDS);

  // Generic/unmapped errors aren't tied to one field — surface them as a toast
  // instead of inline text. Field errors stay wired to TextField's border.
  useEffect(() => {
    if (!createLesson.error) return;
    const { unmappedMessages, genericError } = apiFormErrors(createLesson.error, MAPPED_FIELDS);
    if (unmappedMessages.length > 0) showToast(unmappedMessages.join(' '));
    else if (genericError) showToast(genericError);
  }, [createLesson.error]);

  return (
    <div className={styles['form']}>
      <div className={styles['form__fields']}>
        <StudentPickerField
          students={students ?? []}
          value={studentId}
          onChange={setStudentId}
          locked={lockedStudent}
          error={fieldError('StudentId')}
          required
          open={pickerOpen}
          onOpenChange={setPickerOpen}
        />
        <TextField
          header={m.lesson_form_date()}
          value={date}
          onChange={setDate}
          type="date"
          error={fieldError('StartUtc')}
          required
        />
        <TextField header={m.lesson_form_time()} value={time} onChange={setTime} type="time" required />
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
          required
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
      </div>
    </div>
  );
}
