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
      className={`${styles.cell}${onClick ? ` ${styles['cell--clickable']}` : ''}`}
      onClick={onClick}
      {...extraProps}
    >
      {before && <span className={styles['cell__before']}>{before}</span>}
      <div className={styles['cell__inner']}>
        <div className={styles['cell__content']}>
          <span className={styles['cell__title']}>{title}</span>
          {subtitle && <span className={styles['cell__subtitle']}>{subtitle}</span>}
        </div>
        {after && <span className={styles['cell__after']}>{after}</span>}
      </div>
    </Tag>
  );
}
