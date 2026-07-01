import styles from './TextField.module.scss';

interface TextFieldProps {
  header: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helper?: string;
  inputMode?: 'text' | 'numeric';
}

/** Labeled input on a section surface, with optional helper text below. */
export function TextField({ header, value, onChange, placeholder, helper, inputMode = 'text' }: TextFieldProps) {
  return (
    <label className={styles['text-field']}>
      <span className={styles['text-field__header']}>{header}</span>
      <input
        className={styles['text-field__input']}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
      />
      {helper && <span className={styles['text-field__helper']}>{helper}</span>}
    </label>
  );
}
