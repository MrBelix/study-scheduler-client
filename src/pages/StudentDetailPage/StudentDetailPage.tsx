import { useNavigate, useParams } from 'react-router-dom';
import { NavHeader, Section, Cell, Avatar, Badge, Placeholder } from '@/shared/ui';
import { useBackButton, useMainButton, haptic } from '@/shared/tg';
import { useStudent } from '@/features/students/queries';
import { balanceText, balanceColor, money, formatDate, deriveFinance } from '@/features/students/model';
import styles from './StudentDetailPage.module.scss';

export function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: student, isPending } = useStudent(id);

  useBackButton(() => navigate(-1));
  useMainButton({ text: 'Редагувати', onClick: () => navigate(`/students/${id}/edit`) });

  if (isPending) {
    return (
      <div>
        <NavHeader title="" />
      </div>
    );
  }

  if (!student) {
    return (
      <div>
        <NavHeader title="Студент" />
        <Placeholder glyph="🔍" title="Студента не знайдено" />
      </div>
    );
  }

  const firstName = student.name.split(' ')[0];
  const { paid, lessons, balance } = deriveFinance(student);
  const archived = student.status === 'Archived';

  return (
    <div className={styles['detail']}>
      <NavHeader title={firstName} />

      <div className={styles['detail__header']}>
        <Avatar name={student.name} size={88} />
        <div className={styles['detail__name']}>{student.name}</div>
        <Badge mode={archived ? 'muted' : 'success'}>{archived ? 'Архів' : 'Активний'}</Badge>
      </div>

      <Section header="Профіль">
        <Cell
          title="Предмет"
          value={student.subject || 'Не вказано'}
          valueColor={student.subject ? undefined : 'var(--ds-color-hint)'}
        />
        <Cell
          title="Ставка"
          value={student.rate ? `${money(student.rate)}/заняття` : 'Не вказано'}
          valueColor={student.rate ? undefined : 'var(--ds-color-hint)'}
        />
        <Cell title="Контакт" value={student.contact || '—'} valueColor="var(--ds-color-link)" />
        <Cell title="Додано" value={formatDate(student.createdAtUtc)} />
      </Section>

      <Section
        header="Фінанси"
        footer="Баланс = сума оплат − проведені заняття × ставка"
      >
        <Cell
          title={balance < 0 ? 'Борг' : 'Баланс'}
          minHeight={56}
          emphasis
          value={balanceText(balance)}
          valueColor={balanceColor(balance)}
        />
        <Cell title="Оплачено загалом" value={money(paid)} />
        <Cell title="Проведено занять" value={String(lessons)} />
      </Section>

      <Section>
        <Cell
          title={<span style={{ color: 'var(--ds-color-accent)' }}>Додати оплату</span>}
          onClick={() => haptic('light')}
        />
        <Cell
          title={<span style={{ color: 'var(--ds-color-danger)' }}>Архівувати студента</span>}
          onClick={() => haptic('medium')}
        />
      </Section>
    </div>
  );
}
