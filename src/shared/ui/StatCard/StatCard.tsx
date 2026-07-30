import { type CSSProperties, type ReactNode } from 'react';
import styles from './StatCard.module.scss';

interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  /** CSS color for the value (e.g. a `--ds-*` var). */
  valueColor?: string;
}

/** Compact stat surface — a label and a large value, for dashboard-style grids. */
export function StatCard({ label, value, valueColor }: StatCardProps) {
  const style = valueColor ? ({ color: valueColor } as CSSProperties) : undefined;
  return (
    <div className={styles['stat-card']}>
      <div className={styles['stat-card__label']}>{label}</div>
      <div className={styles['stat-card__value']} style={style}>
        {value}
      </div>
    </div>
  );
}
