import { useState } from 'react';
import { Section } from '../../shared/ui/Section/Section';
import { Cell } from '../../shared/ui/Cell/Cell';
import { SearchInput } from '../../shared/ui/Inputs/SearchInput/SearchInput';
import styles from './StudentsPage.module.scss';

const AVATAR_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#DDA0DD', '#F7B731', '#78C8C8'];

const STUDENTS = [
  { name: 'Максим Петренко', subject: 'Математика', lessons: 12, progress: 85 },
  { name: 'Аліса Коваль', subject: 'Англійська мова', lessons: 8, progress: 92 },
  { name: 'Дмитро Лисенко', subject: 'Фізика', lessons: 6, progress: 78 },
  { name: 'Юлія Бондаренко', subject: 'Математика', lessons: 10, progress: 88 },
  { name: 'Олег Мазуренко', subject: 'Хімія', lessons: 5, progress: 67 },
  { name: 'Соня Яценко', subject: 'Англійська мова', lessons: 14, progress: 95 },
];

function Avatar({ name }: { name: string }) {
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className={styles['students-page__avatar']} style={{ backgroundColor: color }}>
      {name[0]}
    </div>
  );
}

function ProgressBadge({ value }: { value: number }) {
  const color = value >= 90 ? '#34C759' : value >= 75 ? '#FF9500' : '#FF3B30';
  return <span className={styles['students-page__badge']} style={{ color }}>{value}%</span>;
}

export function StudentsPage() {
  const [query, setQuery] = useState('');

  const filtered = STUDENTS.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.subject.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className={styles['students-page']}>
      <div className={styles['students-page__header']}>
        <h1 className={styles['students-page__title']}>Студенти</h1>
      </div>

      <SearchInput value={query} onChange={setQuery} />

      {filtered.length > 0 ? (
        <Section>
          {filtered.map((student) => (
            <Cell
              key={student.name}
              before={<Avatar name={student.name} />}
              title={student.name}
              subtitle={`${student.subject} · ${student.lessons} занять`}
              after={<ProgressBadge value={student.progress} />}
              onClick={() => {}}
            />
          ))}
        </Section>
      ) : (
        <div className={styles['students-page__empty']}>Студентів не знайдено</div>
      )}
    </div>
  );
}
