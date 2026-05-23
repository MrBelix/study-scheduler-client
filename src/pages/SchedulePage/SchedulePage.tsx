import { useState } from 'react';
import { Section } from '../../shared/ui/Section/Section';
import { Cell } from '../../shared/ui/Cell/Cell';
import styles from './SchedulePage.module.scss';

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

const SCHEDULE: Record<number, { time: string; subject: string; info: string }[]> = {
  0: [
    { time: '08:00', subject: 'Математичний аналіз', info: 'Гр. 1-А · Ауд. 302' },
    { time: '09:45', subject: 'Лінійна алгебра', info: 'Гр. 2-Б · Ауд. 215' },
    { time: '11:30', subject: 'Математичний аналіз', info: 'Гр. 1-Б · Ауд. 302' },
  ],
  1: [
    { time: '08:00', subject: 'Дискретна математика', info: 'Гр. 3-А · Ауд. 110' },
    { time: '11:30', subject: 'Лінійна алгебра', info: 'Гр. 1-А · Ауд. 215' },
    { time: '13:15', subject: 'Теорія ймовірностей', info: 'Гр. 2-А · Ауд. 401' },
  ],
  2: [
    { time: '09:45', subject: 'Математичний аналіз', info: 'Гр. 2-А · Ауд. 302' },
    { time: '13:15', subject: 'Дискретна математика', info: 'Гр. 1-А · Ауд. 110' },
  ],
  3: [
    { time: '08:00', subject: 'Лінійна алгебра', info: 'Гр. 3-Б · Ауд. 215' },
    { time: '09:45', subject: 'Теорія ймовірностей', info: 'Гр. 1-Б · Ауд. 401' },
    { time: '11:30', subject: 'Математичний аналіз', info: 'Гр. 3-А · Ауд. 302' },
    { time: '13:15', subject: 'Дискретна математика', info: 'Гр. 2-Б · Ауд. 110' },
  ],
  4: [
    { time: '08:00', subject: 'Теорія ймовірностей', info: 'Гр. 2-А · Ауд. 401' },
    { time: '11:30', subject: 'Лінійна алгебра', info: 'Гр. 1-А · Ауд. 215' },
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
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Розклад</h1>
      </div>

      <div className={styles.dayRow}>
        {DAYS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`${styles.dayChip} ${i === selectedIdx ? styles.dayActive : ''}`}
            onClick={() => setSelectedIdx(i)}
          >
            <span className={styles.dayLabel}>{label}</span>
            <span className={styles.dayNum}>{weekDays[i].getDate()}</span>
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {lessons.length === 0 ? (
          <div className={styles.empty}>Занять немає</div>
        ) : (
          <Section>
            {lessons.map((lesson) => (
              <Cell
                key={`${lesson.time}-${lesson.subject}`}
                title={lesson.subject}
                subtitle={lesson.info}
                after={<span className={styles.time}>{lesson.time}</span>}
                onClick={() => {}}
              />
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}
