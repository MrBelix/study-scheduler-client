import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../shared/ui/AppLayout/AppLayout';
import { SchedulePage } from '../pages/SchedulePage/SchedulePage';
import { StudentsPage } from '../pages/StudentsPage/StudentsPage';
import { ReportsPage } from '../pages/ReportsPage/ReportsPage';
import { ProfilePage } from '../pages/ProfilePage/ProfilePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <SchedulePage /> },
      { path: 'students', element: <StudentsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
]);
