import { m } from '@/paraglide/messages';
import { Icon } from '@/shared/ui';
import styles from './PeriodNav.module.scss';

interface PeriodNavProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  /** Blocks navigating into a future period — the displayed period is already the current one. */
  nextDisabled: boolean;
}

/** Prev/next period arrows around the current period's label. */
export function PeriodNav({ label, onPrev, onNext, nextDisabled }: PeriodNavProps) {
  return (
    <div className={styles['nav']}>
      <button type="button" className={styles['nav__arrow']} aria-label={m.reports_prev()} onClick={onPrev}>
        <Icon name="chevron_left" size={18} />
      </button>
      <span className={styles['nav__label']}>{label}</span>
      <button
        type="button"
        className={styles['nav__arrow']}
        aria-label={m.reports_next()}
        onClick={onNext}
        disabled={nextDisabled}
      >
        <Icon name="chevron_right" size={18} />
      </button>
    </div>
  );
}
