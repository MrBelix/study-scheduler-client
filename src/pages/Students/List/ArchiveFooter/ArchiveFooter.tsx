import { m } from '@/paraglide/messages';
import styles from './ArchiveFooter.module.scss';

interface ArchiveFooterProps {
  view: 'active' | 'archived';
  archivedCount: number;
  onSwitch: () => void;
}

/**
 * Centered footer link below the list — "Архів N" from the active view (hidden
 * if the archive is empty), "До активних" from the archived view.
 */
export function ArchiveFooter({ view, archivedCount, onSwitch }: ArchiveFooterProps) {
  if (view === 'active' && archivedCount === 0) return null;
  const label = view === 'archived' ? m.students_back_to_active() : m.students_archive_count({ count: archivedCount });

  return (
    <div className={styles['footer']}>
      <button type="button" className={styles['footerLink']} onClick={onSwitch}>
        {label}
      </button>
    </div>
  );
}
