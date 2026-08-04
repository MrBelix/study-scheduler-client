import { useEffect, useState } from 'react';
import { m } from '@/paraglide/messages';
import { BottomSheet, Switch, Button, showToast } from '@/shared/ui';
import { haptic, notify } from '@/shared/tg';
import { apiFormErrors } from '@/shared/lib';
import { useCancelSeries } from '@/features/lessons/queries';
import styles from './CancelSeriesSheet.module.scss';

interface CancelSeriesSheetProps {
  seriesId: string;
  /** The series' display name, for the consequence copy. */
  seriesLabel: string;
  onClose: () => void;
  /** Fired once the series is cancelled — its own view page usually stops resolving in any useful way. */
  onCancelled: () => void;
}

/**
 * "Скасувати постійні уроки" confirm — see design-system.html F6b line 942
 * for the consequence copy (also the caption under the actions card).
 * `POST /lessons/series/{id}/cancel`, same `keepCustomized` convention as
 * `CancelSheet`'s "this and all future" scope.
 */
export function CancelSeriesSheet({ seriesId, seriesLabel, onClose, onCancelled }: CancelSeriesSheetProps) {
  const [keepCustomized, setKeepCustomized] = useState(true);
  const cancelSeries = useCancelSeries();

  useEffect(() => {
    if (!cancelSeries.error) return;
    const { unmappedMessages, genericError } = apiFormErrors(cancelSeries.error);
    if (unmappedMessages.length > 0) showToast(unmappedMessages.join(' '));
    else if (genericError) showToast(genericError);
  }, [cancelSeries.error]);

  const confirm = () => {
    if (cancelSeries.isPending) return;
    haptic('medium');
    cancelSeries.mutate(
      { id: seriesId, keepCustomized },
      {
        onSuccess: (res) => {
          if (res.removedLessons.length > 0) notify(m.series_cancel_removed({ count: res.removedLessons.length }));
          onCancelled();
        },
      },
    );
  };

  return (
    <BottomSheet onClose={onClose}>
      <div className={styles.sheet}>
        <div className={styles.head}>
          <span className={styles.title}>{m.series_view_cancel_confirm_title()}</span>
          <span className={styles.hint}>{m.series_view_actions_caption({ title: seriesLabel })}</span>
        </div>

        <div className={styles.keepRow}>
          <span className={styles.keepText}>
            <span className={styles.keepTitle}>{m.lesson_cancel_keep_customized()}</span>
            <span className={styles.keepHint}>{m.lesson_cancel_keep_customized_hint()}</span>
          </span>
          <Switch checked={keepCustomized} onChange={setKeepCustomized} disabled={cancelSeries.isPending} />
        </div>

        <div className={styles.actions}>
          <Button variant="destructive" fullWidth loading={cancelSeries.isPending} onClick={confirm}>
            {m.series_view_action_cancel_title()}
          </Button>
          <Button variant="ghost" fullWidth disabled={cancelSeries.isPending} onClick={onClose}>
            {m.lesson_cancel_dismiss()}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
