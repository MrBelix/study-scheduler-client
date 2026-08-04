import { cx } from '../../lib/cx';
import styles from './Switch.module.scss';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/** 51×31 toggle switch — see design-system.html "SectionLabel + Card + Row". */
export function Switch({ checked, onChange, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cx(styles['switch'], checked && styles['switch--checked'])}
      onClick={() => onChange(!checked)}
    >
      <span className={styles['switch__knob']} />
    </button>
  );
}
