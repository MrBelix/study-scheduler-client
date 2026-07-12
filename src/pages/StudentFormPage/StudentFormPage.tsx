import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { TextField, Placeholder, Skeleton, useMainButton } from '@/shared/ui';
import { useBackButton } from '@/shared/tg';
import { parsePrice, apiFormErrors } from '@/shared/lib';
import type { Student } from '@/shared/api';
import { useStudent, useCreateStudent, useUpdateStudent } from '@/features/students/queries';
import styles from './StudentFormPage.module.scss';

/**
 * Waits for the student when editing, then mounts the form with seeded state —
 * a later cache refetch must not overwrite what the user is typing, so the
 * fields read `existing` only in their initializers.
 */
export function StudentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: existing, isPending } = useStudent(id);

  useBackButton(() => navigate(-1));

  if (isEdit && isPending) {
    return (
      <div className={styles['form__fields']}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={styles['form__skeleton-field']}>
            <Skeleton width={90} height={10} />
            <Skeleton width="100%" height={44} />
          </div>
        ))}
      </div>
    );
  }

  if (isEdit && !existing) {
    return <Placeholder glyph="🔍" title={m.student_not_found()} />;
  }

  return <StudentForm existing={isEdit ? existing : undefined} />;
}

function StudentForm({ existing }: { existing?: Student }) {
  const navigate = useNavigate();
  const isEdit = Boolean(existing);

  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const mutation = isEdit ? updateStudent : createStudent;

  const [name, setName] = useState(existing?.name ?? '');
  const [rate, setRate] = useState(existing?.rate ? String(existing.rate) : '');

  const trimmed = name.trim();

  // ---- error breakdown of the last save attempt ----
  const { fieldError, genericError: formError } = apiFormErrors(mutation.error);

  const save = () => {
    if (!trimmed) return;
    const rateValue = parsePrice(rate) ?? 0;
    if (existing) {
      updateStudent.mutate(
        { id: existing.id, body: { name: trimmed, rate: rateValue } },
        { onSuccess: () => navigate(-1) },
      );
      return;
    }
    createStudent.mutate(
      { name: trimmed, rate: rateValue },
      { onSuccess: () => navigate('/students') },
    );
  };

  useMainButton({
    text: isEdit ? m.form_save_changes() : m.form_save(),
    onClick: save,
    enabled: trimmed !== '' && !mutation.isPending,
  });

  return (
    <div className={styles['form']}>
      <div className={styles['form__fields']}>
        <TextField
          header={m.form_name()}
          placeholder={m.form_name_placeholder()}
          value={name}
          onChange={setName}
          error={fieldError('Name')}
          required
        />
        <TextField
          header={m.form_rate()}
          placeholder={m.form_rate_placeholder()}
          value={rate}
          onChange={setRate}
          inputMode="numeric"
          helper={m.form_rate_helper()}
          error={fieldError('Rate')}
        />
        {formError && <div className={styles['form__error']}>{formError}</div>}
      </div>
    </div>
  );
}
