import { type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';
import type { IconName } from '../Icon/icons';
import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'tinted' | 'success' | 'ghost' | 'destructive';

interface ButtonProps {
  /** @default 'primary' */
  variant?: ButtonVariant;
  icon?: IconName;
  /** Render the icon's FILL 1 variant (e.g. a solid `check_circle` on a success button). */
  iconFilled?: boolean;
  disabled?: boolean;
  /** Shows a spinner next to the label while a mutation is in flight. */
  loading?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
  children: ReactNode;
}

/** Primary action button — see design-system.html "Button" block for variants. */
export function Button({
  variant = 'primary',
  icon,
  iconFilled,
  disabled,
  loading,
  fullWidth,
  type = 'button',
  onClick,
  children,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        styles.button,
        styles[`button--${variant}`],
        fullWidth && styles['button--full'],
        loading && styles['button--loading'],
      )}
      disabled={disabled}
      onClick={loading ? undefined : onClick}
    >
      {loading ? (
        <span className={styles['button__spinner']} aria-hidden="true" />
      ) : (
        icon && <Icon name={icon} size={variant === 'ghost' ? 20 : 22} filled={iconFilled} />
      )}
      <span className={styles['button__label']}>{children}</span>
    </button>
  );
}
