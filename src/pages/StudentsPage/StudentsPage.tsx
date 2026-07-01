import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavHeader, Section, Cell, Avatar, SearchInput, SegmentedControl } from '@/shared/ui';
import type { SegmentItem } from '@/shared/ui';
import { ApiError } from '@/shared/api';
import { useMainButton } from '@/shared/tg';
import { useStudents } from '@/features/students/queries';
import { balanceText, balanceColor, studentSubtitle, deriveFinance } from '@/features/students/model';
import styles from './StudentsPage.module.scss';

type Filter = 'active' | 'archived';

function SkeletonList() {
  return (
    <Section>
      {Array.from({ length: 6 }, (_, i) => (
        <Cell
          key={i}
          inset={70}
          minHeight={60}
          leading={<span className={styles['students-page__skeleton-avatar']} />}
          title={<span className={styles['students-page__skeleton-line']} />}
          subtitle={<span className={styles['students-page__skeleton-line']} data-short />}
        />
      ))}
    </Section>
  );
}

export function StudentsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('active');

  const { data, isPending, isError, error } = useStudents();

  useMainButton({ text: 'Додати студента', onClick: () => navigate('/students/new') });

  const students = data ?? [];
  const activeCount = students.filter((s) => s.status !== 'Archived').length;
  const archCount = students.filter((s) => s.status === 'Archived').length;
  const debtors = students.filter((s) => s.status !== 'Archived' && deriveFinance(s).balance < 0).length;

  const q = query.trim().toLowerCase();
  const base = students.filter((s) => (filter === 'archived' ? s.status === 'Archived' : s.status !== 'Archived'));
  const filtered = q ? base.filter((s) => s.name.toLowerCase().includes(q)) : base;

  const segItems: SegmentItem<Filter>[] = [
    { label: `Активні · ${activeCount}`, value: 'active' },
    { label: `Архів · ${archCount}`, value: 'archived' },
  ];

  const listHeader = q
    ? 'Результати'
    : filter === 'archived'
      ? `${archCount} в архіві`
      : `${activeCount} студентів · ${debtors} з боргом`;
  const listFooter =
    filter === 'archived'
      ? 'Заархівовані студенти приховані зі списку та звітів.'
      : 'Торкніться картки, щоб відкрити профіль і фінанси.';
  const noResultsText = q ? 'Нікого не знайдено' : filter === 'archived' ? 'Архів порожній' : 'Ще немає студентів';

  return (
    <div className={styles['students-page']}>
      <NavHeader title="Студенти" />

      <div className={styles['students-page__body']}>
        <SearchInput value={query} onChange={setQuery} />
        <div className={styles['students-page__segment']}>
          <SegmentedControl items={segItems} value={filter} onChange={setFilter} />
        </div>

        {isError ? (
          <div className={styles['students-page__status']}>
            {error instanceof ApiError && error.isAuthExpired
              ? 'Сесія застаріла — відкрийте застосунок знову'
              : 'Не вдалося завантажити'}
          </div>
        ) : isPending ? (
          <SkeletonList />
        ) : (
          <>
            <div className={styles['students-page__list-header']}>{listHeader}</div>
            {filtered.length === 0 ? (
              <div className={styles['students-page__status']}>{noResultsText}</div>
            ) : (
              <Section>
                {filtered.map((student) => {
                  const sub = studentSubtitle(student);
                  const { balance } = deriveFinance(student);
                  return (
                    <Cell
                      key={student.id}
                      leading={<Avatar name={student.name} size={42} />}
                      title={student.name}
                      subtitle={sub.text}
                      subtitleMuted={sub.muted}
                      value={balanceText(balance)}
                      valueColor={balanceColor(balance)}
                      chevron
                      inset={70}
                      minHeight={60}
                      dimmed={filter === 'archived'}
                      onClick={() => navigate(`/students/${student.id}`)}
                    />
                  );
                })}
              </Section>
            )}
            <div className={styles['students-page__footer']}>{listFooter}</div>
          </>
        )}
      </div>
    </div>
  );
}
