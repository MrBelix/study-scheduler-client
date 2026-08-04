import { m } from '@/paraglide/messages';
import { Section } from '@/shared/ui';
import type { StudentIncome } from '@/shared/api';
import { money } from '@/shared/lib';
import { buildStudentIncomeBars } from '@/features/reports/model';
import styles from './PerStudentCard.module.scss';

interface PerStudentCardProps {
  perStudent: StudentIncome[];
}

/** "ДОХІД ПО СТУДЕНТАХ" — one bar per student, ordered by income (server-side). */
export function PerStudentCard({ perStudent }: PerStudentCardProps) {
  const bars = buildStudentIncomeBars(perStudent);

  return (
    <Section header={m.reports_perstudent_header()}>
      <div className={styles['card']}>
        {bars.map((b) => (
          <div key={b.studentId} className={styles['row']}>
            <div className={styles['row__top']}>
              <span className={styles['row__name']}>{b.name}</span>
              <span className={styles['row__value']}>{money(b.income)}</span>
            </div>
            <div className={styles['row__bar']}>
              <div
                className={styles['row__fill']}
                style={{
                  width: `${b.widthPct}%`,
                  background: `color-mix(in srgb, var(--ds-color-accent) ${Math.round(b.opacity * 100)}%, transparent)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
