import { m } from '@/paraglide/messages';
import { Icon } from '@/shared/ui';
import type { LessonConflict } from '@/shared/api';
import { fmtTime } from '@/shared/lib';
import styles from './ConflictBanner.module.scss';

/**
 * The 409 payload rendered for the create form — see design-system.html
 * "FieldError · ConflictBanner · LimitMeter". The etalon also offers a
 * "Все одно" (create anyway) affordance and free-slot suggestions; the API
 * has neither (a 409 here is a hard refusal, and `LessonConflict` carries no
 * suggested times), so this only lists what collides — it doesn't block
 * resubmission (the tutor can just change the time and save again).
 */
export function ConflictBanner({ conflicts }: { conflicts: LessonConflict[] }) {
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
        {conflicts.map((c, i) => (
          <span key={i} className={styles.chip}>
            {fmtTime(c.startUtc)}–{fmtTime(c.endUtc)}
            {c.seriesTitle ? ` · ${c.seriesTitle}` : ''}
          </span>
        ))}
      </div>
    </div>
  );
}
