import { type CSSProperties, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import styles from './Cell.module.scss';

interface CellProps {
  /** Leading slot — avatar or colored icon tile. */
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Render the subtitle in hint (muted) color instead of subtitle color. */
  subtitleMuted?: boolean;
  /** Trailing value (right-aligned). */
  value?: ReactNode;
  /** CSS color for the trailing value (e.g. a `--ds-*` var). */
  valueColor?: string;
  /** Show a trailing chevron. */
  chevron?: boolean;
  /** Left inset of the row divider, in px (matches the leading slot width). */
  inset?: number;
  /** Row min-height, in px. */
  minHeight?: number;
  /** Large trailing value, for a prominent row (e.g. balance). */
  emphasis?: boolean;
  /** De-emphasize the whole row (e.g. archived students). */
  dimmed?: boolean;
  onClick?: () => void;
}

function Chevron() {
  return (
    <svg className={styles['cell__chevron']} width="8" height="13" viewBox="0 0 8 13" fill="none">
      <path d="M1.5 1.5L6.5 6.5L1.5 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Cell({
  leading,
  title,
  subtitle,
  subtitleMuted,
  value,
  valueColor,
  chevron,
  inset = 16,
  minHeight = 46,
  emphasis,
  dimmed,
  onClick,
}: CellProps) {
  const Tag = onClick ? 'button' : 'div';
  const extraProps = onClick ? { type: 'button' as const } : {};
  const style = { '--cell-inset': `${inset}px`, minHeight: `${minHeight}px` } as CSSProperties;

  return (
    <Tag
      className={cx(styles.cell, onClick && styles['cell--clickable'], dimmed && styles['cell--dimmed'])}
      style={style}
      onClick={onClick}
      {...extraProps}
    >
      {leading && <span className={styles['cell__leading']}>{leading}</span>}
      <span className={styles['cell__content']}>
        <span className={styles['cell__title']}>{title}</span>
        {subtitle != null && (
          <span className={cx(styles['cell__subtitle'], subtitleMuted && styles['cell__subtitle--muted'])}>
            {subtitle}
          </span>
        )}
      </span>
      {value != null && (
        <span
          className={cx(styles['cell__value'], emphasis && styles['cell__value--emphasis'])}
          style={valueColor ? { color: valueColor } : undefined}
        >
          {value}
        </span>
      )}
      {chevron && <Chevron />}
    </Tag>
  );
}
