import { m } from '@/paraglide/messages';
import { Avatar, FieldError } from '@/shared/ui';
import { cx } from '@/shared/lib';
import styles from './NameField.module.scss';

interface NameFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

/**
 * Name row — top row of the student form's grouped card. The Avatar previews
 * live off the current input (letter + deterministic color), falling back to
 * a neutral filled circle while the name is empty (design-system.html O3
 * "Перший студент").
 */
export function NameField({ value, onChange, error, required }: NameFieldProps) {
  const trimmed = value.trim();

  return (
    <div>
      <label className={cx(styles['name-field'], error && styles['name-field--error'])}>
        {trimmed ? (
          <Avatar name={trimmed} size={44} />
        ) : (
          <span className={styles['name-field__avatar-empty']} aria-hidden="true" />
        )}
        <span className={styles['name-field__col']}>
          <span className={styles['name-field__label']}>
            {m.form_name()}
            {required && <span className={styles['name-field__required']}>*</span>}
          </span>
          <input
            className={styles['name-field__input']}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={(e) => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' })}
            placeholder={m.form_name_placeholder()}
          />
        </span>
      </label>
      {error && <FieldError message={error} />}
    </div>
  );
}
