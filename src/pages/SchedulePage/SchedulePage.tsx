import { useState } from 'react';
import { Section, Cell } from '@/shared/ui';
import { cx } from '@/shared/lib/cx';
import styles from './SchedulePage.module.scss';

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

const SCHEDULE: Record<number, { time: string; subject: string; student: string }[]> = {
  0: [
    { time: '09:00', subject: 'Математика', student: 'Максим Петренко' },
    { time: '11:00', subject: 'Англійська', student: 'Аліса Коваль' },
    { time: '14:00', subject: 'Фізика', student: 'Дмитро Лисенко' },
  ],
  1: [
    { time: '10:00', subject: 'Математика', student: 'Юлія Бондаренко' },
    { time: '13:00', subject: 'Хімія', student: 'Олег Мазуренко' },
  ],
  2: [
    { time: '09:00', subject: 'Математика', student: 'Максим Петренко' },
    { time: '11:30', subject: 'Англійська', student: 'Соня Яценко' },
    { time: '15:00', subject: 'Англійська', student: 'Аліса Коваль' },
  ],
  3: [
    { time: '10:00', subject: 'Фізика', student: 'Дмитро Лисенко' },
    { time: '13:00', subject: 'Математика', student: 'Юлія Бондаренко' },
  ],
  4: [
    { time: '09:00', subject: 'Хімія', student: 'Олег Мазуренко' },
    { time: '11:00', subject: 'Математика', student: 'Максим Петренко' },
    { time: '14:00', subject: 'Англійська', student: 'Соня Яценко' },
  ],
  5: [],
  6: [],
};

function getWeekDays() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getJsWeekday(date: Date) {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

export function SchedulePage() {
  const weekDays = getWeekDays();
  const todayIdx = getJsWeekday(new Date());
  const [selectedIdx, setSelectedIdx] = useState(todayIdx);

  const lessons = SCHEDULE[selectedIdx] ?? [];

  return (
    <div className={styles['schedule-page']}>
      <div className={styles['schedule-page__header']}>
        <h1 className={styles['schedule-page__title']}>Розклад</h1>
      </div>

      <div className={styles['schedule-page__day-row']}>
        {DAYS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={cx(
              styles['schedule-page__day-chip'],
              i === selectedIdx && styles['schedule-page__day-chip--active'],
            )}
            onClick={() => setSelectedIdx(i)}
          >
            <span className={styles['schedule-page__day-label']}>{label}</span>
            <span className={styles['schedule-page__day-num']}>{weekDays[i].getDate()}</span>
          </button>
        ))}
      </div>

      <div className={styles['schedule-page__list']}>
        {lessons.length === 0 ? (
          <div className={styles['schedule-page__empty']}>Занять немає</div>
        ) : (
          <Section>
            {lessons.map((lesson) => (
              <Cell
                key={`${lesson.time}-${lesson.student}`}
                title={lesson.subject}
                subtitle={lesson.student}
                after={<span className={styles['schedule-page__time']}>{lesson.time}</span>}
                onClick={() => {}}
              />
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}
