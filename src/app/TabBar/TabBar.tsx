import { NavLink } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { Icon } from '@/shared/ui';
import type { IconName } from '@/shared/ui';
import { cx } from '@/shared/lib';
import styles from './TabBar.module.scss';

const tabs: { to: string; label: () => string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: m.schedule, icon: 'calendar', end: true },
  { to: '/students', label: m.students, icon: 'users' },
  { to: '/reports', label: m.reports, icon: 'barChart' },
  { to: '/profile', label: m.profile, icon: 'user' },
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
          <span className={styles['tab-bar__icon']}>
            <Icon name={tab.icon} size={26} />
          </span>
          <span className={styles['tab-bar__label']}>{tab.label()}</span>
        </NavLink>
      ))}
    </nav>
  );
}
