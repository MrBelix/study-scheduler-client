import { Skeleton } from '@/shared/ui';
import styles from './ProfileSkeleton.module.scss';

/** Pending-state placeholder for the profile page — mirrors the header + section-card geometry. */
export function ProfileSkeleton() {
  return (
    <div className={styles['wrap']}>
      <div className={styles['header']}>
        <Skeleton circle={56} />
        <div className={styles['headerText']}>
          <Skeleton width={150} height={20} />
          <Skeleton width={110} height={14} />
        </div>
      </div>

      <div className={styles['section']}>
        <Skeleton width={90} height={11} />
        <Skeleton width="100%" height={52} radius={18} />
      </div>

      <div className={styles['section']}>
        <Skeleton width={130} height={11} />
        <Skeleton width="100%" height={104} radius={18} />
      </div>

      <div className={styles['section']}>
        <Skeleton width={90} height={11} />
        <Skeleton width="100%" height={104} radius={18} />
      </div>
    </div>
  );
}
