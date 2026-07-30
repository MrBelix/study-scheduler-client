import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import styles from './GlobalProgressBar.module.scss';

/** Thin bar fixed to the top of the viewport, visible while any query or mutation is in flight. */
export function GlobalProgressBar() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  if (isFetching === 0 && isMutating === 0) return null;
  return <div className={styles['global-progress-bar']} />;
}
