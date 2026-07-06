import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Section, Cell, Avatar, Placeholder, SearchInput, SegmentedControl, useMainButton } from '@/shared/ui';
import type { SegmentItem } from '@/shared/ui';
import { ApiError } from '@/shared/api';
import { useStudents } from '@/features/students/queries';
import { useSeriesList } from '@/features/lessons/queries';
import { studentSubjects } from '@/features/lessons/model';
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
  const { data: seriesList } = useSeriesList();

  useMainButton({ text: m.students_add(), onClick: () => navigate('/students/new') });

  const students = data ?? [];

  // First run — no students at all: a search input and filter over an empty
  // list only add noise, so show a single full-height placeholder instead.
  if (!isPending && !isError && students.length === 0) {
    return (
      <Placeholder glyph="🎓" title={m.students_empty()} description={m.students_empty_desc()} />
    );
  }

  const activeCount = students.filter((s) => s.status !== 'Archived').length;
  const archCount = students.filter((s) => s.status === 'Archived').length;
  const debtors = students.filter((s) => s.status !== 'Archived' && deriveFinance(s).balance < 0).length;

  const q = query.trim().toLowerCase();
  const base = students.filter((s) => (filter === 'archived' ? s.status === 'Archived' : s.status !== 'Archived'));
  const filtered = q ? base.filter((s) => s.name.toLowerCase().includes(q)) : base;

  const segItems: SegmentItem<Filter>[] = [
    { label: m.students_filter_active({ count: activeCount }), value: 'active' },
    { label: m.students_filter_archived({ count: archCount }), value: 'archived' },
  ];

  const listHeader = q
    ? m.students_header_search()
    : filter === 'archived'
      ? m.students_header_archived({ count: archCount })
      : m.students_header_active({ count: activeCount, debtors });
  const listFooter =
    filter === 'archived' ? m.students_footer_archived() : m.students_footer_active();
  const noResultsText = q
    ? m.students_empty_search()
    : filter === 'archived'
      ? m.students_empty_archived()
      : m.students_empty();

  return (
    <div className={styles['students-page']}>
      <div className={styles['students-page__body']}>
        <SearchInput value={query} onChange={setQuery} placeholder={m.search_placeholder()} />
        <div className={styles['students-page__segment']}>
          <SegmentedControl items={segItems} value={filter} onChange={setFilter} />
        </div>

        {isError ? (
          <div className={styles['students-page__status']}>
            {error instanceof ApiError && error.isAuthExpired
              ? m.error_auth_expired()
              : m.error_generic()}
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
                  const derived = studentSubjects(seriesList ?? [], student.id).join(', ');
                  const sub = studentSubtitle(student, derived || student.subject);
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
