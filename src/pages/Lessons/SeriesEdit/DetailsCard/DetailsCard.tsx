import { useState } from 'react';
import { m } from '@/paraglide/messages';
import { SectionLabel, Icon, FieldError } from '@/shared/ui';
import { cx, formatDate } from '@/shared/lib';
import styles from './DetailsCard.module.scss';

interface DetailsCardProps {
  title: string;
  onTitleChange: (value: string) => void;
  titleError?: string;
  price: string;
  onPriceChange: (value: string) => void;
  priceError?: string;
  endDate: string;
  onEndDateChange: (value: string) => void;
  /** The series' own start date — it can't end before it started. */
  minEndDate: string;
  endDateError?: string;
}

/** "Назва", "Ціна" and "Закінчити" rows — adapted from F8's `RepeatSection` card+row pattern. */
export function DetailsCard({
  title,
  onTitleChange,
  titleError,
  price,
  onPriceChange,
  priceError,
  endDate,
  onEndDateChange,
  minEndDate,
  endDateError,
}: DetailsCardProps) {
  const [endDateOpen, setEndDateOpen] = useState(Boolean(endDate));

  return (
    <div className={styles.section}>
      <SectionLabel>{m.series_edit_details_header()}</SectionLabel>
      <div className={styles.card}>
        <label className={cx(styles.row, titleError && styles['row--error'])}>
          <span className={styles.rowLabel}>{m.lesson_form_title()}</span>
          <input
            className={styles.rowInput}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onFocus={(e) => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' })}
            placeholder={m.lesson_form_title_placeholder()}
          />
        </label>
        <div className={styles.divider} />
        <label className={cx(styles.row, priceError && styles['row--error'])}>
          <span className={styles.rowLabel}>{m.lesson_form_price()}</span>
          <input
            className={styles.rowInput}
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            onFocus={(e) => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' })}
            inputMode="numeric"
            placeholder="0"
          />
        </label>
        <div className={styles.divider} />
        <button type="button" className={styles.row} onClick={() => setEndDateOpen((o) => !o)}>
          <span className={styles.rowLabel}>{m.lesson_form_end_row()}</span>
          <span className={styles.rowValue}>{endDate ? formatDate(endDate) : m.lesson_form_end_none()}</span>
          <Icon name="chevron_right" size={20} className={styles.rowChevron} />
        </button>
      </div>
      {titleError && <FieldError message={titleError} />}
      {priceError && <FieldError message={priceError} />}
      {endDateOpen && (
        <div className={styles.endEditor}>
          <input
            type="date"
            className={styles.endInput}
            value={endDate}
            min={minEndDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
          {endDate && (
            <button type="button" className={styles.endClear} onClick={() => onEndDateChange('')}>
              {m.lesson_form_end_none()}
            </button>
          )}
        </div>
      )}
      {endDateError && <FieldError message={endDateError} />}
    </div>
  );
}
