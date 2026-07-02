import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { TextField, useMainButton } from '@/shared/ui';
import { useBackButton } from '@/shared/tg';
import { ApiError } from '@/shared/api';
import { useStudent, useCreateStudent } from '@/features/students/queries';
import styles from './StudentFormPage.module.scss';

export function StudentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: existing } = useStudent(id);
  const createStudent = useCreateStudent();

  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  // Seed the fields once the student to edit has loaded from cache.
  useEffect(() => {
    if (isEdit && existing) {
      setName(existing.name);
      setRate(existing.rate ? String(existing.rate) : '');
    }
  }, [isEdit, existing]);

  const trimmed = name.trim();

  // Server-side failure of the last save attempt. 400 validation messages map
  // to their fields (backend keys are PascalCase DTO properties); anything
  // else surfaces as one generic line under the form.
  const error = createStudent.error;
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
    const rateValue = Number(rate.replace(/\s/g, '')) || 0;
    if (isEdit) {
      // TODO: no update endpoint on the backend yet — just return to the list.
      navigate(-1);
      return;
    }
    createStudent.mutate(
      { name: trimmed, rate: rateValue },
      { onSuccess: () => navigate('/students') },
    );
  };

  useBackButton(() => navigate(-1));
  useMainButton({
    text: isEdit ? m.form_save_changes() : m.form_save(),
    onClick: save,
    enabled: trimmed !== '' && !createStudent.isPending,
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
