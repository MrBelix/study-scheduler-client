import { Skeleton } from '@/shared/ui';
import styles from './DetailsSkeleton.module.scss';

/** Pending-state placeholder for the student detail page — mirrors the header + hero geometry. */
export function DetailsSkeleton() {
  return (
    <div className={styles['wrap']}>
      <div className={styles['header']}>
        <Skeleton circle={56} />
        <div className={styles['headerText']}>
          <Skeleton width={140} height={20} />
          <Skeleton width={90} height={13} />
        </div>
      </div>
      <div className={styles['hero']}>
        <Skeleton width={90} height={11} />
        <Skeleton width={110} height={30} />
        <Skeleton width="100%" height={44} />
      </div>
    </div>
  );
}
