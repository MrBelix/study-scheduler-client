import { m } from '@/paraglide/messages';
import { Icon } from '@/shared/ui';
import type { LessonConflict } from '@/shared/api';
import { formatDayShortMonth, fmtTime } from '@/shared/lib';
import styles from './ConflictBanner.module.scss';

/** Cap the rendered chips — a weekly series with no end date can collide with an unbounded number of occurrences. */
const MAX_VISIBLE = 5;

/**
 * The 409 payload rendered for the create form — see design-system.html
 * "FieldError · ConflictBanner · LimitMeter". The etalon also offers a
 * "Все одно" (create anyway) affordance and free-slot suggestions; the API
 * has neither (a 409 here is a hard refusal, and `LessonConflict` carries no
 * suggested times), so this only lists what collides — it doesn't block
 * resubmission (the tutor can just change the time and save again).
 */
export function ConflictBanner({ conflicts }: { conflicts: LessonConflict[] }) {
  const visible = conflicts.slice(0, MAX_VISIBLE);
  const hiddenCount = conflicts.length - visible.length;
  return (
    <div className={styles.banner}>
      <div className={styles.head}>
        <Icon name="event_busy" filled size={20} className={styles.icon} />
        <div className={styles.text}>
          <span className={styles.title}>{m.lesson_form_conflict_title()}</span>
          <span className={styles.sub}>{m.lesson_form_conflict_sub()}</span>
        </div>
      </div>
      <div className={styles.list}>
        {visible.map((c, i) => (
          <span key={i} className={styles.chip}>
            {formatDayShortMonth(c.startUtc)} · {fmtTime(c.startUtc)}–{fmtTime(c.endUtc)}
            {c.seriesTitle ? ` · ${c.seriesTitle}` : ''}
          </span>
        ))}
        {hiddenCount > 0 && (
          <span className={styles.chip}>{m.lesson_form_conflict_more({ count: hiddenCount })}</span>
        )}
      </div>
    </div>
  );
}
