import { type CSSProperties, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';
import styles from './Cell.module.scss';

interface CellProps {
  /** Leading slot — avatar or colored icon tile. */
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Render the subtitle in hint (muted) color instead of subtitle color. */
  subtitleMuted?: boolean;
  /**
   * Stacked layout: `title` renders as a small label above `subtitle`, which
   * renders as the bold, larger value — for icon-tile rows like
   * "Постійні уроки / Алгебра, НМТ" (see design-system.html "SectionLabel +
   * Card + Row").
   */
  stacked?: boolean;
  /**
   * Opt out of the two-line auto-bold title (list-item convention). For
   * settings-style rows that pair a plain-weight title with a hint subtitle
   * (e.g. a switch row) rather than a name + context list item.
   */
  plainTitle?: boolean;
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

export function Cell({
  leading,
  title,
  subtitle,
  subtitleMuted,
  stacked,
  plainTitle,
  value,
  valueColor,
  chevron,
  inset = 16,
  minHeight = 44,
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
      <span
        className={cx(
          styles['cell__content'],
          stacked && styles['cell__content--stacked'],
          plainTitle && styles['cell__content--plain'],
        )}
      >
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
      {chevron && <Icon name="chevron_right" size={20} className={styles['cell__chevron']} />}
    </Tag>
  );
}
