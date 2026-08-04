import { Skeleton, Section, Cell } from '@/shared/ui';
import styles from './SeriesViewSkeleton.module.scss';

/** Pending-state placeholder for the series view page — mirrors the hero + card geometry. */
export function SeriesViewSkeleton() {
  return (
    <div className={styles.wrap}>
      <div className={styles.hero}>
        <Skeleton circle={52} />
        <Skeleton width={140} height={24} />
        <Skeleton width={190} height={13} />
        <Skeleton width={130} height={22} radius={12} />
      </div>

      <Section>
        <Cell title={<Skeleton width="60%" />} value={<Skeleton width={50} />} />
        <Cell title={<Skeleton width="45%" />} value={<Skeleton width={50} />} />
      </Section>

      <Section>
        <Cell
          inset={58}
          leading={<Skeleton width={30} height={30} radius={9} />}
          title={<Skeleton width="70%" />}
        />
        <Cell
          inset={58}
          leading={<Skeleton width={30} height={30} radius={9} />}
          title={<Skeleton width="60%" />}
        />
      </Section>
    </div>
  );
}
