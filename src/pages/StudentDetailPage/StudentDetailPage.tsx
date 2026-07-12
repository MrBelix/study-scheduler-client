import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Section, Cell, Avatar, Badge, Placeholder, Skeleton, SegmentedControl, useMainButton } from '@/shared/ui';
import type { SegmentItem } from '@/shared/ui';
import { useBackButton, haptic } from '@/shared/tg';
import { useStudent, useUpdateStudent } from '@/features/students/queries';
import { useSeriesList, useLessons } from '@/features/lessons/queries';
import { weekdaysLabel, isSeriesCurrent, lessonPath } from '@/features/lessons/model';
import { money, fmt, formatDate, fmtTime, fmtDayHeader } from '@/shared/lib';
import styles from './StudentDetailPage.module.scss';

type Tab = 'active' | 'archive';

export function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: student, isPending, isError } = useStudent(id);
  const { data: seriesList } = useSeriesList();
  const updateStudent = useUpdateStudent();
  const [tab, setTab] = useState<Tab>('active');

  // Lesson history spans from the student's creation up to now. Hooks must run
  // before the early returns, so this is computed at the top level regardless
  // of the active tab; `nowIso` is fixed once so the query key stays stable.
  const nowIso = useMemo(() => new Date().toISOString(), []);
  const fromIso = useMemo(
    () => new Date(student?.createdAtUtc ?? nowIso).toISOString(),
    [student?.createdAtUtc, nowIso],
  );
  const { data: lessons } = useLessons(fromIso, nowIso);

  useBackButton(() => navigate(-1));
  useMainButton({ text: m.edit(), onClick: () => navigate(`/students/${id}/edit`) });

  if (isPending) {
    return (
      <div className={styles['detail']}>
        <div className={styles['detail__header']}>
          <Skeleton circle={88} />
          <Skeleton width={160} height={20} />
        </div>
        <Section>
          {Array.from({ length: 3 }, (_, i) => (
            <Cell key={i} title={<Skeleton width="40%" />} value={<Skeleton width={64} />} />
          ))}
        </Section>
      </div>
    );
  }

  if (isError) {
    return <Placeholder glyph="⚠️" title={m.error_generic()} />;
  }

  if (!student) {
    return <Placeholder glyph="🔍" title={m.student_not_found()} />;
  }

  const archived = student.status === 'Archived';

  // A student's subjects are their current series ("Математика" пн/чт +
  // "Фізика" ср, each with its own price) — shown in the schedule section.
  const activeSeries = (seriesList ?? []).filter((s) => s.studentId === student.id && isSeriesCurrent(s));

  // Ended schedules and past individual (non-series) lessons, both
  // most-recent-first. Past series lessons are reached via their series page.
  const endedSeries = (seriesList ?? [])
    .filter((s) => s.studentId === student.id && !isSeriesCurrent(s))
    .sort((a, b) => (b.endDate ?? '').localeCompare(a.endDate ?? ''));
  const individualPastLessons = (lessons ?? [])
    .filter((l) => l.studentId === student.id && l.seriesId == null && l.startUtc < nowIso)
    .sort((a, b) => b.startUtc.localeCompare(a.startUtc));

  const segItems: SegmentItem<Tab>[] = [
    { label: m.student_active_tab(), value: 'active' },
    { label: m.student_archive_tab(), value: 'archive' },
  ];

  return (
    <div className={styles['detail']}>
      <div className={styles['detail__header']}>
        <Avatar name={student.name} size={88} />
        <div className={styles['detail__name']}>{student.name}</div>
        <Badge mode={archived ? 'muted' : 'success'}>
          {archived ? m.status_archived() : m.status_active()}
        </Badge>
      </div>

      <div className={styles['detail__segment']}>
        <SegmentedControl items={segItems} value={tab} onChange={setTab} />
      </div>

      {tab === 'active' ? (
        <>
          <Section header={m.detail_section_profile()}>
            <Cell
              title={m.detail_rate()}
              value={student.rate ? m.rate_per_lesson({ rate: fmt(student.rate) }) : m.value_none()}
              valueColor={student.rate ? undefined : 'var(--ds-color-hint)'}
            />
            <Cell title={m.detail_added()} value={formatDate(student.createdAtUtc)} />
          </Section>

          <Section header={m.student_schedule_section()} footer={m.student_schedule_footer()}>
            {activeSeries.map((s) => (
              <Cell
                key={s.id}
                title={s.title ?? m.lesson_series_untitled()}
                subtitle={
                  `${weekdaysLabel(s.weekdays)} · ${s.startTimeLocal.slice(0, 5)}` +
                  (s.endDate ? ` · ${m.series_until_short({ date: formatDate(s.endDate) })}` : '')
                }
                value={money(s.price ?? student.rate)}
                chevron
                minHeight={56}
                onClick={() => navigate(`/lessons/series/${s.id}/edit`)}
              />
            ))}
            <Cell
              title={<span style={{ color: 'var(--ds-color-accent)' }}>{m.student_add_lesson()}</span>}
              onClick={() => navigate(`/lessons/new?studentId=${student.id}`)}
            />
            <Cell
              title={<span style={{ color: 'var(--ds-color-accent)' }}>{m.student_add_schedule()}</span>}
              onClick={() => navigate(`/lessons/series/new?studentId=${student.id}`)}
            />
          </Section>

          <Section footer={archived ? undefined : m.students_footer_archived()}>
            <Cell
              title={
                <span style={{ color: archived ? 'var(--ds-color-accent)' : 'var(--ds-color-danger)' }}>
                  {archived ? m.detail_unarchive() : m.detail_archive()}
                </span>
              }
              onClick={() => {
                if (updateStudent.isPending) return;
                haptic('medium');
                updateStudent.mutate({ id: student.id, body: { status: archived ? 'Active' : 'Archived' } });
              }}
            />
          </Section>
          {updateStudent.isError && <div className={styles['detail__error']}>{m.form_error_save()}</div>}
        </>
      ) : endedSeries.length === 0 && individualPastLessons.length === 0 ? (
        <Placeholder glyph="🗂️" title={m.student_archive_empty()} />
      ) : (
        <>
          {endedSeries.length > 0 && (
            <Section header={m.student_archive_series_section()}>
              {endedSeries.map((s) => (
                <Cell
                  key={s.id}
                  title={s.title ?? m.lesson_series_untitled()}
                  subtitle={
                    `${weekdaysLabel(s.weekdays)} · ${s.startTimeLocal.slice(0, 5)}` +
                    ` · ${m.series_until_short({ date: formatDate(s.endDate!) })}`
                  }
                  chevron
                  minHeight={56}
                  onClick={() => navigate(`/lessons/series/${s.id}/edit`)}
                />
              ))}
            </Section>
          )}

          {individualPastLessons.length > 0 && (
            <Section header={m.student_archive_individual_section()}>
              {individualPastLessons.map((l) => {
                const cancelled = l.status === 'Cancelled';
                const subtitleParts = [`${fmtTime(l.startUtc)}–${fmtTime(l.endUtc)}`];
                if (l.topic) subtitleParts.push(l.topic);
                if (l.status === 'Completed') subtitleParts.push(m.status_completed());
                return (
                  <Cell
                    key={l.id ?? `${l.seriesId}:${l.occurrenceDate}`}
                    title={fmtDayHeader(new Date(l.startUtc))}
                    subtitle={subtitleParts.join(' · ')}
                    subtitleMuted={cancelled}
                    value={cancelled ? m.status_cancelled() : money(l.price)}
                    valueColor={
                      cancelled
                        ? 'var(--ds-color-hint)'
                        : l.isPaid
                          ? 'var(--ds-color-success)'
                          : undefined
                    }
                    dimmed={cancelled}
                    chevron
                    minHeight={56}
                    onClick={() => navigate(lessonPath(l))}
                  />
                );
              })}
            </Section>
          )}
        </>
      )}
    </div>
  );
}
