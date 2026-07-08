import type { CSSProperties } from 'react';
import styles from './Skeleton.module.scss';

interface SkeletonProps {
  /** Bar width — CSS value or px. Default 60%. */
  width?: string | number;
  /** Bar height in px. Default 12. */
  height?: number;
  /** Circle diameter in px — replaces width/height (avatar placeholder). */
  circle?: number;
}

/** Pulsing placeholder block shown while content loads. */
export function Skeleton({ width = '60%', height = 12, circle }: SkeletonProps) {
  const style: CSSProperties = circle
    ? { width: circle, height: circle, borderRadius: '50%' }
    : { width, height };
  return <span className={styles['skeleton']} style={style} aria-hidden />;
}
