import { useEffect, useState } from 'react';
import { subscribeToast, dismissToast } from './toast';
import styles from './ToastHost.module.scss';

/** Mounted once at the app root; renders the current toast message, if any. */
export function ToastHost() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => subscribeToast(setMessage), []);

  if (!message) return null;

  return (
    <div className={styles['toast']} onClick={dismissToast}>
      {message}
    </div>
  );
}
