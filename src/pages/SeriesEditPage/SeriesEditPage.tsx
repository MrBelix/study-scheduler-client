import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Section, Cell, Avatar, Placeholder, Skeleton, TextField, useMainButton } from '@/shared/ui';
import { useBackButton, haptic } from '@/shared/tg';
import { ApiError } from '@/shared/api';
import type { LessonSeries, Student, UpdateLessonSeriesRequest } from '@/shared/api';
import { formatDate, parsePrice, apiFormErrors } from '@/shared/lib';
import { useStudents } from '@/features/students/queries';
import { useLessonSeries, useUpdateSeries, useCancelSeries } from '@/features/lessons/queries';
import { weekdaysLabel, isSeriesCurrent } from '@/features/lessons/model';
import styles from './SeriesEditPage.module.scss';

/** Waits for the series, then mounts the form with seeded state (see StudentFormPage). */
export function SeriesEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: series, isPending, error } = useLessonSeries(id);
  // 404 = the series is genuinely gone; anything else is a transient failure.
  const notFound = error instanceof ApiError && error.status === 404;
  const { data: students } = useStudents();

  useBackButton(() => navigate(-1));

  if (isPending) {
    return (
      <div className={styles['form']}>
        <Section>
          <Cell
            inset={70}
            minHeight={56}
            leading={<Skeleton circle={42} />}
            title={<Skeleton />}
            subtitle={<Skeleton width="40%" height={10} />}
          />
        </Section>
        <div className={styles['form__fields']}>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className={styles['form__skeleton-field']}>
              <Skeleton width={90} height={10} />
              <Skeleton width="100%" height={44} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !notFound) {
    return <Placeholder glyph="⚠️" title={m.error_generic()} />;
  }

  if (!series) {
    return <Placeholder glyph="🔍" title={m.series_not_found()} />;
  }

  return <SeriesEditForm series={series} student={students?.find((s) => s.id === series.studentId)} />;
}

function SeriesEditForm({ series, student }: { series: LessonSeries; student?: Student }) {
  const navigate = useNavigate();

  const [title, setTitle] = useState(series.title ?? '');
  const [endDate, setEndDate] = useState(series.endDate ?? '');
  const [price, setPrice] = useState(series.price != null ? String(series.price) : '');

  const updateSeries = useUpdateSeries();
  const cancelSeries = useCancelSeries();
  const mutating = updateSeries.isPending || cancelSeries.isPending;

  // PATCH applies only provided fields (empty input = leave unchanged), so the
  // body carries only real edits.
  const body: UpdateLessonSeriesRequest = {};
  const trimmedTitle = title.trim();
  if (trimmedTitle && trimmedTitle !== (series.title ?? '')) body.title = trimmedTitle;
  if (endDate && endDate !== (series.endDate ?? '')) body.endDate = endDate;
  const priceValue = parsePrice(price);
  if (priceValue !== undefined && priceValue !== series.price) body.price = priceValue;
  const hasChanges = Object.keys(body).length > 0;

  const save = () => {
    if (!hasChanges || mutating) return;
    updateSeries.mutate({ id: series.id, body }, { onSuccess: () => navigate(-1) });
  };

  useMainButton({
    text: m.form_save_changes(),
    onClick: save,
    enabled: hasChanges && !mutating,
  });

  // ---- error breakdown of the last save attempt ----
  // Cancelling has no fields of its own — its failure folds into the generic line.
  const error = updateSeries.error;
  const { fields, fieldError } = apiFormErrors(error);
  const genericError = (error && !fields) || cancelSeries.isError ? m.form_error_save() : undefined;

  return (
    <div className={styles['form']}>
      <Section footer={m.series_edit_fixed_footer()}>
        {student && (
          <Cell leading={<Avatar name={student.name} size={42} />} title={student.name} inset={70} minHeight={56} />
        )}
        <Cell
          title={m.lesson_series_schedule()}
          value={`${weekdaysLabel(series.weekdays)} · ${series.startTimeLocal.slice(0, 5)}`}
        />
        <Cell title={m.lesson_form_start_date()} value={formatDate(series.startDate)} />
      </Section>

      <div className={styles['form__fields']}>
        <TextField
          header={m.lesson_form_title()}
          placeholder={m.lesson_form_title_placeholder()}
          value={title}
          onChange={setTitle}
          error={fieldError('Title')}
        />
        <TextField
          header={m.lesson_form_end_date()}
          value={endDate}
          onChange={setEndDate}
          type="date"
          helper={m.series_edit_end_date_helper()}
          error={fieldError('EndDate')}
        />
        <TextField
          header={m.lesson_form_price()}
          value={price}
          onChange={setPrice}
          inputMode="numeric"
          helper={m.series_edit_price_helper()}
          error={fieldError('Price')}
        />
      </div>

      {isSeriesCurrent(series) && (
        <Section footer={m.lesson_series_footer()}>
          <Cell
            title={<span className={styles['form__danger']}>{m.lesson_series_cancel()}</span>}
            onClick={() => {
              if (mutating) return;
              haptic('medium');
              cancelSeries.mutate(series.id, { onSuccess: () => navigate(-1) });
            }}
          />
        </Section>
      )}

      {genericError && <div className={styles['form__error']}>{genericError}</div>}
    </div>
  );
}
