import { useEffect, useState } from 'react';
import { m } from '@/paraglide/messages';
import { Icon, Button, showToast } from '@/shared/ui';
import { useBackButton } from '@/shared/tg';
import { NameField } from '@/pages/Students/Form/NameField/NameField';
import { parsePrice } from '@/shared/lib';
import { useCreateStudent, useUpdateStudent } from '@/features/students/queries';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { StepHeading } from '../StepHeading/StepHeading';
import { StepActions } from '../StepActions/StepActions';
import styles from './FirstStudentStep.module.scss';

interface OnboardingStudent {
  id: string;
  name: string;
  rate: number;
}

interface FirstStudentStepProps {
  /** Set when re-entering this step via the back button from O4 — switches the step into PATCH (update) mode so "Далі" doesn't create a duplicate student. */
  initialStudent: OnboardingStudent | null;
  onSaved: (student: OnboardingStudent) => void;
  onSkip: () => void;
  onBack: () => void;
}

/**
 * O3 — first student: only the name is required, a rate is optional (reuses
 * the Students form's NameField + grouped-card rate row — design-system.html
 * O3 "Онбординг — перший студент").
 */
export function FirstStudentStep({ initialStudent, onSaved, onSkip, onBack }: FirstStudentStepProps) {
  const [name, setName] = useState(initialStudent?.name ?? '');
  const [rate, setRate] = useState(initialStudent ? String(initialStudent.rate) : '');
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const mutation = initialStudent ? updateStudent : createStudent;

  useBackButton(onBack);

  useEffect(() => {
    if (mutation.isError) showToast(m.form_error_save());
  }, [mutation.isError]);

  const trimmed = name.trim();
  const save = () => {
    if (!trimmed || mutation.isPending) return;
    const rateValue = parsePrice(rate) ?? 0;
    if (initialStudent) {
      updateStudent.mutate(
        { id: initialStudent.id, body: { name: trimmed, rate: rateValue } },
        { onSuccess: (updated) => onSaved({ id: updated.id, name: updated.name, rate: updated.rate }) },
      );
      return;
    }
    createStudent.mutate(
      { name: trimmed, rate: rateValue },
      { onSuccess: (created) => onSaved({ id: created.id, name: created.name, rate: created.rate }) },
    );
  };

  return (
    <div className={styles.step}>
      <div className={styles.scroll}>
        <ProgressBar step={2} total={4} />
        <StepHeading title={m.onboarding_student_title()} subtitle={m.onboarding_student_subtitle()} />

        <div className={styles.group}>
          <NameField value={name} onChange={setName} required />
          <div className={styles.divider} />
          <label className={styles.rateRow}>
            <span className={styles.rateLabel}>{m.form_rate_row()}</span>
            <span className={styles.rateValue}>
              <input
                className={styles.rateInput}
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                onFocus={(e) => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' })}
                inputMode="numeric"
                placeholder={m.form_rate_placeholder()}
              />
              <span className={styles.rateSuffix}>₴</span>
            </span>
          </label>
        </div>

        <div className={styles.hint}>
          <Icon name="info" filled size={20} className={styles.hintIcon} />
          <span className={styles.hintText}>{m.onboarding_student_hint()}</span>
        </div>
      </div>

      <StepActions>
        <Button fullWidth onClick={save} disabled={!trimmed} loading={mutation.isPending}>
          {m.onboarding_continue()}
        </Button>
        {!initialStudent && (
          <Button variant="ghost" fullWidth onClick={onSkip}>
            {m.onboarding_student_skip()}
          </Button>
        )}
      </StepActions>
    </div>
  );
}
