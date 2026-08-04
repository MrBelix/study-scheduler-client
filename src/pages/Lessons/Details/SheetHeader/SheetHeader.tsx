import styles from './SheetHeader.module.scss';

interface SheetHeaderProps {
  title: string;
  hint?: string;
}

/**
 * Centered 20/700 title (+ optional hint line) shared by every sheet on this
 * page — `CancelSheet` built the style first; `RescheduleSheet`/`EditLessonSheet`
 * used to fall back to `BottomSheet`'s own smaller 16/600 `title` prop instead,
 * which read as visually inconsistent across the three. Rendered as the
 * sheet's first child alongside a plain `<BottomSheet onClose={...}>` (no
 * `title` prop), same as `CancelSheet` already did.
 */
export function SheetHeader({ title, hint }: SheetHeaderProps) {
  return (
    <div className={styles.head}>
      <span className={styles.title}>{title}</span>
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
