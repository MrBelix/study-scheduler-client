import styles from './SearchInput.module.scss';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Пошук' }: SearchInputProps) {
  return (
    <div className={styles['search-input']}>
      <div className={styles['search-input__bar']}>
        <svg className={styles['search-input__icon']} width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11.74 10.33a6.5 6.5 0 10-1.41 1.41l3.47 3.46 1.41-1.41-3.47-3.46zm-5.24.67a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
        </svg>
        <input
          className={styles['search-input__field']}
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
