import { Skeleton } from '@/shared/ui';
import styles from './SeriesSkeleton.module.scss';

/** Pending-state placeholder for the series page — mirrors the header + card-list geometry. */
export function SeriesSkeleton() {
  return (
    <div className={styles['wrap']}>
      <div className={styles['header']}>
        <Skeleton width={160} height={24} />
        <Skeleton width={120} height={14} />
      </div>
      <div className={styles['list']}>
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className={styles['cardSkeleton']}>
            <Skeleton width={34} height={34} radius={12} />
            <div className={styles['cardSkeletonText']}>
              <Skeleton width="60%" height={18} />
              <Skeleton width="40%" height={13} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
