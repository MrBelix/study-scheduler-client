import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { TextField, useMainButton } from '@/shared/ui';
import { useBackButton } from '@/shared/tg';
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
        <TextField header={m.form_name()} placeholder={m.form_name_placeholder()} value={name} onChange={setName} />
        <TextField
          header={m.form_rate()}
          placeholder={m.form_rate_placeholder()}
          value={rate}
          onChange={setRate}
          inputMode="numeric"
          helper={m.form_rate_helper()}
        />
      </div>
    </div>
  );
}
