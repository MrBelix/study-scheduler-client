import { type ReactNode } from 'react';
import styles from './Section.module.scss';

interface SectionProps {
  header?: string;
  footer?: string;
  children: ReactNode;
}

export function Section({ header, footer, children }: SectionProps) {
  return (
    <div className={styles.section}>
      {header && <SectionLabel>{header}</SectionLabel>}
      <div className={styles['section__body']}>{children}</div>
      {footer && <div className={styles['section__footer']}>{footer}</div>}
    </div>
  );
}

/**
 * The uppercase group label `Section` itself renders — standalone, for
 * screens that lay out a group's body themselves (e.g. a chip row above a
 * card) instead of using `Section`'s single card wrapper.
 */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className={styles['section__header']}>{children}</div>;
}
