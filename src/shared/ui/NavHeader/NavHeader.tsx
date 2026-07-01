import styles from './NavHeader.module.scss';

interface NavHeaderProps {
  title: string;
}

/**
 * Sticky nav header — 52px, header surface, centered title. Back navigation is
 * handled by Telegram's native BackButton (see `useBackButton`), not in-DOM.
 */
export function NavHeader({ title }: NavHeaderProps) {
  return (
    <div className={styles['nav-header']}>
      <div className={styles['nav-header__title']}>{title}</div>
    </div>
  );
}
