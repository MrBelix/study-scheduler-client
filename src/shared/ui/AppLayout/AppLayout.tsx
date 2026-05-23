import { Outlet } from 'react-router-dom';
import { TabBar } from '../TabBar/TabBar';
import styles from './AppLayout.module.scss';

export function AppLayout() {
  return (
    <div className={styles.layout}>
      <main className={styles.content}>
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
