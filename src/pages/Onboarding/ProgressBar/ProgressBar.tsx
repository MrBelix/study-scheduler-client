import styles from './ProgressBar.module.scss';

interface ProgressBarProps {
  /** 0-indexed current step. */
  step: number;
  total: number;
}

/** Segmented step indicator — filled up to (and including) the current step (design-system.html O1–O4). */
export function ProgressBar({ step, total }: ProgressBarProps) {
  return (
    <div className={styles.bar}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i <= step ? styles['segment--active'] : styles.segment} />
      ))}
    </div>
  );
}
