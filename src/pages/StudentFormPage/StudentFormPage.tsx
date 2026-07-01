import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NavHeader, TextField } from '@/shared/ui';
import { useBackButton, useMainButton } from '@/shared/tg';
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
    text: isEdit ? 'Зберегти зміни' : 'Зберегти',
    onClick: save,
    enabled: trimmed !== '' && !createStudent.isPending,
  });

  return (
    <div className={styles['form']}>
      <NavHeader title={isEdit ? 'Редагувати' : 'Новий студент'} />

      <div className={styles['form__fields']}>
        <TextField header="Ім'я" placeholder="Напр., Марія Коваленко" value={name} onChange={setName} />
        <TextField
          header="Ставка за заняття, ₴"
          placeholder="300"
          value={rate}
          onChange={setRate}
          inputMode="numeric"
          helper="Ціна за замовчуванням — підставлятиметься в нові заняття цього студента."
        />
      </div>
    </div>
  );
}
