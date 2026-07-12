import { useState } from 'react';
import { m } from '@/paraglide/messages';
import { Section, Cell, SearchInput, BottomSheet, Skeleton, TextField } from '@/shared/ui';
import { useLocale } from '@/shared/i18n';
import { haptic } from '@/shared/tg';
import { dateKey, parsePrice, isValidDuration } from '@/shared/lib';
import { useSaveProfile, useTimeZones } from '@/features/profile/queries';
import { useCreateStudent } from '@/features/students/queries';
import { useCreateSeries } from '@/features/lessons/queries';
import { WEEKDAY_FLAGS, weekdayShortLabel } from '@/features/lessons/model';
import styles from './OnboardingPage.module.scss';

/**
 * First-run wizard, shown full-screen (outside AppLayout) when no profile
 * exists yet. Three steps: time zone (mandatory), first student and first
 * series (both skippable). `onDone` returns control to the app.
 */
export function OnboardingPage({ onDone }: { onDone: () => void }) {
  const { locale } = useLocale();
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [step, setStep] = useState(0);
  const [newStudentId, setNewStudentId] = useState<string | null>(null);

  // Step 0 — time zone
  const [zone, setZone] = useState(detected);
  const [tzSheetOpen, setTzSheetOpen] = useState(false);
  const [tzQuery, setTzQuery] = useState('');

  // Step 1 — first student
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');

  // Step 2 — first series
  const [weekdays, setWeekdays] = useState<Set<string>>(new Set());
  const [time, setTime] = useState('');
  const [startDate, setStartDate] = useState(() => dateKey(new Date()));
  const [duration, setDuration] = useState('60');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const { data: timeZones } = useTimeZones();
  const saveProfile = useSaveProfile();
  const createStudent = useCreateStudent();
  const createSeries = useCreateSeries();

  // Server-provided IANA ids with the detected zone pinned first, but only when
  // the server advertises it (offering an unresolvable id guarantees a 400).
  const options = timeZones
    ? timeZones.includes(detected)
      ? [detected, ...timeZones.filter((z) => z !== detected)]
      : timeZones
    : [];
  const q = tzQuery.trim().toLowerCase();
  const zones = options.filter((z) => !q || z.toLowerCase().includes(q));

  const pickZone = (z: string) => {
    haptic('light');
    setZone(z);
    setTzSheetOpen(false);
    setTzQuery('');
  };

  const continueFromTz = () => {
    if (saveProfile.isPending) return;
    saveProfile.mutate(
      { timeZoneId: zone, languageCode: locale },
      { onSuccess: () => setStep(1) },
    );
  };

  const studentName = name.trim();
  const continueFromStudent = () => {
    if (studentName === '' || createStudent.isPending) return;
    createStudent.mutate(
      { name: studentName, rate: parsePrice(rate) ?? 0 },
      {
        onSuccess: (student) => {
          setNewStudentId(student.id);
          setStep(2);
        },
      },
    );
  };

  const toggleWeekday = (flag: string) => {
    setWeekdays((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) next.delete(flag);
      else next.add(flag);
      return next;
    });
  };

  const seriesValid =
    weekdays.size > 0 && time !== '' && startDate !== '' && isValidDuration(Number(duration));
  const finishSeries = () => {
    if (!seriesValid || createSeries.isPending || !newStudentId) return;
    createSeries.mutate(
      {
        studentId: newStudentId,
        title: title.trim() || undefined,
        startDate,
        weekdays: WEEKDAY_FLAGS.filter((d) => weekdays.has(d)).join(', '),
        startTimeLocal: `${time}:00`,
        durationMinutes: Number(duration),
        price: parsePrice(price),
      },
      { onSuccess: () => onDone() },
    );
  };

  return (
    <div className={styles['onboarding']}>
      <div className={styles['onboarding__scroll']}>
        <div className={styles['onboarding__steps']}>
          {m.onboarding_step({ current: step + 1, total: 3 })}
        </div>

        {step === 0 && (
          <>
            <div className={styles['onboarding__title']}>{m.onboarding_welcome_title()}</div>
            <div className={styles['onboarding__subtitle']}>{m.onboarding_welcome_subtitle()}</div>
            <Section header={m.onboarding_tz_title()} footer={m.onboarding_tz_subtitle()}>
              <Cell
                title={m.profile_timezone()}
                value={zone}
                chevron
                onClick={() => setTzSheetOpen(true)}
              />
            </Section>
            {saveProfile.isError && <div className={styles['onboarding__error']}>{m.form_error_save()}</div>}
          </>
        )}

        {step === 1 && (
          <>
            <div className={styles['onboarding__title']}>{m.onboarding_student_title()}</div>
            <div className={styles['onboarding__subtitle']}>{m.onboarding_student_subtitle()}</div>
            <div className={styles['onboarding__fields']}>
              <TextField
                header={m.form_name()}
                placeholder={m.form_name_placeholder()}
                value={name}
                onChange={setName}
                required
              />
              <TextField
                header={m.form_rate()}
                placeholder={m.form_rate_placeholder()}
                value={rate}
                onChange={setRate}
                inputMode="numeric"
                helper={m.form_rate_helper()}
              />
              {createStudent.isError && <div className={styles['onboarding__error']}>{m.form_error_save()}</div>}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className={styles['onboarding__title']}>{m.onboarding_series_title()}</div>
            <div className={styles['onboarding__subtitle']}>
              {m.onboarding_series_subtitle({ name: studentName })}
            </div>
            <div className={styles['onboarding__fields']}>
              <div className={styles['onboarding__field']}>
                <span className={styles['onboarding__label']}>
                  {m.lesson_form_weekdays()}
                  <span className={styles['onboarding__label-required']}>*</span>
                </span>
                <div className={styles['onboarding__weekdays']}>
                  {WEEKDAY_FLAGS.map((flag, i) => (
                    <button
                      key={flag}
                      type="button"
                      className={styles['onboarding__weekday']}
                      data-selected={weekdays.has(flag) || undefined}
                      onClick={() => toggleWeekday(flag)}
                    >
                      {weekdayShortLabel(i)}
                    </button>
                  ))}
                </div>
              </div>
              <TextField
                header={m.lesson_form_time()}
                value={time}
                onChange={setTime}
                type="time"
                required
              />
              <TextField
                header={m.lesson_form_start_date()}
                value={startDate}
                onChange={setStartDate}
                type="date"
                required
              />
              <TextField
                header={m.lesson_form_duration()}
                value={duration}
                onChange={setDuration}
                inputMode="numeric"
                helper={m.lesson_form_duration_helper()}
                required
              />
              <TextField
                header={m.lesson_form_title()}
                placeholder={m.lesson_form_title_placeholder()}
                value={title}
                onChange={setTitle}
              />
              <TextField
                header={m.lesson_form_price()}
                value={price}
                onChange={setPrice}
                inputMode="numeric"
                helper={m.lesson_form_price_helper()}
              />
              {createSeries.isError && <div className={styles['onboarding__error']}>{m.form_error_save()}</div>}
            </div>
          </>
        )}
      </div>

      <div className={styles['onboarding__actions']}>
        {step === 0 && (
          <button
            type="button"
            className={styles['onboarding__primary']}
            onClick={continueFromTz}
            disabled={saveProfile.isPending}
          >
            {m.onboarding_continue()}
          </button>
        )}
        {step === 1 && (
          <>
            <button
              type="button"
              className={styles['onboarding__primary']}
              onClick={continueFromStudent}
              disabled={studentName === '' || createStudent.isPending}
            >
              {m.onboarding_continue()}
            </button>
            <button type="button" className={styles['onboarding__skip']} onClick={onDone}>
              {m.onboarding_skip()}
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <button
              type="button"
              className={styles['onboarding__primary']}
              onClick={finishSeries}
              disabled={!seriesValid || createSeries.isPending}
            >
              {m.onboarding_finish()}
            </button>
            <button type="button" className={styles['onboarding__skip']} onClick={onDone}>
              {m.onboarding_skip()}
            </button>
          </>
        )}
      </div>

      {tzSheetOpen && (
        <BottomSheet title={m.profile_timezone()} onClose={() => setTzSheetOpen(false)} fullHeight>
          <SearchInput value={tzQuery} onChange={setTzQuery} placeholder={m.search_placeholder()} />
          <div className={styles['onboarding__sheet-list']}>
            {!timeZones ? (
              Array.from({ length: 8 }, (_, i) => (
                <Cell key={i} title={<Skeleton width={i % 2 ? '45%' : '60%'} />} />
              ))
            ) : (
              zones.map((z) => (
                <Cell
                  key={z}
                  title={z}
                  value={z === zone ? '✓' : undefined}
                  valueColor="var(--ds-color-accent)"
                  onClick={() => pickZone(z)}
                />
              ))
            )}
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
