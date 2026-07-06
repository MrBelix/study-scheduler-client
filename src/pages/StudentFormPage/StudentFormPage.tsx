import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { TextField, Placeholder, useMainButton } from '@/shared/ui';
import { useBackButton } from '@/shared/tg';
import { ApiError } from '@/shared/api';
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
    return <div className={styles['form__status']}>{m.loading()}</div>;
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

  // Server-side failure of the last save attempt. 400 validation messages map
  // to their fields (backend keys are PascalCase DTO properties); anything
  // else surfaces as one generic line under the form.
  const error = mutation.error;
  const fieldErrors = error instanceof ApiError ? error.fields : undefined;
  const fieldError = (key: string) => (fieldErrors?.[key] ?? fieldErrors?.[key.toLowerCase()])?.[0];
  const formError =
    !error || fieldErrors
      ? undefined
      : error instanceof ApiError && error.isAuthExpired
        ? m.error_auth_expired()
        : m.form_error_save();

  const save = () => {
    if (!trimmed) return;
    const rateValue = Number(rate.replace(/\s/g, '').replace(',', '.')) || 0;
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
