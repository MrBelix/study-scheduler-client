import styles from './TextField.module.scss';

interface TextFieldProps {
  header: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helper?: string;
  /** Validation message — replaces the helper and renders in the danger color. */
  error?: string;
  inputMode?: 'text' | 'numeric';
  /** Native input type — `date`/`time` render the platform picker. */
  type?: 'text' | 'date' | 'time';
  /** Mark the field as required with a red asterisk after the header. */
  required?: boolean;
}

/** Labeled input on a section surface, with optional helper text below. */
export function TextField({ header, value, onChange, placeholder, helper, error, inputMode = 'text', type = 'text', required }: TextFieldProps) {
  return (
    <label className={styles['text-field']}>
      <span className={styles['text-field__header']}>
        {header}
        {required && <span className={styles['text-field__required']}>*</span>}
      </span>
      <input
        className={styles['text-field__input']}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
      />
      {error ? (
        <span className={styles['text-field__error']}>{error}</span>
      ) : (
        helper && <span className={styles['text-field__helper']}>{helper}</span>
      )}
    </label>
  );
}
