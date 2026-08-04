import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Section, Cell, Switch, Placeholder, EmptyState, Skeleton, useMainButton, showToast } from '@/shared/ui';
import { useBackButton } from '@/shared/tg';
import { ApiError } from '@/shared/api';
import type { LessonSeries, UpdateLessonSeriesRequest } from '@/shared/api';
import { parsePrice, isValidDuration, apiFormErrors } from '@/shared/lib';
import { useStudentDetails } from '@/features/students/queries';
import { useLessonSeries, useUpdateSeries } from '@/features/lessons/queries';
import { WEEKDAY_FLAGS } from '@/features/lessons/model';
import { ConflictBanner } from '@/features/lessons/ConflictBanner';
import { Header } from './Header/Header';
import { WeekdaysRow } from './WeekdaysRow/WeekdaysRow';
import { ScheduleCard } from './ScheduleCard/ScheduleCard';
import { DURATION_PRESETS } from './ScheduleCard/durationPresets';
import type { DurationMode } from './ScheduleCard/durationPresets';
import { DetailsCard } from './DetailsCard/DetailsCard';
import styles from './SeriesEditPage.module.scss';

const MAPPED_FIELDS = ['Title', 'Price', 'EndDate', 'Weekdays', 'StartTimeLocal', 'DurationMinutes'];

/**
 * F6b "Змінити дні, час або ціну" — full-edit pivot for a series, reached
 * from `SeriesViewPage`. Waits for the series, then mounts the form with
 * seeded state (see `StudentFormPage`).
 */
export function SeriesEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: series, isPending, error, refetch } = useLessonSeries(id);
  // 404 = the series is genuinely gone; anything else is a transient failure.
  const notFound = error instanceof ApiError && error.status === 404;
  const isError = Boolean(error) && !notFound;
  const { data: student } = useStudentDetails(series?.studentId);

  useBackButton(() => navigate(-1));

  if (isPending) {
    return (
      <div className={styles.form}>
        <div className={styles.formHeaderSkeleton}>
          <Skeleton width={180} height={26} />
          <Skeleton width={100} height={14} />
        </div>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className={styles.formSkeletonBlock}>
            <Skeleton width={90} height={10} />
            <Skeleton width="100%" height={56} radius={18} />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        variant="secondary"
        icon="cloud_off"
        tone="warn"
        title={m.error_generic()}
        action={{ label: m.retry(), onClick: () => refetch() }}
      />
    );
  }

  if (!series) {
    return <Placeholder glyph="🔍" title={m.series_not_found()} />;
  }

  return <SeriesEditForm series={series} studentName={student?.name} />;
}

function SeriesEditForm({ series, studentName }: { series: LessonSeries; studentName: string | undefined }) {
  const navigate = useNavigate();

  const initialWeekdays = useMemo(
    () => new Set(series.weekdays.split(',').map((s) => s.trim())),
    [series.weekdays],
  );
  const [weekdays, setWeekdays] = useState<Set<string>>(initialWeekdays);
  const [time, setTime] = useState(series.startTimeLocal.slice(0, 5));

  const initialDurationMode = (
    DURATION_PRESETS.includes(String(series.durationMinutes) as DurationMode)
      ? (String(series.durationMinutes) as DurationMode)
      : 'custom'
  );
  const [durationMode, setDurationMode] = useState<DurationMode>(initialDurationMode);
  const [customDuration, setCustomDuration] = useState(String(series.durationMinutes));
  const durationMinutes = durationMode === 'custom' ? Number(customDuration) : Number(durationMode);

  const [title, setTitle] = useState(series.title ?? '');
  const [price, setPrice] = useState(series.price != null ? String(series.price) : '');
  const [endDate, setEndDate] = useState(series.endDate ?? '');
  const [keepCustomized, setKeepCustomized] = useState(true);

  const toggleWeekday = (flag: string) => {
    setWeekdays((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) next.delete(flag);
      else next.add(flag);
      return next;
    });
  };

  const updateSeries = useUpdateSeries();

  const durationValid = isValidDuration(durationMinutes);
  // Empty is fine (leaves the price alone); non-empty must actually parse — otherwise the request
  // would silently drop `price` from the body instead of surfacing the typo (mirrors LessonFormPage).
  const priceValue = parsePrice(price);
  const priceValid = price.trim() === '' || priceValue !== undefined;
  const valid = weekdays.size > 0 && time !== '' && durationValid && priceValid;

  // PATCH applies only provided fields (empty/unchanged = leave alone), so the body carries only real edits.
  const body: UpdateLessonSeriesRequest = {};
  const trimmedTitle = title.trim();
  if (trimmedTitle !== (series.title ?? '')) body.title = trimmedTitle;
  if (priceValue !== undefined && priceValue !== series.price) body.price = priceValue;

  const weekdaysFlags = WEEKDAY_FLAGS.filter((d) => weekdays.has(d)).join(', ');
  const currentWeekdaysFlags = WEEKDAY_FLAGS.filter((d) => initialWeekdays.has(d)).join(', ');
  if (weekdaysFlags !== currentWeekdaysFlags) body.weekdays = weekdaysFlags;

  const currentTime = series.startTimeLocal.slice(0, 5);
  if (time !== currentTime) body.startTimeLocal = `${time}:00`;

  if (durationValid && durationMinutes !== series.durationMinutes) body.durationMinutes = durationMinutes;

  const currentEndDate = series.endDate ?? '';
  if (endDate !== currentEndDate) {
    if (endDate === '') body.clearEndDate = true;
    else body.endDate = endDate;
  }

  const hasChanges = Object.keys(body).length > 0;
  if (hasChanges) body.keepCustomized = keepCustomized;

  const save = () => {
    if (!hasChanges || !valid || updateSeries.isPending) return;
    updateSeries.mutate({ id: series.id, body }, { onSuccess: () => navigate(-1) });
  };

  useMainButton({
    text: m.form_save_changes(),
    onClick: save,
    enabled: hasChanges && valid && !updateSeries.isPending,
    loading: updateSeries.isPending,
  });

  // ---- error breakdown of the last save attempt ----
  const { conflicts, fieldError } = apiFormErrors(updateSeries.error, MAPPED_FIELDS);

  useEffect(() => {
    if (!updateSeries.error) return;
    const { unmappedMessages, genericError } = apiFormErrors(updateSeries.error, MAPPED_FIELDS);
    if (unmappedMessages.length > 0) showToast(unmappedMessages.join(' '));
    else if (genericError) showToast(genericError);
  }, [updateSeries.error]);

  // Same idea as LessonFormPage: a locally-caught "not a number" reads the same as the server's own field error.
  const priceError = fieldError('Price') ?? (!priceValid ? m.lesson_form_price_invalid() : undefined);

  return (
    <div className={styles.form}>
      <Header series={series} studentName={studentName} />

      <WeekdaysRow weekdays={weekdays} onToggle={toggleWeekday} error={fieldError('Weekdays')} />

      <ScheduleCard
        time={time}
        onTimeChange={setTime}
        timeError={fieldError('StartTimeLocal')}
        durationMinutes={durationMinutes}
        durationMode={durationMode}
        onDurationModeChange={setDurationMode}
        customDuration={customDuration}
        onCustomDurationChange={setCustomDuration}
        durationError={fieldError('DurationMinutes')}
      />

      <DetailsCard
        title={title}
        onTitleChange={setTitle}
        titleError={fieldError('Title')}
        price={price}
        onPriceChange={setPrice}
        priceError={priceError}
        endDate={endDate}
        onEndDateChange={setEndDate}
        minEndDate={series.startDate}
        endDateError={fieldError('EndDate')}
      />

      <Section footer={m.lesson_cancel_keep_customized_hint()}>
        <Cell
          plainTitle
          title={m.lesson_cancel_keep_customized()}
          value={<Switch checked={keepCustomized} onChange={setKeepCustomized} disabled={updateSeries.isPending} />}
        />
      </Section>

      {conflicts && <ConflictBanner conflicts={conflicts} />}
    </div>
  );
}
