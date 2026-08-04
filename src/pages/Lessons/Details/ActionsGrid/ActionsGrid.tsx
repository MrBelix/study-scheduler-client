import { m } from '@/paraglide/messages';
import { Icon } from '@/shared/ui';
import type { LessonStatus } from '@/shared/api';
import { cx } from '@/shared/lib';
import styles from './ActionsGrid.module.scss';

interface ActionsGridProps {
  status: LessonStatus;
  /** Spinner on the full-width "done" button specifically (a separate mutation instance from the rest). */
  completing: boolean;
  /** Any lesson mutation on this page in flight — guards every tile against a double tap. */
  disabled: boolean;
  onComplete: () => void;
  onReschedule: () => void;
  onCancel: () => void;
  onEdit: () => void;
}

/**
 * Full-width "done" button plus the action tiles below it — see
 * design-system.html F2 lines 483-488. A Cancelled lesson has nothing left to
 * do here. A Completed lesson is read-only too (2026-08-04, product
 * directive): a taught lesson can't be rescheduled, cancelled, or edited
 * anymore, so the whole grid disappears — only the payment card below still
 * accepts changes.
 */
export function ActionsGrid({ status, completing, disabled, onComplete, onReschedule, onCancel, onEdit }: ActionsGridProps) {
  if (status === 'Cancelled' || status === 'Completed') return null;

  return (
    <div className={styles.grid}>
      <button type="button" className={styles.complete} disabled={disabled} onClick={onComplete}>
        {completing ? (
          <span className={styles.spinner} aria-hidden="true" />
        ) : (
          <Icon name="check_circle" size={22} filled />
        )}
        <span>{m.lesson_action_complete()}</span>
      </button>
      <button type="button" className={styles.tile} disabled={disabled} onClick={onReschedule}>
        <Icon name="swap_horiz" size={22} />
        <span>{m.lesson_reschedule()}</span>
      </button>
      <button type="button" className={cx(styles.tile, styles['tile--danger'])} disabled={disabled} onClick={onCancel}>
        <Icon name="event_busy" size={22} />
        <span>{m.lesson_action_cancel()}</span>
      </button>
      <button type="button" className={styles.tile} disabled={disabled} onClick={onEdit}>
        <Icon name="edit" size={22} />
        <span>{m.lesson_action_edit()}</span>
      </button>
    </div>
  );
}
