import { Skeleton } from '@/shared/ui';
import styles from './MoneySkeleton.module.scss';

/** Pending-state placeholder — mirrors the segmented control + nav + hero + grid geometry. */
export function MoneySkeleton() {
  return (
    <div className={styles['wrap']}>
      <Skeleton width="100%" height={42} radius={13} />

      <div className={styles['nav']}>
        <Skeleton circle={36} />
        <Skeleton width={140} height={22} />
        <Skeleton circle={36} />
      </div>

      <Skeleton width="100%" height={168} radius={20} />

      <div className={styles['grid']}>
        <Skeleton width="100%" height={90} radius={18} />
        <Skeleton width="100%" height={90} radius={18} />
      </div>
    </div>
  );
}
