import { m } from '@/paraglide/messages';
import { SectionLabel, Icon, FieldError } from '@/shared/ui';
import { cx } from '@/shared/lib';
import styles from './PriceTopicCard.module.scss';

interface PriceTopicCardProps {
  price: string;
  onPriceChange: (value: string) => void;
  /** The student's rate — placeholder when `price` is left blank, and the source of the "ставка" hint. */
  studentRate?: number;
  priceError?: string;
  topic: string;
  onTopicChange: (value: string) => void;
  topicError?: string;
}

/** "ЦІНА ТА ТЕМА" — see design-system.html F8 lines 1132-1146. */
export function PriceTopicCard({ price, onPriceChange, studentRate, priceError, topic, onTopicChange, topicError }: PriceTopicCardProps) {
  return (
    <div className={styles.section}>
      <SectionLabel>{m.lesson_form_section_price_topic()}</SectionLabel>
      <div className={styles.card}>
        <label className={cx(styles.priceRow, priceError && styles['priceRow--error'])}>
          <span className={styles.priceLabel}>{m.lesson_form_price()}</span>
          <input
            className={styles.priceInput}
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            onFocus={(e) => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' })}
            inputMode="numeric"
            placeholder={studentRate ? String(studentRate) : '0'}
          />
          <span className={styles.priceSuffix}>₴</span>
          {price === '' && Boolean(studentRate) && <span className={styles.priceHint}>{m.lesson_form_price_rate_hint()}</span>}
        </label>
        <div className={styles.divider} />
        <label className={cx(styles.topicRow, topicError && styles['topicRow--error'])}>
          <input
            className={styles.topicInput}
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            onFocus={(e) => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' })}
            placeholder={m.lesson_form_topic_placeholder()}
          />
          <Icon name="edit" size={19} className={styles.topicIcon} />
        </label>
      </div>
      {priceError && <FieldError message={priceError} />}
      {topicError && <FieldError message={topicError} />}
    </div>
  );
}
