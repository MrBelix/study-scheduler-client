import styles from './Placeholder.module.scss';

interface PlaceholderProps {
  /** Big emoji glyph. */
  glyph: string;
  title: string;
  description?: string;
}

/** Full-height centered empty/placeholder state. */
export function Placeholder({ glyph, title, description }: PlaceholderProps) {
  return (
    <div className={styles.placeholder}>
      <div className={styles['placeholder__glyph']}>{glyph}</div>
      <div className={styles['placeholder__title']}>{title}</div>
      {description && <div className={styles['placeholder__description']}>{description}</div>}
    </div>
  );
}
