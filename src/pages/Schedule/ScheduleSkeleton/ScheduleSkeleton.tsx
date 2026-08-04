import { Skeleton } from '@/shared/ui';
import styles from './ScheduleSkeleton.module.scss';

/** Pending-state placeholder — mirrors the header + DayStrip + list geometry. */
export function ScheduleSkeleton() {
  return (
    <div className={styles['wrap']}>
      <div className={styles['header']}>
        <Skeleton width={110} height={22} />
      </div>

      <div className={styles['strip']}>
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className={styles['day']}>
            <Skeleton width={18} height={11} />
            <Skeleton circle={44} />
          </div>
        ))}
      </div>

      <Skeleton width={140} height={15} />

      <div className={styles['rows']}>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className={styles['row']}>
            <Skeleton width={40} height={17} delay={i * 60} />
            <div className={styles['rowBody']}>
              <Skeleton circle={24} />
              <Skeleton width="50%" height={14} delay={i * 60} />
            </div>
            <Skeleton width={44} height={14} />
          </div>
        ))}
      </div>
    </div>
  );
}
