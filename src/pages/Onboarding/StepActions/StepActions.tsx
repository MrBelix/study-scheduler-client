import type { ReactNode } from 'react';
import styles from './StepActions.module.scss';

/** Sticky bottom action stack — primary (+ optional ghost) button, safe-area aware (design-system.html O1–O4). */
export function StepActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>;
}
