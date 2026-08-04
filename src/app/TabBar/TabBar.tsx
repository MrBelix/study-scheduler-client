import { NavLink } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Icon } from '@/shared/ui';
import type { IconName } from '@/shared/ui';
import { cx } from '@/shared/lib';
import { routes } from '@/shared/routing';
import styles from './TabBar.module.scss';

const tabs: { to: string; label: () => string; icon: IconName; end?: boolean }[] = [
  { to: routes.schedule(), label: m.schedule, icon: 'calendar_month', end: true },
  { to: routes.students.list(), label: m.students, icon: 'group' },
  { to: routes.reports(), label: m.nav_money, icon: 'account_balance_wallet' },
  { to: routes.profile(), label: m.profile, icon: 'person' },
];

export function TabBar() {
  return (
    <nav className={styles['tab-bar']}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            cx(styles['tab-bar__tab'], isActive && styles['tab-bar__tab--active'])
          }
        >
          {({ isActive }) => (
            <>
              <span className={styles['tab-bar__icon']}>
                <Icon name={tab.icon} size={24} filled={isActive} />
              </span>
              <span className={styles['tab-bar__label']}>{tab.label()}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
