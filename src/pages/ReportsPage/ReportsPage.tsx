import { Section } from '../../shared/ui/Section/Section';
import { Cell } from '../../shared/ui/Cell/Cell';
import styles from './ReportsPage.module.scss';

const SUBJECTS = [
  { name: 'Математика', students: 2, sessions: 22, avgProgress: 87 },
  { name: 'Англійська мова', students: 2, sessions: 22, avgProgress: 94 },
  { name: 'Фізика', students: 1, sessions: 6, avgProgress: 78 },
  { name: 'Хімія', students: 1, sessions: 5, avgProgress: 67 },
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

const totalStudents = new Set(SUBJECTS.flatMap((s) => Array(s.students).fill(s.name))).size;
const totalSessions = SUBJECTS.reduce((sum, s) => sum + s.sessions, 0);

export function ReportsPage() {
  return (
    <div className={styles['reports-page']}>
      <div className={styles['reports-page__header']}>
        <h1 className={styles['reports-page__title']}>Звіти</h1>
      </div>

      <Section header="Загалом">
        <Cell
          before={<PersonIcon />}
          title="Студентів"
          subtitle="Загальна кількість"
          after={<span className={styles['reports-page__stat']}>{totalStudents}</span>}
        />
        <Cell
          before={<BarIcon />}
          title="Занять цього місяця"
          subtitle="По всіх предметах"
          after={<span className={styles['reports-page__stat']}>{totalSessions}</span>}
        />
      </Section>

      <Section header="По предметах">
        {SUBJECTS.map((subject) => (
          <Cell
            key={subject.name}
            title={subject.name}
            subtitle={`${subject.students} студ. · ${subject.sessions} занять`}
            after={
              <span
                className={styles['reports-page__grade']}
                style={{
                  color:
                    subject.avgProgress >= 85
                      ? '#34C759'
                      : subject.avgProgress >= 75
                        ? '#FF9500'
                        : '#FF3B30',
                }}
              >
                {subject.avgProgress}%
              </span>
            }
            onClick={() => {}}
          />
        ))}
      </Section>
    </div>
  );
}
