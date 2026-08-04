import { m } from '@/paraglide/messages';
import { BottomSheet, Button } from '@/shared/ui';
import { haptic } from '@/shared/tg';
import styles from './ArchiveConfirmSheet.module.scss';

interface ArchiveConfirmSheetProps {
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Confirms "В архів" — states the cascade honestly instead of implying a
 * reversible no-op: archiving stops the student's recurring series and
 * deletes their future unfinished lessons (mirrors `PATCH /students/{id}`'s
 * archive side effect), and un-archiving does NOT bring the schedule back.
 * Any outstanding debt is untouched either way. Same visual shape as
 * `CancelSeriesSheet` (title + hint + destructive/ghost action pair), minus
 * the `keepCustomized` toggle — archiving has no such option.
 */
export function ArchiveConfirmSheet({ pending, onConfirm, onClose }: ArchiveConfirmSheetProps) {
  const confirm = () => {
    if (pending) return;
    haptic('medium');
    onConfirm();
  };

  return (
    <BottomSheet onClose={onClose}>
      <div className={styles.sheet}>
        <div className={styles.head}>
          <span className={styles.title}>{m.detail_archive_confirm_title()}</span>
          <span className={styles.hint}>{m.detail_archive_confirm_hint()}</span>
        </div>

        <div className={styles.actions}>
          <Button variant="destructive" fullWidth loading={pending} onClick={confirm}>
            {m.detail_archive_action()}
          </Button>
          <Button variant="ghost" fullWidth disabled={pending} onClick={onClose}>
            {m.lesson_cancel_dismiss()}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
