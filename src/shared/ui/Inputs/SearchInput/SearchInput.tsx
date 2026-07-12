import styles from './SearchInput.module.scss';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  return (
    <div className={styles['search-input']}>
      <div className={styles['search-input__bar']}>
        <svg className={styles['search-input__icon']} width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.9" />
          <path d="M20 20l-4.5-4.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
        <input
          className={styles['search-input__field']}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
