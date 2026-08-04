import { Icon } from '../Icon/Icon';
import type { IconName } from '../Icon/icons';
import { cx } from '../../lib/cx';
import styles from './Tile.module.scss';

type TileTone = 'muted' | 'accent' | 'danger' | 'accent-soft' | 'danger-soft' | 'purple' | 'ok' | 'neutral';

// 34px/lg-radius tones read as "large" (size-19 glyph); the 30px/sm-radius
// tones read as "small" (size-18 glyph) — see design-system.html "SectionLabel
// + Card + Row". Filled (FILL 1) is independent of size: e.g. the settings-row
// "neutral" tone (F10 "Версія") is small but unfilled.
const LARGE_TONES: TileTone[] = ['muted', 'accent-soft', 'danger-soft'];
const UNFILLED_TONES: TileTone[] = ['muted', 'accent-soft', 'danger-soft', 'neutral'];

/**
 * Colored icon square for a Cell's `leading` slot — see design-system.html
 * "SectionLabel + Card + Row". Shared by settings rows, empty states and
 * series cards across the app.
 */
export function Tile({ tone, icon }: { tone: TileTone; icon: IconName }) {
  const large = LARGE_TONES.includes(tone);
  return (
    <span className={cx(styles['tile'], styles[`tile--${tone}`])}>
      <Icon name={icon} size={large ? 19 : 18} filled={!UNFILLED_TONES.includes(tone)} />
    </span>
  );
}
