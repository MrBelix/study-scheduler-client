import { Icon } from '../Icon/Icon';
import styles from './FieldError.module.scss';

interface FieldErrorProps {
  message: string;
}

/** Reason line below an invalid field — error glyph + message (design-system.html "FieldError"). */
export function FieldError({ message }: FieldErrorProps) {
  return (
    <span className={styles['field-error']}>
      <Icon name="error" filled size={16} className={styles['field-error__icon']} />
      {message}
    </span>
  );
}
