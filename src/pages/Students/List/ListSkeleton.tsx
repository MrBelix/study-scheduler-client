import { Section, Cell, Skeleton } from '@/shared/ui';

/** 6-row skeleton placeholder for the students list, staggered fade-in. */
export function ListSkeleton() {
  return (
    <Section>
      {Array.from({ length: 6 }, (_, i) => (
        <Cell
          key={i}
          inset={70}
          minHeight={60}
          leading={<Skeleton circle={42} delay={i * 150} />}
          title={<Skeleton width={100} height={15} delay={i * 150} />}
          subtitle={<Skeleton width={150} height={11} delay={i * 150} />}
        />
      ))}
    </Section>
  );
}
