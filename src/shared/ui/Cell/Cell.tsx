import { type ReactNode } from 'react';
import styles from './Cell.module.scss';

interface CellProps {
  before?: ReactNode;
  after?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  onClick?: () => void;
}

export function Cell({ before, after, title, subtitle, onClick }: CellProps) {
  const Tag = onClick ? 'button' : 'div';
  const extraProps = onClick ? { type: 'button' as const } : {};

  return (
    <Tag
      className={`${styles.cell} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
      {...extraProps}
    >
      {before && <span className={styles.before}>{before}</span>}
      <div className={styles.inner}>
        <div className={styles.content}>
          <span className={styles.title}>{title}</span>
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </div>
        {after && <span className={styles.after}>{after}</span>}
      </div>
    </Tag>
  );
}
