import { m } from '@/paraglide/messages';
import { Section, Cell, Tile } from '@/shared/ui';

interface StudentActionsCardProps {
  archived: boolean;
  onEdit: () => void;
  onToggleArchive: () => void;
}

/**
 * "Редагувати" + archive/unarchive settings rows. The divider between the two
 * rows insets to the text edge (16 + 30 icon + 12 gap), per the settings-row
 * etalon (design-system.html "SectionLabel + Card + Row").
 */
export function StudentActionsCard({ archived, onEdit, onToggleArchive }: StudentActionsCardProps) {
  return (
    <Section>
      <Cell leading={<Tile tone="accent" icon="edit" />} title={m.edit()} chevron inset={58} onClick={onEdit} />
      <Cell
        leading={<Tile tone={archived ? 'accent' : 'danger'} icon={archived ? 'unarchive' : 'archive'} />}
        title={archived ? m.detail_unarchive() : m.detail_archive_action()}
        onClick={onToggleArchive}
      />
    </Section>
  );
}
