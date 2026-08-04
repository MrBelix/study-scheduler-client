// Приховано зі сторінки 2026-08-04 на вимогу продукту; повернеться разом із фічею нотаток.
import { m } from '@/paraglide/messages';
import { Section, Icon } from '@/shared/ui';
import styles from './NotesCard.module.scss';

interface NotesCardProps {
  topic: string | null;
  description: string | null;
  onEdit: () => void;
}

/**
 * "ТЕМА ТА НОТАТКИ" card — see design-system.html F2 lines 510-525. Topic and
 * notes both open the same edit sheet (there's a single PATCH for both
 * fields, so a second sheet would just duplicate it).
 *
 * The etalon's leading glyph is `menu_book`, which isn't in the icon registry
 * (and no source SVG for it was available to add it) — `history` stands in
 * for it here; see the task report for this substitution.
 */
export function NotesCard({ topic, description, onEdit }: NotesCardProps) {
  return (
    <Section header={m.lesson_notes_section()}>
      <div className={styles.body}>
        <button type="button" className={styles.topicRow} onClick={onEdit}>
          <Icon name="history" size={19} className={styles.topicIcon} />
          <span className={styles.topicText}>{topic ?? m.value_none()}</span>
          <Icon name="edit" size={19} className={styles.editIcon} />
        </button>
        <div className={styles.sep} />
        <button type="button" className={styles.notes} onClick={onEdit}>
          <span className={description ? styles.notesText : styles.placeholder}>
            {description || m.lesson_notes_placeholder()}
          </span>
        </button>
      </div>
    </Section>
  );
}
