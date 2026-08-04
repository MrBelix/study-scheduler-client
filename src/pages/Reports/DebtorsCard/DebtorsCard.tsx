import { useNavigate } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Section, Cell, Avatar } from '@/shared/ui';
import type { Debtor } from '@/shared/api';
import { routes } from '@/shared/routing';
import { money, formatDayShortMonth } from '@/shared/lib';
import { lessonsCountLabel } from '@/features/reports/model';
import styles from './DebtorsCard.module.scss';

interface DebtorsCardProps {
  debtors: Debtor[];
}

// 16 (gutter) + 34 (avatar) + 12 (gap) — matches the leading avatar width, see Cell's `inset`.
const ROW_INSET = 62;

/** "ХТО НЕ ЗАПЛАТИВ" — one row per debtor, ordered by amount owed (server-side). */
export function DebtorsCard({ debtors }: DebtorsCardProps) {
  const navigate = useNavigate();
  return (
    <Section header={m.reports_debtors_header()}>
      {debtors.map((d) => (
        <Cell
          key={d.studentId}
          leading={<Avatar name={d.name} size={34} />}
          title={d.name}
          subtitle={`${lessonsCountLabel(d.lessonsCount)} · ${m.reports_debtor_since({ date: formatDayShortMonth(d.oldestUtc) })}`}
          value={<span className={styles['amount']}>{money(d.amount)}</span>}
          valueColor="var(--ds-color-warn)"
          chevron
          inset={ROW_INSET}
          minHeight={60}
          onClick={() => navigate(routes.students.details(d.studentId))}
        />
      ))}
    </Section>
  );
}
