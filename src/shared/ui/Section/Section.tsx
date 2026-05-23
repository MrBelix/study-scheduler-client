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
      {header && <div className={styles.header}>{header}</div>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
