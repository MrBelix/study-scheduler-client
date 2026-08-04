import { type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';
import type { IconName } from '../Icon/icons';
import styles from './StatusPill.module.scss';

export type StatusPillTone = 'ok' | 'accent' | 'warn' | 'neutral';

interface StatusPillProps {
  tone: StatusPillTone;
  icon?: IconName;
  /** Render the icon's FILL 1 variant. */
  iconFilled?: boolean;
  children: ReactNode;
}

/** Small status pill — tinted background + matching 13/700 text, optional icon. */
export function StatusPill({ tone, icon, iconFilled, children }: StatusPillProps) {
  return (
    <span className={cx(styles.pill, styles[`pill--${tone}`])}>
      {icon && <Icon name={icon} size={15} filled={iconFilled} />}
      {children}
    </span>
  );
}
