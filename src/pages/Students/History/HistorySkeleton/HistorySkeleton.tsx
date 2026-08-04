import { Skeleton } from '@/shared/ui';
import styles from './HistorySkeleton.module.scss';

/** Pending-state placeholder for F7 — mirrors the header + segmented control + month-card row geometry. */
export function HistorySkeleton() {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <Skeleton width={180} height={24} />
        <Skeleton width={150} height={14} />
      </div>

      <Skeleton width="100%" height={42} radius={13} />

      <div className={styles.group}>
        <Skeleton width={70} height={12} />
        <div className={styles.card}>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className={styles.row}>
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
    </div>
  );
}
