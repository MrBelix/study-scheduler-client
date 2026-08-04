import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { SearchInput, EmptyState, useMainButton } from '@/shared/ui';
import { routes } from '@/shared/routing';
import { useStudents, useArchivedStudents } from '@/features/students/queries';
import { StudentListCard } from './StudentListCard';
import { ListSkeleton } from './ListSkeleton';
import { ArchiveFooter } from './ArchiveFooter/ArchiveFooter';
import styles from './StudentsListPage.module.scss';

type View = 'active' | 'archived';

export function StudentsListPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [view, setView] = useState<View>('active');

  const activeQuery = useStudents();
  const archivedQuery = useArchivedStudents();
  // The view just picks which query drives the currently rendered state
  // (skeleton/error/data) — each list is its own endpoint, no client-side
  // status filtering of a combined list.
  const { isPending, isError, refetch } = view === 'archived' ? archivedQuery : activeQuery;

  const activeStudents = [...(activeQuery.data ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  const archivedStudents = [...(archivedQuery.data ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  const bothEmpty = activeStudents.length === 0 && archivedStudents.length === 0;

  useMainButton({
    text: m.students_add(),
    icon: 'person_add',
    onClick: () => navigate(routes.students.new()),
    // The big empty state below carries its own "add student" action — hide
    // the bar there to avoid a duplicate CTA. Every other empty case (active
    // list empty but the archive isn't, search with no matches) keeps it.
    hidden: isPending || isError || bothEmpty,
  });

  const switchToArchived = () => {
    setView('archived');
    setQuery('');
  };
  const switchToActive = () => {
    setView('active');
    setQuery('');
  };

  if (isPending) {
    return (
      <div className={styles['students-page']}>
        <div className={styles['students-page__header']}>
          <span className={styles['students-page__title']}>{m.students()}</span>
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder={m.search_placeholder()} />
        <ListSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles['students-page']}>
        <div className={styles['students-page__header']}>
          <span className={styles['students-page__title']}>{m.students()}</span>
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder={m.search_placeholder()} />
        <EmptyState
          variant="secondary"
          icon="cloud_off"
          tone="warn"
          title={m.error_generic()}
          action={{ label: m.retry(), onClick: () => refetch() }}
        />
      </div>
    );
  }

  if (bothEmpty) {
    return (
      <div className={styles['students-page']}>
        <div className={styles['students-page__header']}>
          <span className={styles['students-page__title']}>{m.students()}</span>
        </div>
        <EmptyState
          icon="group_add"
          title={m.students_empty()}
          description={m.students_empty_desc()}
          action={{ label: m.students_add(), icon: 'person_add', onClick: () => navigate(routes.students.new()) }}
        />
      </div>
    );
  }

  const headerHint =
    view === 'archived'
      ? m.students_header_archived({ count: archivedStudents.length })
      : m.students_header_active({ count: activeStudents.length });

  if (view === 'active' && activeStudents.length === 0) {
    // Active is empty but the archive isn't — offer a way there instead of the big empty state.
    return (
      <div className={styles['students-page']}>
        <div className={styles['students-page__header']}>
          <span className={styles['students-page__title']}>{m.students()}</span>
          <span className={styles['students-page__hint']}>{headerHint}</span>
        </div>
        <EmptyState
          variant="secondary"
          icon="group"
          title={m.students_empty_active()}
          action={{ label: m.students_open_archive(), onClick: switchToArchived }}
        />
      </div>
    );
  }

  const listSource = view === 'archived' ? archivedStudents : activeStudents;
  const q = query.trim().toLowerCase();
  const matched = q ? listSource.filter((s) => s.name.toLowerCase().includes(q)) : listSource;

  // Search-no-results exit: switches to the archive view but keeps the query,
  // so the same name is immediately re-searched there.
  const searchArchive = () => setView('archived');
  const canSearchArchive = view === 'active' && archivedStudents.length > 0;

  return (
    <div className={styles['students-page']}>
      <div className={styles['students-page__header']}>
        <span className={styles['students-page__title']}>{m.students()}</span>
        <span className={styles['students-page__hint']}>{headerHint}</span>
      </div>

      <SearchInput value={query} onChange={setQuery} placeholder={m.search_placeholder()} />

      {matched.length === 0 ? (
        <EmptyState
          variant="secondary"
          icon="search"
          title={m.students_empty_search()}
          description={view === 'active' && archivedStudents.length > 0 ? m.students_search_no_results_desc() : undefined}
          action={canSearchArchive ? { label: m.students_search_archive(), onClick: searchArchive } : undefined}
        />
      ) : (
        <div className={styles['students-page__list']}>
          <StudentListCard students={matched} dimmed={view === 'archived'} />
          <ArchiveFooter
            view={view}
            archivedCount={archivedStudents.length}
            onSwitch={view === 'archived' ? switchToActive : switchToArchived}
          />
        </div>
      )}
    </div>
  );
}
