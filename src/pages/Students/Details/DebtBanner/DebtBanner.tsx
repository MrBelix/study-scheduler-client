import { m } from '@/paraglide/messages';
import { Icon } from '@/shared/ui';
import type { StudentDebt } from '@/shared/api';
import { money } from '@/shared/lib';
import { lessonsCountLabel } from '@/features/reports/model';
import styles from './DebtBanner.module.scss';

interface DebtBannerProps {
  debt: StudentDebt;
  onClick: () => void;
}

/**
 * Warn-tinted "Не оплачено" strip (F5 etalon) on the student detail page —
 * rendered only when `StudentDetails.debt` is non-null. Per product
 * directive there's no inline "Оплатив" action; the whole row is tappable
 * and opens the bulk-settle page (`routes.students.debts`) instead.
 */
export function DebtBanner({ debt, onClick }: DebtBannerProps) {
  return (
    <button type="button" className={styles.banner} onClick={onClick}>
      <Icon name="account_balance_wallet" filled size={20} className={styles.icon} />
      <span className={styles.text}>
        {m.student_debt_label()}
        {' '}
        <span className={styles.amount}>{money(debt.amount)}</span>
        {' · '}
        {lessonsCountLabel(debt.lessonsCount)}
      </span>
      <Icon name="chevron_right" size={20} className={styles.chevron} />
    </button>
  );
}
