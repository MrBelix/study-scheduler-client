import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { useMainButton, showToast } from '@/shared/ui';
import { useBackButton } from '@/shared/tg';
import { dateKey, addDays, addMonths, parsePrice, isValidDuration, apiFormErrors } from '@/shared/lib';
import { routes } from '@/shared/routing';
import { useProfile } from '@/features/profile/queries';
import { useStudents } from '@/features/students/queries';
import { StudentPickerField } from '@/features/students/StudentPickerField';
import { useCreateLesson } from '@/features/lessons/queries';
import { ConflictBanner } from '@/features/lessons/ConflictBanner';
import { WEEKDAY_FLAGS, weekdayFlagOfDate, nextFullHourStart, hourOfDay } from '@/features/lessons/model';
import { Header } from './Header/Header';
import { WhenSection } from './WhenSection/WhenSection';
import type { DateMode, DurationMode } from './WhenSection/WhenSection';
import { PriceTopicCard } from './PriceTopicCard/PriceTopicCard';
import { RepeatSection } from './RepeatSection/RepeatSection';
import styles from './LessonFormPage.module.scss';

const PLANNING_HORIZON_MONTHS = 4;

const MAPPED_FIELDS = [
  'StudentId',
  'Date',
  'StartTimeLocal',
  'DurationMinutes',
  'Price',
  'Topic',
  'Weekdays',
  'EndDate',
];

/**
 * F8 — one unified form: a one-off lesson, or (when "Повторювати" is set to
 * "Щотижня") a weekly series, submitted through the single `POST /lessons`
 * route. `?studentId=` locks the student; `?date=` preselects the day;
 * `?repeat=weekly` preselects the recurring mode (used by `AddSeriesRow` and
 * by the legacy `/lessons/series/new` redirect).
 */
export function LessonFormPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const lockedStudent = params.has('studentId');

  const [studentId, setStudentId] = useState(params.get('studentId') ?? '');
  const [pickerOpen, setPickerOpen] = useState(false);

  // ---- КОЛИ: today/tomorrow/custom-date chips + wall-clock time + duration ----
  // "Початок" and the default day come from ONE moment — the next full hour,
  // frozen at mount. Past 23:00 that hour belongs to tomorrow, so the day chip
  // has to move with it; seeding the time alone would open the form on today at
  // 00:00, a timestamp that has already passed (and which saves without a peep,
  // since neither the form nor the server refuses the past).
  const [defaultStart] = useState(() => nextFullHourStart(new Date()));
  const todayKey = dateKey(new Date());
  const tomorrowKey = dateKey(addDays(new Date(), 1));
  const paramDate = params.get('date');
  const initialDateMode: DateMode = !paramDate
    ? dateKey(defaultStart) === tomorrowKey
      ? 'tomorrow'
      : 'today'
    : paramDate === todayKey
      ? 'today'
      : paramDate === tomorrowKey
        ? 'tomorrow'
        : 'custom';
  const [dateMode, setDateMode] = useState<DateMode>(initialDateMode);
  const [customDate, setCustomDate] = useState(initialDateMode === 'custom' ? (paramDate as string) : todayKey);
  const date = dateMode === 'today' ? todayKey : dateMode === 'tomorrow' ? tomorrowKey : customDate;
  // Client mirror of the backend's PlanningHorizon: a lesson placed by hand can't land past it.
  const maxDate = dateKey(addMonths(new Date(), PLANNING_HORIZON_MONTHS));

  const changeDateMode = (mode: DateMode) => {
    if (mode === 'custom') setCustomDate(date);
    setDateMode(mode);
  };

  const [time, setTime] = useState(() => hourOfDay(defaultStart));
  const [durationMode, setDurationMode] = useState<DurationMode>('60');
  const [customDuration, setCustomDuration] = useState('60');
  const durationMinutes = durationMode === 'custom' ? Number(customDuration) : Number(durationMode);

  // ---- ЦІНА ТА ТЕМА ----
  const [price, setPrice] = useState('');
  const [topic, setTopic] = useState('');

  // ---- ПОВТОРЮВАТИ ----
  const [repeatMode, setRepeatMode] = useState<'never' | 'weekly'>(params.get('repeat') === 'weekly' ? 'weekly' : 'never');
  const [weekdays, setWeekdays] = useState<Set<string>>(() => new Set([weekdayFlagOfDate(date)]));
  const [seriesTitle, setSeriesTitle] = useState('');
  const [seriesEndDate, setSeriesEndDate] = useState('');
  const weekly = repeatMode === 'weekly';
  // The series title a submit would actually carry: typed title, else the topic — never the input's
  // own placeholder text, so the rhythm summary never quotes an example instead of a real value.
  const effectiveTitle = seriesTitle.trim() || topic.trim() || undefined;

  // The start date's own weekday is always selected and can't be un-toggled —
  // a series can't skip its own first occurrence. When the start date moves to
  // a different weekday, that new weekday takes over the lock. The previously
  // locked weekday is dropped from the selection only if the lock itself put
  // it there (lockedWasAutoAdded) — if the tutor had already picked it by
  // hand before it became locked, it stays selected as a normal, removable
  // choice (and keeps that "manual" status even after it unlocks). The seeded
  // weekday at mount counts as auto-added. Adjusted during render (React's own
  // pattern for 'state derived from a changed prop') rather than in an effect,
  // so it lands in the same commit as the date change.
  const lockedWeekday = weekdayFlagOfDate(date);
  const [lastLockedWeekday, setLastLockedWeekday] = useState(lockedWeekday);
  const [lockedWasAutoAdded, setLockedWasAutoAdded] = useState(true);
  if (lockedWeekday !== lastLockedWeekday) {
    const previousLockedWeekday = lastLockedWeekday;
    const previousWasAutoAdded = lockedWasAutoAdded;
    setLastLockedWeekday(lockedWeekday);
    setLockedWasAutoAdded(!weekdays.has(lockedWeekday));
    setWeekdays((prev) => {
      const next = new Set(prev);
      if (previousWasAutoAdded) next.delete(previousLockedWeekday);
      next.add(lockedWeekday);
      return next;
    });
  }

  const toggleWeekday = (flag: string) => {
    if (flag === lockedWeekday) return;
    setWeekdays((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) next.delete(flag);
      else next.add(flag);
      return next;
    });
  };

  const { data: students } = useStudents();
  const selectedStudent = students?.find((s) => s.id === studentId);

  // `date`/`time` are wall clock resolved by the server in the tutor's PROFILE
  // zone (for both branches alike) — warn (non-blocking) when the device zone differs.
  const profile = useProfile();
  const deviceZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const profileZone = profile.data?.timeZoneId;
  const tzMismatch = Boolean(profileZone) && profileZone !== deviceZone;

  const createLesson = useCreateLesson();

  const durationValid = isValidDuration(durationMinutes);
  const dateValid = date !== '' && date <= maxDate;
  // Empty is fine (falls back to the student's rate server-side); non-empty must actually parse —
  // otherwise the request would silently omit `price` instead of surfacing the typo.
  const priceValue = parsePrice(price);
  const priceValid = price.trim() === '' || priceValue !== undefined;
  const valid =
    studentId !== '' &&
    dateValid &&
    time !== '' &&
    durationValid &&
    priceValid &&
    !profile.isNotFound &&
    (!weekly || weekdays.size > 0);

  const save = () => {
    if (!valid || createLesson.isPending) return;
    createLesson.mutate(
      {
        studentId,
        date,
        startTimeLocal: `${time}:00`,
        durationMinutes,
        price: priceValue,
        topic: topic.trim() || undefined,
        repeat: weekly
          ? {
              weekdays: WEEKDAY_FLAGS.filter((d) => weekdays.has(d)).join(', '),
              title: effectiveTitle,
              endDate: seriesEndDate || undefined,
            }
          : undefined,
      },
      {
        // Discriminated response: a fresh series opens on its own edit page (the created lessons
        // are listed there); a one-off lesson opens its own detail page.
        onSuccess: (res) => {
          if (res.series) navigate(routes.lessons.seriesEdit(res.series.id));
          else if (res.lesson) navigate(routes.lessons.details(res.lesson.id));
          else navigate(-1);
        },
      },
    );
  };

  // Back closes the student sheet first, then leaves the form.
  useBackButton(() => {
    if (pickerOpen) setPickerOpen(false);
    else navigate(-1);
  });
  useMainButton({
    text: weekly ? m.lesson_form_save_recurring() : m.lesson_form_save(),
    onClick: save,
    enabled: valid && !createLesson.isPending,
    loading: createLesson.isPending,
  });

  // ---- error breakdown of the last save attempt ----
  const { conflicts, fieldError } = apiFormErrors(createLesson.error, MAPPED_FIELDS);

  // Generic/unmapped errors aren't tied to one field — surface them as a toast
  // instead of inline text. Field errors stay wired to each field's own border.
  useEffect(() => {
    if (!createLesson.error) return;
    const { unmappedMessages, genericError } = apiFormErrors(createLesson.error, MAPPED_FIELDS);
    if (unmappedMessages.length > 0) showToast(unmappedMessages.join(' '));
    else if (genericError) showToast(genericError);
  }, [createLesson.error]);

  // Mirrors the backend's own refusal message (`PlanningHorizon.Exceeded`) client-side, so a date
  // beyond the horizon reads the same whether it's caught here or echoed back from the server.
  const dateError =
    fieldError('Date') ??
    (date > maxDate ? m.lesson_form_date_horizon({ months: PLANNING_HORIZON_MONTHS }) : undefined);

  // Same idea for price: a locally-caught "not a number" reads the same as the server's own field error.
  const priceError = fieldError('Price') ?? (!priceValid ? m.lesson_form_price_invalid() : undefined);

  return (
    <div className={styles.form}>
      <Header />

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

      <WhenSection
        dateMode={dateMode}
        onDateModeChange={changeDateMode}
        customDate={customDate}
        onCustomDateChange={setCustomDate}
        maxDate={maxDate}
        dateError={dateError}
        time={time}
        onTimeChange={setTime}
        timeError={fieldError('StartTimeLocal')}
        durationMinutes={durationMinutes}
        durationMode={durationMode}
        onDurationModeChange={setDurationMode}
        customDuration={customDuration}
        onCustomDurationChange={setCustomDuration}
        durationError={fieldError('DurationMinutes')}
        tzHint={tzMismatch ? m.lesson_form_tz_mismatch({ device: deviceZone, profile: profileZone! }) : undefined}
      />

      <PriceTopicCard
        price={price}
        onPriceChange={setPrice}
        studentRate={selectedStudent?.rate}
        priceError={priceError}
        topic={topic}
        onTopicChange={setTopic}
        topicError={fieldError('Topic')}
      />

      <RepeatSection
        mode={repeatMode}
        onModeChange={setRepeatMode}
        weekdays={weekdays}
        onToggleWeekday={toggleWeekday}
        weekdaysError={fieldError('Weekdays')}
        title={seriesTitle}
        onTitleChange={setSeriesTitle}
        titlePlaceholder={topic.trim() || m.lesson_form_title_placeholder()}
        effectiveTitle={effectiveTitle}
        endDate={seriesEndDate}
        onEndDateChange={setSeriesEndDate}
        minEndDate={date}
        endDateError={fieldError('EndDate')}
        time={time}
        durationMinutes={durationMinutes}
      />

      {profile.isNotFound && <div className={styles.profileWarning}>{m.series_form_no_profile()}</div>}
      {conflicts && <ConflictBanner conflicts={conflicts} />}
    </div>
  );
}
