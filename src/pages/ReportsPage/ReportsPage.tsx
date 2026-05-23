import { Section } from '../../shared/ui/Section/Section';
import { Cell } from '../../shared/ui/Cell/Cell';
import styles from './ReportsPage.module.scss';

const SUBJECTS = [
  { name: 'Математичний аналіз', avg: 4.3, attendance: 84 },
  { name: 'Лінійна алгебра', avg: 3.8, attendance: 79 },
  { name: 'Дискретна математика', avg: 4.1, attendance: 88 },
  { name: 'Теорія ймовірностей', avg: 3.5, attendance: 72 },
];

function BarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

const overallAttendance = Math.round(
  SUBJECTS.reduce((s, sub) => s + sub.attendance, 0) / SUBJECTS.length,
);
const overallAvg = (SUBJECTS.reduce((s, sub) => s + sub.avg, 0) / SUBJECTS.length).toFixed(1);

export function ReportsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Звіти</h1>
      </div>

      <Section header="Загальна статистика">
        <Cell
          before={<PersonIcon />}
          title="Відвідуваність"
          subtitle="Середня по всіх групах"
          after={<span className={styles.stat}>{overallAttendance}%</span>}
        />
        <Cell
          before={<BarIcon />}
          title="Середній бал"
          subtitle="По всіх предметах"
          after={<span className={styles.stat}>{overallAvg}</span>}
        />
      </Section>

      <Section header="По предметах">
        {SUBJECTS.map((subject) => (
          <Cell
            key={subject.name}
            title={subject.name}
            subtitle={`Відвідуваність: ${subject.attendance}%`}
            after={
              <span className={styles.grade} style={{ color: subject.avg >= 4 ? '#34C759' : subject.avg >= 3.5 ? '#FF9500' : '#FF3B30' }}>
                {subject.avg.toFixed(1)}
              </span>
            }
            onClick={() => {}}
          />
        ))}
      </Section>
    </div>
  );
}
