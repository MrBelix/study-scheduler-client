import { useNavigate } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Icon } from '@/shared/ui';
import type { StudentNextLessonDetails } from '@/shared/api';
import { formatLeadTime, nextLessonDayWord, nextLessonPath } from '@/features/students/model';
import { fmtTime } from '@/shared/lib';
import styles from './NextLessonHero.module.scss';

interface NextLessonHeroProps {
  nextLesson: StudentNextLessonDetails;
}

/** Accent hero card for the student's next lesson — relative-time chip + "Open lesson" action. */
export function NextLessonHero({ nextLesson }: NextLessonHeroProps) {
  const navigate = useNavigate();

  return (
    <div className={styles['hero']}>
      <div className={styles['heroTop']}>
        <span className={styles['heroLabel']}>{m.detail_hero_label()}</span>
        <span className={styles['heroChip']}>
          <Icon name="schedule" size={15} />
          {formatLeadTime(nextLesson.startUtc)}
        </span>
      </div>
      <div className={styles['heroTime']}>
        <span className={styles['heroTimeValue']}>{fmtTime(nextLesson.startUtc)}</span>
        <span className={styles['heroTimeHint']}>
          {[nextLessonDayWord(nextLesson.startUtc), m.minutes({ count: nextLesson.durationMinutes }), nextLesson.subject]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </div>
      <button type="button" className={styles['heroAction']} onClick={() => navigate(nextLessonPath(nextLesson))}>
        {m.detail_open_lesson()}
      </button>
    </div>
  );
}
