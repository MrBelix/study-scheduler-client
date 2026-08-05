import { m } from '@/paraglide/messages';
import { Icon } from '@/shared/ui';
import styles from './ReconnectBotBanner.module.scss';

/** Warn-tinted strip shown when the notifications bot got disconnected (design-system.html "HeroCard" warn strip). */
export function ReconnectBotBanner({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className={styles['banner']} onClick={onClick}>
      <Icon name="notifications_off" filled size={20} className={styles['banner__icon']} />
      <span className={styles['banner__text']}>
        <span className={styles['banner__title']}>{m.profile_bot_disconnected()}</span>
        <span className={styles['banner__desc']}>{m.profile_bot_reconnect()}</span>
        <span className={styles['banner__action']}>{m.profile_bot_reconnect_action()}</span>
      </span>
      <Icon name="chevron_right" size={20} className={styles['banner__chevron']} />
    </button>
  );
}
