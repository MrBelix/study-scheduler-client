import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { TextField, useMainButton } from '@/shared/ui';
import { useBackButton } from '@/shared/tg';
import { ApiError } from '@/shared/api';
import { useStudents } from '@/features/students/queries';
import { useProfile } from '@/features/profile/queries';
import { StudentPickerField } from '@/features/students/StudentPickerField';
import { useCreateSeries } from '@/features/lessons/queries';
import { ConflictList } from '@/features/lessons/ConflictList';
import { dateKey, parsePrice, WEEKDAY_FLAGS, weekdayShortLabel } from '@/features/lessons/model';
import styles from './SeriesFormPage.module.scss';

/** Weekly series. `?studentId=` (from the student page) locks the student. */
export function SeriesFormPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const lockedStudent = params.has('studentId');

  const [studentId, setStudentId] = useState(params.get('studentId') ?? '');
  const [title, setTitle] = useState('');
  const [weekdays, setWeekdays] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState(() => dateKey(new Date()));
  const [time, setTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState('60');
  const [price, setPrice] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data: students } = useStudents();
  const selectedStudent = students?.find((s) => s.id === studentId);

  // Series times are wall clock in the tutor's profile time zone — without a
  // saved profile the backend rejects creation, so guide to settings instead.
  const profile = useProfile();

  const createSeries = useCreateSeries();

  const durationValue = Number(duration);
  const durationValid = Number.isInteger(durationValue) && durationValue >= 15 && durationValue <= 600;
  const valid =
    studentId !== '' && startDate !== '' && time !== '' && durationValid && weekdays.size > 0;

  const save = () => {
    if (!valid || createSeries.isPending) return;
    // Weekdays must follow the backend flags order (Monday-first here is fine —
    // .NET parses any order); startTimeLocal is HH:mm:ss wall clock.
    createSeries.mutate(
      {
        studentId,
        title: title.trim() || undefined,
        startDate,
        weekdays: WEEKDAY_FLAGS.filter((d) => weekdays.has(d)).join(', '),
        startTimeLocal: `${time}:00`,
        durationMinutes: durationValue,
        endDate: endDate || undefined,
        price: parsePrice(price),
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
    text: m.lesson_form_save_series(),
    onClick: save,
    enabled: valid && !createSeries.isPending && !profile.isNotFound,
  });

  const toggleWeekday = (flag: string) => {
    setWeekdays((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) next.delete(flag);
      else next.add(flag);
      return next;
    });
  };

  // ---- error breakdown of the last save attempt ----
  const error = createSeries.error;
  const conflicts = error instanceof ApiError ? error.conflicts : undefined;
  const fieldErrors = error instanceof ApiError ? error.fields : undefined;
  const fieldError = (key: string) => (fieldErrors?.[key] ?? fieldErrors?.[key.toLowerCase()])?.[0];
  const mappedKeys = ['StudentId', 'StartDate', 'Weekdays', 'StartTimeLocal', 'DurationMinutes', 'Price'];
  const unmappedMessages = fieldErrors
    ? Object.entries(fieldErrors)
        .filter(([key]) => !mappedKeys.some((k) => k.toLowerCase() === key.toLowerCase()))
        .flatMap(([, messages]) => messages)
    : [];
  const genericError = error && !conflicts && !fieldErrors ? m.form_error_save() : undefined;

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
          header={m.lesson_form_title()}
          placeholder={m.lesson_form_title_placeholder()}
          value={title}
          onChange={setTitle}
        />
        <div className={styles['form__field']}>
          <span className={styles['form__label']}>{m.lesson_form_weekdays()}</span>
          <div className={styles['form__weekdays']}>
            {WEEKDAY_FLAGS.map((flag, i) => (
              <button
                key={flag}
                type="button"
                className={styles['form__weekday']}
                data-selected={weekdays.has(flag) || undefined}
                onClick={() => toggleWeekday(flag)}
              >
                {weekdayShortLabel(i)}
              </button>
            ))}
          </div>
          {fieldError('Weekdays') && <span className={styles['form__field-error']}>{fieldError('Weekdays')}</span>}
        </div>
        <TextField
          header={m.lesson_form_time()}
          value={time}
          onChange={setTime}
          type="time"
          error={fieldError('StartTimeLocal')}
        />
        <TextField
          header={m.lesson_form_start_date()}
          value={startDate}
          onChange={setStartDate}
          type="date"
          error={fieldError('StartDate')}
        />
        <TextField
          header={m.lesson_form_end_date()}
          value={endDate}
          onChange={setEndDate}
          type="date"
          helper={m.lesson_form_end_date_helper()}
        />
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

        {profile.isNotFound && <div className={styles['form__error']}>{m.series_form_no_profile()}</div>}
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
