import { Icon } from '../../Icon/Icon';
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
        <Icon name="search" size={20} className={styles['search-input__icon']} />
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
