import { cx } from '../../../lib/cx';
import { FieldError } from '../../FieldError/FieldError';
import styles from './TextField.module.scss';

interface TextFieldProps {
  header: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helper?: string;
  /** Validation error — highlights the field border and prints a reason line below. */
  error?: string;
  inputMode?: 'text' | 'numeric';
  /** Native input type — `date`/`time` render the platform picker. */
  type?: 'text' | 'date' | 'time';
  /** Mark the field as required with a red asterisk after the header. */
  required?: boolean;
  /** `min`/`max` for `type="date"` — e.g. a planning-horizon cap. */
  min?: string;
  max?: string;
}

/** Labeled input on its own card surface, stacked label over value, with optional helper text below. */
export function TextField({ header, value, onChange, placeholder, helper, error, inputMode = 'text', type = 'text', required, min, max }: TextFieldProps) {
  return (
    <div className={styles['text-field-wrap']}>
      <label className={cx(styles['text-field'], error && styles['text-field--error'])}>
        <span className={styles['text-field__header']}>
          {header}
          {required && <span className={styles['text-field__required']}>*</span>}
        </span>
        <input
          className={styles['text-field__input']}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' })}
          placeholder={placeholder}
          inputMode={inputMode}
          min={min}
          max={max}
        />
        {helper && <span className={styles['text-field__helper']}>{helper}</span>}
      </label>
      {error && <FieldError message={error} />}
    </div>
  );
}
