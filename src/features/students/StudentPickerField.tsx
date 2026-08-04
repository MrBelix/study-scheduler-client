import { m } from '@/paraglide/messages';
import { Cell, Avatar, BottomSheet, SectionLabel, FieldError } from '@/shared/ui';
import { haptic } from '@/shared/tg';
import type { Student } from '@/shared/api';
import { money, cx } from '@/shared/lib';
import styles from './StudentPickerField.module.scss';

interface StudentPickerFieldProps {
  /** Active students — callers source this from `useStudents()`, which only ever returns active ones. */
  students: Student[];
  value: string;
  onChange: (id: string) => void;
  /**
   * Render the selection as a static card — for forms opened from a student's
   * page, where changing the student makes no sense.
   */
  locked?: boolean;
  error?: string;
  /** Mark the field as required with a red asterisk after the label. */
  required?: boolean;
  /** Sheet visibility is lifted so the page's BackButton can close it first. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Labeled student field: a SectionLabel + card trigger opening a bottom-sheet list. */
export function StudentPickerField({ students, value, onChange, locked, error, required, open, onOpenChange }: StudentPickerFieldProps) {
  const selected = students.find((s) => s.id === value);

  return (
    <div className={styles.picker}>
      <SectionLabel>
        {m.lesson_form_student()}
        {required && <span className={styles.required}>*</span>}
      </SectionLabel>
      <div className={cx(styles.trigger, error && styles['trigger--error'])}>
        {selected ? (
          <Cell
            leading={<Avatar name={selected.name} size={36} />}
            title={selected.name}
            subtitle={selected.rate ? money(selected.rate) : undefined}
            chevron={!locked}
            inset={64}
            minHeight={56}
            onClick={locked ? undefined : () => onOpenChange(true)}
          />
        ) : (
          <Cell
            title={<span className={styles.placeholder}>{m.lesson_form_student_placeholder()}</span>}
            chevron
            minHeight={56}
            onClick={() => onOpenChange(true)}
          />
        )}
      </div>
      {error && <FieldError message={error} />}

      {open && !locked && (
        <BottomSheet title={m.lesson_form_student_placeholder()} onClose={() => onOpenChange(false)}>
          <div className={styles['sheet-list']}>
            {students.map((s) => (
              <Cell
                key={s.id}
                leading={<Avatar name={s.name} size={42} />}
                title={s.name}
                value={s.id === value ? '✓' : undefined}
                valueColor="var(--ds-color-accent)"
                inset={70}
                minHeight={56}
                onClick={() => {
                  haptic('light');
                  onChange(s.id);
                  onOpenChange(false);
                }}
              />
            ))}
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
