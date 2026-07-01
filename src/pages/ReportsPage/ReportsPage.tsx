import { Section, Cell, Icon, statusColor } from '@/shared/ui';
import styles from './ReportsPage.module.scss';

const SUBJECTS = [
  { name: 'Математика', students: 2, sessions: 22, avgProgress: 87 },
  { name: 'Англійська мова', students: 2, sessions: 22, avgProgress: 94 },
  { name: 'Фізика', students: 1, sessions: 6, avgProgress: 78 },
  { name: 'Хімія', students: 1, sessions: 5, avgProgress: 67 },
];

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
          before={<Icon name="people" />}
          title="Студентів"
          subtitle="Загальна кількість"
          after={<span className={styles['reports-page__stat']}>{totalStudents}</span>}
        />
        <Cell
          before={<Icon name="chart" />}
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
                style={{ color: statusColor(subject.avgProgress) }}
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
