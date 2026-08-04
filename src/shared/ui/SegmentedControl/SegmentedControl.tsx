import { type CSSProperties } from 'react';
import { cx } from '../../lib/cx';
import styles from './SegmentedControl.module.scss';

export interface SegmentItem<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  items: SegmentItem<T>[];
  value: T;
  onChange: (value: T) => void;
}

const GAP = 4;

/** iOS-style segmented control with a sliding selection pill. */
export function SegmentedControl<T extends string>({ items, value, onChange }: SegmentedControlProps<T>) {
  const activeIndex = Math.max(0, items.findIndex((item) => item.value === value));
  const totalGap = (items.length - 1) * GAP;
  const pillStyle = {
    width: `calc((100% - ${3 * 2 + totalGap}px) / ${items.length})`,
    transform: `translateX(calc(${activeIndex * 100}% + ${activeIndex * GAP}px))`,
  } as CSSProperties;

  return (
    <div className={styles.segmented}>
      <span className={styles['segmented__pill']} style={pillStyle} />
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          className={cx(styles['segmented__btn'], item.value === value && styles['segmented__btn--active'])}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
