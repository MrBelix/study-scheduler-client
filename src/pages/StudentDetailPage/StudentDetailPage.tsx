import { useNavigate, useParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Section, Cell, Avatar, Badge, Placeholder, useMainButton } from '@/shared/ui';
import { useBackButton, haptic } from '@/shared/tg';
import { useStudent } from '@/features/students/queries';
import { useSeriesList } from '@/features/lessons/queries';
import { weekdaysLabel } from '@/features/lessons/model';
import { balanceText, balanceColor, money, fmt, formatDate, deriveFinance } from '@/features/students/model';
import styles from './StudentDetailPage.module.scss';

export function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: student, isPending } = useStudent(id);
  const { data: seriesList } = useSeriesList();

  useBackButton(() => navigate(-1));
  useMainButton({ text: m.edit(), onClick: () => navigate(`/students/${id}/edit`) });

  if (isPending) {
    return <div />;
  }

  if (!student) {
    return <Placeholder glyph="🔍" title={m.student_not_found()} />;
  }

  const { paid, lessons, balance } = deriveFinance(student);
  const archived = student.status === 'Archived';

  // A student's subjects are their active series ("Математика" пн/чт +
  // "Фізика" ср, each with its own price) — shown in the schedule section.
  const activeSeries = (seriesList ?? []).filter((s) => s.studentId === student.id && s.isActive);

  return (
    <div className={styles['detail']}>
      <div className={styles['detail__header']}>
        <Avatar name={student.name} size={88} />
        <div className={styles['detail__name']}>{student.name}</div>
        <Badge mode={archived ? 'muted' : 'success'}>
          {archived ? m.status_archived() : m.status_active()}
        </Badge>
      </div>

      <Section header={m.detail_section_profile()}>
        <Cell
          title={m.detail_rate()}
          value={student.rate ? m.rate_per_lesson({ rate: fmt(student.rate) }) : m.value_none()}
          valueColor={student.rate ? undefined : 'var(--ds-color-hint)'}
        />
        <Cell title={m.detail_contact()} value={student.contact || '—'} valueColor="var(--ds-color-link)" />
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

      <Section header={m.detail_section_finances()} footer={m.detail_finance_formula()}>
        <Cell
          title={balance < 0 ? m.detail_debt() : m.detail_balance()}
          minHeight={56}
          emphasis
          value={balanceText(balance)}
          valueColor={balanceColor(balance)}
        />
        <Cell title={m.detail_paid_total()} value={money(paid)} />
        <Cell title={m.detail_lessons_count()} value={String(lessons)} />
      </Section>

      <Section>
        <Cell
          title={<span style={{ color: 'var(--ds-color-accent)' }}>{m.detail_add_payment()}</span>}
          onClick={() => haptic('light')}
        />
        <Cell
          title={<span style={{ color: 'var(--ds-color-danger)' }}>{m.detail_archive()}</span>}
          onClick={() => haptic('medium')}
        />
      </Section>
    </div>
  );
}
