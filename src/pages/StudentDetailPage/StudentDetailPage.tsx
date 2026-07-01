import { useNavigate, useParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Section, Cell, Avatar, Badge, Placeholder, useMainButton } from '@/shared/ui';
import { useBackButton, haptic } from '@/shared/tg';
import { useStudent } from '@/features/students/queries';
import { balanceText, balanceColor, money, fmt, formatDate, deriveFinance } from '@/features/students/model';
import styles from './StudentDetailPage.module.scss';

export function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: student, isPending } = useStudent(id);

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
          title={m.detail_subject()}
          value={student.subject || m.value_none()}
          valueColor={student.subject ? undefined : 'var(--ds-color-hint)'}
        />
        <Cell
          title={m.detail_rate()}
          value={student.rate ? m.rate_per_lesson({ rate: fmt(student.rate) }) : m.value_none()}
          valueColor={student.rate ? undefined : 'var(--ds-color-hint)'}
        />
        <Cell title={m.detail_contact()} value={student.contact || '—'} valueColor="var(--ds-color-link)" />
        <Cell title={m.detail_added()} value={formatDate(student.createdAtUtc)} />
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
