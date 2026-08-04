import { useNavigate } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Icon, Avatar } from '@/shared/ui';
import type { LessonSeries, Student } from '@/shared/api';
import { fmtTime, money } from '@/shared/lib';
import { heroLabel, heroChip, lessonPath, type HeroLesson } from '@/features/lessons/model';
import styles from './NextLessonCard.module.scss';

interface NextLessonCardProps {
  hero: HeroLesson;
  /** Ticking clock from the page — keeps the relative-time chip and hero kind fresh. */
  now: Date;
  student: Student | undefined;
  series: LessonSeries | undefined;
  onComplete: () => void;
  completing: boolean;
}

/**
 * Accent hero card for today's schedule — the live/just-finished lesson beats
 * the next upcoming one (amendment 3). See design-system.html F1 lines 375-397.
 */
export function NextLessonCard({ hero, now, student, series, onComplete, completing }: NextLessonCardProps) {
  const navigate = useNavigate();
  const { lesson } = hero;
  const studentName = student?.name ?? m.value_none();
  const subject = [series?.title, lesson.topic].filter((s): s is string => Boolean(s)).join(' · ') || null;

  return (
    <div className={styles['hero']}>
      <div className={styles['top']}>
        <span className={styles['label']}>{heroLabel(hero.kind)}</span>
        <span className={styles['chip']}>
          <Icon name="schedule" size={15} />
          {heroChip(hero, now)}
        </span>
      </div>

      <div className={styles['time']}>
        <span className={styles['timeValue']}>{fmtTime(lesson.startUtc)}</span>
        <span className={styles['timeHint']}>
          – {fmtTime(lesson.endUtc)} · {m.minutes({ count: lesson.durationMinutes })}
        </span>
      </div>

      <div className={styles['student']}>
        <Avatar name={studentName} size={32} />
        <div className={styles['studentText']}>
          <span className={styles['studentName']}>{studentName}</span>
          {subject && <span className={styles['studentSubject']}>{subject}</span>}
        </div>
        <span className={styles['price']}>{money(lesson.price)}</span>
      </div>

      <div className={styles['actions']}>
        <button type="button" className={styles['complete']} disabled={completing} onClick={onComplete}>
          {completing ? (
            <span className={styles['spinner']} aria-hidden="true" />
          ) : (
            <Icon name="check_circle" size={19} filled />
          )}
          <span>{m.schedule_hero_complete()}</span>
        </button>
        <button
          type="button"
          className={styles['iconBtn']}
          aria-label={m.lesson_reschedule()}
          // Opens the detail page with its reschedule sheet already up — without
          // the state it lands on the same screen as the "more" button next to
          // it, and the label promises an action it never performs.
          onClick={() => navigate(lessonPath(lesson), { state: { openSheet: 'reschedule' } })}
        >
          <Icon name="swap_horiz" size={20} />
        </button>
        <button
          type="button"
          className={styles['iconBtn']}
          aria-label={m.detail_open_lesson()}
          onClick={() => navigate(lessonPath(lesson))}
        >
          <Icon name="more_horiz" size={20} />
        </button>
      </div>
    </div>
  );
}
