import { useState } from 'react';
import { Section } from '../../shared/ui/Section/Section';
import { Cell } from '../../shared/ui/Cell/Cell';
import styles from './StudentsPage.module.scss';

const AVATAR_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#DDA0DD', '#F7B731', '#78C8C8'];

function avatar(name: string) {
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className={styles.avatar} style={{ backgroundColor: color }}>
      {name[0]}
    </div>
  );
}

const GROUPS: Record<string, { name: string; attendance: number }[]> = {
  'Група 1-А': [
    { name: 'Бондаренко Олексій', attendance: 92 },
    { name: 'Іванченко Марія', attendance: 85 },
    { name: 'Коваль Дмитро', attendance: 78 },
    { name: 'Литвин Анна', attendance: 96 },
    { name: 'Мельник Сергій', attendance: 67 },
  ],
  'Група 1-Б': [
    { name: 'Назаренко Вікторія', attendance: 88 },
    { name: 'Олексієнко Павло', attendance: 91 },
    { name: 'Петренко Тетяна', attendance: 73 },
    { name: 'Романенко Ігор', attendance: 82 },
  ],
  'Група 2-А': [
    { name: 'Семенченко Ольга', attendance: 95 },
    { name: 'Тимченко Максим', attendance: 60 },
    { name: 'Харченко Юлія', attendance: 89 },
    { name: 'Шевченко Андрій', attendance: 77 },
  ],
};

function AttendanceBadge({ value }: { value: number }) {
  const color = value >= 90 ? '#34C759' : value >= 75 ? '#FF9500' : '#FF3B30';
  return <span className={styles.badge} style={{ color }}>{value}%</span>;
}

export function StudentsPage() {
  const [query, setQuery] = useState('');

  const filtered = Object.entries(GROUPS).reduce<typeof GROUPS>((acc, [group, students]) => {
    const matched = students.filter((s) =>
      s.name.toLowerCase().includes(query.toLowerCase()),
    );
    if (matched.length > 0) acc[group] = matched;
    return acc;
  }, {});

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Студенти</h1>
      </div>

      <div className={styles.searchWrap}>
        <div className={styles.searchBar}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.74 10.33a6.5 6.5 0 10-1.41 1.41l3.47 3.46 1.41-1.41-3.47-3.46zm-5.24.67a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
          </svg>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Пошук"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {Object.entries(filtered).map(([group, students]) => (
        <Section key={group} header={group}>
          {students.map((student) => (
            <Cell
              key={student.name}
              before={avatar(student.name)}
              title={student.name}
              subtitle={`Відвідуваність: ${student.attendance}%`}
              after={<AttendanceBadge value={student.attendance} />}
              onClick={() => {}}
            />
          ))}
        </Section>
      ))}

      {Object.keys(filtered).length === 0 && (
        <div className={styles.empty}>Студентів не знайдено</div>
      )}
    </div>
  );
}
