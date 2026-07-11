import { m } from '@/paraglide/messages';
import { Cell, Avatar, BottomSheet } from '@/shared/ui';
import { haptic } from '@/shared/tg';
import type { Student } from '@/shared/api';
import styles from './StudentPickerField.module.scss';

interface StudentPickerFieldProps {
  /** Full student list — the sheet offers the active ones. */
  students: Student[];
  value: string;
  onChange: (id: string) => void;
  /**
   * Render the selection as a static card — for forms opened from a student's
   * page, where changing the student makes no sense.
   */
  locked?: boolean;
  error?: string;
  /** Sheet visibility is lifted so the page's BackButton can close it first. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Labeled student field: a Cell-style trigger opening a bottom-sheet list. */
export function StudentPickerField({ students, value, onChange, locked, error, open, onOpenChange }: StudentPickerFieldProps) {
  const selected = students.find((s) => s.id === value);
  const options = students.filter((s) => s.status !== 'Archived');

  return (
    <div className={styles['picker']}>
      <span className={styles['picker__label']}>{m.lesson_form_student()}</span>
      <div className={styles['picker__trigger']}>
        {selected ? (
          <Cell
            leading={<Avatar name={selected.name} size={32} />}
            title={selected.name}
            chevron={!locked}
            inset={60}
            minHeight={52}
            onClick={locked ? undefined : () => onOpenChange(true)}
          />
        ) : (
          <Cell
            title={<span className={styles['picker__placeholder']}>{m.lesson_form_student_placeholder()}</span>}
            chevron
            minHeight={52}
            onClick={() => onOpenChange(true)}
          />
        )}
      </div>
      {error && <span className={styles['picker__error']}>{error}</span>}

      {open && !locked && (
        <BottomSheet title={m.lesson_form_student_placeholder()} onClose={() => onOpenChange(false)}>
          <div className={styles['picker__sheet-list']}>
            {options.map((s) => (
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
