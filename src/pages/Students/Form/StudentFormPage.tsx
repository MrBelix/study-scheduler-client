import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { FieldError, Placeholder, Skeleton, useMainButton, showToast } from '@/shared/ui';
import { useBackButton } from '@/shared/tg';
import { cx, parsePrice, apiFormErrors } from '@/shared/lib';
import { routes } from '@/shared/routing';
import type { StudentDetails } from '@/shared/api';
import { useStudentDetails, useCreateStudent, useUpdateStudent } from '@/features/students/queries';
import { NameField } from './NameField/NameField';
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

  const { data: existing, isPending } = useStudentDetails(id);

  useBackButton(() => navigate(-1));

  if (isEdit && isPending) {
    return (
      <div className={styles['form']}>
        <div className={styles['form__group']}>
          <div className={cx(styles['form__row-skeleton'], styles['form__row-skeleton--first'])}>
            <Skeleton circle={44} />
            <div className={styles['form__skeleton-col']}>
              <Skeleton width={50} height={10} />
              <Skeleton width={130} height={16} />
            </div>
          </div>
          <div className={styles['form__divider']} />
          <div className={cx(styles['form__row-skeleton'], styles['form__row-skeleton--last'])}>
            <Skeleton width="100%" height={16} />
          </div>
        </div>
      </div>
    );
  }

  if (isEdit && !existing) {
    return <Placeholder glyph="🔍" title={m.student_not_found()} />;
  }

  return <StudentForm existing={isEdit ? existing : undefined} />;
}

function StudentForm({ existing }: { existing?: StudentDetails }) {
  const navigate = useNavigate();
  const isEdit = Boolean(existing);

  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const mutation = isEdit ? updateStudent : createStudent;

  const [name, setName] = useState(existing?.name ?? '');
  const [rate, setRate] = useState(existing?.rate ? String(existing.rate) : '');

  const trimmed = name.trim();

  // ---- error breakdown of the last save attempt ----
  const { fieldError } = apiFormErrors(mutation.error);
  const rateError = fieldError('Rate');

  // Generic errors aren't tied to one field — surface them as a toast.
  useEffect(() => {
    if (!mutation.error) return;
    const { genericError } = apiFormErrors(mutation.error);
    if (genericError) showToast(genericError);
  }, [mutation.error]);

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
      { onSuccess: () => navigate(routes.students.list()) },
    );
  };

  useMainButton({
    text: isEdit ? m.form_save() : m.students_add(),
    icon: isEdit ? undefined : 'person_add',
    onClick: save,
    enabled: trimmed !== '' && !mutation.isPending,
    loading: mutation.isPending,
  });

  return (
    <div className={styles['form']}>
      <div className={styles['form__group']}>
        <NameField value={name} onChange={setName} error={fieldError('Name')} required />
        <div className={styles['form__divider']} />
        <label className={cx(styles['form__rate-row'], rateError && styles['form__rate-row--error'])}>
          <span className={styles['form__rate-label']}>{m.form_rate_row()}</span>
          <span className={styles['form__rate-value']}>
            <input
              className={styles['form__rate-input']}
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              onFocus={(e) => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' })}
              inputMode="numeric"
              placeholder={m.form_rate_placeholder()}
            />
            <span className={styles['form__rate-suffix']}>₴</span>
          </span>
        </label>
        {rateError && <FieldError message={rateError} />}
      </div>
      <span className={styles['form__footer']}>{m.form_rate_helper()}</span>
    </div>
  );
}
