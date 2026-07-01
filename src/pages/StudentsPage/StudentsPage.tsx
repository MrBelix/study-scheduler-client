import { useState, type FormEvent } from 'react';
import { Section, Cell, SearchInput, avatarColor } from '@/shared/ui';
import { ApiError } from '@/shared/api';
import { useStudents, useCreateStudent } from '@/features/students/queries';
import styles from './StudentsPage.module.scss';

function Avatar({ name }: { name: string }) {
  return (
    <div className={styles['students-page__avatar']} style={{ backgroundColor: avatarColor(name) }}>
      {name[0]}
    </div>
  );
}

export function StudentsPage() {
  const [query, setQuery] = useState('');
  const [name, setName] = useState('');

  const { data, isPending, isError, error } = useStudents();
  const createStudent = useCreateStudent();

  const students = data ?? [];
  const filtered = students.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createStudent.mutate({ name: trimmed }, { onSuccess: () => setName('') });
  };

  return (
    <div className={styles['students-page']}>
      <div className={styles['students-page__header']}>
        <h1 className={styles['students-page__title']}>Студенти</h1>
      </div>

      <form className={styles['students-page__add']} onSubmit={handleAdd}>
        <input
          className={styles['students-page__add-field']}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Імʼя нового студента"
        />
        <button
          type="submit"
          className={styles['students-page__add-btn']}
          disabled={createStudent.isPending || name.trim() === ''}
        >
          Додати
        </button>
      </form>

      <SearchInput value={query} onChange={setQuery} />

      {isPending ? (
        <div className={styles['students-page__status']}>Завантаження…</div>
      ) : isError ? (
        <div className={styles['students-page__status']}>
          {error instanceof ApiError && error.isAuthExpired
            ? 'Сесія застаріла. Відкрийте застосунок знову.'
            : 'Не вдалося завантажити студентів'}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles['students-page__empty']}>
          {students.length === 0 ? 'Ще немає студентів' : 'Студентів не знайдено'}
        </div>
      ) : (
        <Section>
          {filtered.map((student) => (
            <Cell
              key={student.id}
              before={<Avatar name={student.name} />}
              title={student.name}
              onClick={() => {}}
            />
          ))}
        </Section>
      )}
    </div>
  );
}
