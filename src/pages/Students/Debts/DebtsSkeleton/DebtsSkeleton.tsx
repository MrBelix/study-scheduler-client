import { Skeleton } from '@/shared/ui';
import styles from './DebtsSkeleton.module.scss';

/** Pending-state placeholder for the student debts page — mirrors the header + row-list geometry. */
export function DebtsSkeleton() {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <Skeleton width={180} height={24} />
      </div>

      <Skeleton width="55%" height={14} />

      <div className={styles.card}>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className={styles.row}>
            <Skeleton circle={22} />
            <Skeleton width={22} height={34} />
            <div className={styles.rowText}>
              <Skeleton width="55%" height={16} />
              <Skeleton width="35%" height={13} delay={i * 60} />
            </div>
            <Skeleton width={44} height={15} />
          </div>
        ))}
      </div>
    </div>
  );
}
