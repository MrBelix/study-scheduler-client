import { type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';
import type { IconName } from '../Icon/icons';
import styles from './EmptyState.module.scss';

interface EmptyStateAction {
  label: string;
  icon?: IconName;
  onClick: () => void;
}

interface EmptyStateProps {
  /** @default 'primary' */
  variant?: 'primary' | 'secondary';
  icon: IconName;
  /** Icon square tint — `warn` for e.g. an offline/error state. @default 'accent' for primary, 'neutral' for secondary */
  tone?: 'accent' | 'warn' | 'neutral';
  title: ReactNode;
  description?: ReactNode;
  /** Full accent pill on `primary`; small tinted pill (e.g. a retry) on `secondary`. */
  action?: EmptyStateAction;
  /** `primary` variant only. */
  caption?: ReactNode;
}

/** Full-block empty/error state — see design-system.html "EmptyState" block. */
export function EmptyState({
  variant = 'primary',
  icon,
  tone = variant === 'secondary' ? 'neutral' : 'accent',
  title,
  description,
  action,
  caption,
}: EmptyStateProps) {
  const isPrimary = variant === 'primary';
  return (
    <div className={cx(styles['empty-state'], styles[`empty-state--${variant}`])}>
      <span className={cx(styles['empty-state__icon'], styles[`empty-state__icon--${tone}`])}>
        <Icon name={icon} size={isPrimary ? 32 : 24} />
      </span>
      <div className={styles['empty-state__text']}>
        <span className={styles['empty-state__title']}>{title}</span>
        {description != null && <span className={styles['empty-state__description']}>{description}</span>}
      </div>
      {action && (
        <button
          type="button"
          className={cx(styles['empty-state__action'], !isPrimary && styles['empty-state__action--small'])}
          onClick={action.onClick}
        >
          {action.icon && <Icon name={action.icon} size={isPrimary ? 21 : 16} />}
          {action.label}
        </button>
      )}
      {isPrimary && caption != null && <span className={styles['empty-state__caption']}>{caption}</span>}
    </div>
  );
}
