import { Skeleton, Section, Cell } from '@/shared/ui';
import styles from './DetailSkeleton.module.scss';

/** Pending-state placeholder for the lesson detail page — mirrors the header + cards geometry. */
export function DetailSkeleton() {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <Skeleton width={110} height={24} radius={12} />
        <Skeleton width={160} height={36} />
        <Skeleton width={190} height={12} />
      </div>

      <Section>
        <Cell
          inset={64}
          minHeight={56}
          leading={<Skeleton circle={36} />}
          title={<Skeleton />}
          subtitle={<Skeleton width="40%" height={10} />}
        />
      </Section>

      <div className={styles.grid}>
        <Skeleton width="100%" height={54} radius={16} />
        <Skeleton width="100%" height={66} radius={16} />
        <Skeleton width="100%" height={66} radius={16} />
        <Skeleton width="100%" height={66} radius={16} />
      </div>

      <Section>
        <Cell title={<Skeleton width="30%" />} value={<Skeleton width={70} />} />
        <Cell title={<Skeleton width="35%" />} value={<Skeleton width={51} height={31} radius={16} />} />
      </Section>

      <Section>
        <Cell title={<Skeleton width="60%" />} />
      </Section>
    </div>
  );
}
