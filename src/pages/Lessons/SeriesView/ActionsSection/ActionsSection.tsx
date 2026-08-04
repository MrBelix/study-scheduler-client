import { m } from '@/paraglide/messages';
import { Section, Cell, Tile } from '@/shared/ui';
import styles from './ActionsSection.module.scss';

// Divider inset for the 30px icon-tile settings rows: 16 (gutter) + 30 (icon)
// + 12 (gap) — see design-system.html "SectionLabel + Card + Row".
const ROW_INSET = 58;

interface ActionsSectionProps {
  /** The series' display name, for the consequence caption below the cancel row. */
  seriesLabel: string;
  /** Whether the series can still be ended/cancelled — `isSeriesCancellable`. */
  cancellable: boolean;
  onEdit: () => void;
  onEnd: () => void;
  onCancel: () => void;
}

/** "ЩО МОЖНА ЗРОБИТИ" — see design-system.html F6b lines 916-943. */
export function ActionsSection({ seriesLabel, cancellable, onEdit, onEnd, onCancel }: ActionsSectionProps) {
  return (
    <Section
      header={m.series_view_actions_header()}
      footer={cancellable ? m.series_view_actions_caption({ title: seriesLabel }) : undefined}
    >
      <Cell
        leading={<Tile tone="accent" icon="edit_calendar" />}
        inset={ROW_INSET}
        title={m.series_view_action_edit_title()}
        subtitle={m.series_view_action_edit_sub()}
        plainTitle
        chevron
        onClick={onEdit}
      />
      {cancellable && (
        <>
          <Cell
            leading={<Tile tone="neutral" icon="event_busy" />}
            inset={ROW_INSET}
            title={m.series_view_action_end_title()}
            subtitle={m.series_view_action_end_sub()}
            plainTitle
            chevron
            onClick={onEnd}
          />
          <Cell
            leading={<Tile tone="danger" icon="delete_forever" />}
            inset={ROW_INSET}
            title={<span className={styles.danger}>{m.series_view_action_cancel_title()}</span>}
            onClick={onCancel}
          />
        </>
      )}
    </Section>
  );
}
