import { NavLink } from 'react-router-dom';
import { Icon } from '../Icon/Icon';
import type { IconName } from '../Icon/icons';
import { cx } from '../../lib/cx';
import styles from './TabBar.module.scss';

const tabs: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: 'Розклад', icon: 'calendar', end: true },
  { to: '/students', label: 'Студенти', icon: 'people' },
  { to: '/reports', label: 'Звіти', icon: 'chart' },
  { to: '/profile', label: 'Профіль', icon: 'person' },
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
            <Icon name={tab.icon} />
          </span>
          <span className={styles['tab-bar__label']}>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
