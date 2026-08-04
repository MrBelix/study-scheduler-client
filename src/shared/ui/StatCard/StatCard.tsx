import { type CSSProperties, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import styles from './StatCard.module.scss';

interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  /** CSS color for the value (e.g. a `--ds-*` var). */
  valueColor?: string;
  /** Small line below the value — should not repeat the number. */
  caption?: ReactNode;
  /** CSS color for the caption (e.g. a `--ds-*` var). */
  captionColor?: string;
  /** Background tint — `warn` for an attention tile (e.g. outstanding debt). @default 'default' */
  tone?: 'default' | 'warn';
}

/** Compact stat surface — label → value → caption, for dashboard-style grids. */
export function StatCard({ label, value, valueColor, caption, captionColor, tone = 'default' }: StatCardProps) {
  const valueStyle = valueColor ? ({ color: valueColor } as CSSProperties) : undefined;
  const captionStyle = captionColor ? ({ color: captionColor } as CSSProperties) : undefined;
  return (
    <div className={cx(styles['stat-card'], tone === 'warn' && styles['stat-card--warn'])}>
      <div className={styles['stat-card__label']}>{label}</div>
      <div className={styles['stat-card__value']} style={valueStyle}>
        {value}
      </div>
      {caption != null && (
        <div className={styles['stat-card__caption']} style={captionStyle}>
          {caption}
        </div>
      )}
    </div>
  );
}
