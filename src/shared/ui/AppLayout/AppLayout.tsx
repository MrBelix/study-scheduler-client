import { Outlet } from 'react-router-dom';
import { TabBar } from '../TabBar/TabBar';
import { MainButtonProvider, MainButtonBar } from '../MainButton/MainButton';
import styles from './AppLayout.module.scss';

export function AppLayout() {
  return (
    <MainButtonProvider>
      <div className={styles['app-layout']}>
        <main className={styles['app-layout__content']}>
          <Outlet />
        </main>
        <MainButtonBar />
        <TabBar />
      </div>
    </MainButtonProvider>
  );
}
