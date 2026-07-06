import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/shared/ui/AppLayout/AppLayout';
import { ErrorScreen } from '@/app/ErrorScreen/ErrorScreen';
import { SchedulePage } from '@/pages/SchedulePage/SchedulePage';
import { StudentsPage } from '@/pages/StudentsPage/StudentsPage';
import { StudentDetailPage } from '@/pages/StudentDetailPage/StudentDetailPage';
import { StudentFormPage } from '@/pages/StudentFormPage/StudentFormPage';
import { LessonFormPage } from '@/pages/LessonFormPage/LessonFormPage';
import { SeriesFormPage } from '@/pages/SeriesFormPage/SeriesFormPage';
import { SeriesEditPage } from '@/pages/SeriesEditPage/SeriesEditPage';
import { LessonDetailPage } from '@/pages/LessonDetailPage/LessonDetailPage';
import { ReportsPage } from '@/pages/ReportsPage/ReportsPage';
import { ProfilePage } from '@/pages/ProfilePage/ProfilePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorScreen />,
    children: [
      { index: true, element: <SchedulePage /> },
      { path: 'students', element: <StudentsPage /> },
      { path: 'students/new', element: <StudentFormPage /> },
      { path: 'students/:id', element: <StudentDetailPage /> },
      { path: 'students/:id/edit', element: <StudentFormPage /> },
      { path: 'lessons/new', element: <LessonFormPage /> },
      { path: 'lessons/series/new', element: <SeriesFormPage /> },
      { path: 'lessons/series/:id/edit', element: <SeriesEditPage /> },
      { path: 'lessons/:id', element: <LessonDetailPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
]);
