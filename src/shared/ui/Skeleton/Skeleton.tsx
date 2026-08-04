import type { CSSProperties } from 'react';
import styles from './Skeleton.module.scss';

interface SkeletonProps {
  /** Bar width — CSS value or px. Default 60%. */
  width?: string | number;
  /** Bar height in px. Default 12. */
  height?: number;
  /** Circle diameter in px — replaces width/height (avatar placeholder). */
  circle?: number;
  /** Corner radius in px for a non-circle bar — mirrors a square/rounded content shape (e.g. an icon tile). */
  radius?: number;
  /** Animation delay in ms — stagger a list of skeleton rows. */
  delay?: number;
}

/** Pulsing placeholder block shown while content loads. */
export function Skeleton({ width = '60%', height = 12, circle, radius, delay }: SkeletonProps) {
  const style: CSSProperties = {
    ...(circle
      ? { width: circle, height: circle, borderRadius: '50%' }
      : { width, height, ...(radius != null ? { borderRadius: radius } : null) }),
    ...(delay ? { animationDelay: `${delay}ms` } : null),
  };
  return <span className={styles['skeleton']} style={style} aria-hidden />;
}
