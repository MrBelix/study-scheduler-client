import { type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import styles from './Badge.module.scss';

interface BadgeProps {
  mode?: 'success' | 'muted';
  children: ReactNode;
}

/** Small status pill — tinted background + matching text color. */
export function Badge({ mode = 'success', children }: BadgeProps) {
  return <span className={cx(styles.badge, styles[`badge--${mode}`])}>{children}</span>;
}
