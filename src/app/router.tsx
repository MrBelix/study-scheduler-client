import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/app/AppLayout/AppLayout';
import { ErrorScreen } from '@/app/ErrorScreen/ErrorScreen';
import { PATTERNS } from '@/shared/routing';
import { SchedulePage } from '@/pages/Schedule/SchedulePage';
import { StudentsListPage } from '@/pages/Students/List/StudentsListPage';
import { StudentDetailsPage } from '@/pages/Students/Details/StudentDetailsPage';
import { StudentSeriesPage } from '@/pages/Students/Series/StudentSeriesPage';
import { StudentHistoryPage } from '@/pages/Students/History/StudentHistoryPage';
import { StudentDebtsPage } from '@/pages/Students/Debts/StudentDebtsPage';
import { StudentFormPage } from '@/pages/Students/Form/StudentFormPage';
import { LessonFormPage } from '@/pages/Lessons/Form/LessonFormPage';
import { SeriesNewRedirect } from '@/pages/Lessons/SeriesNewRedirect/SeriesNewRedirect';
import { SeriesViewPage } from '@/pages/Lessons/SeriesView/SeriesViewPage';
import { SeriesEditPage } from '@/pages/Lessons/SeriesEdit/SeriesEditPage';
import { LessonDetailPage } from '@/pages/Lessons/Details/LessonDetailPage';
import { ReportsPage } from '@/pages/Reports/ReportsPage';
import { ProfilePage } from '@/pages/Profile/ProfilePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorScreen />,
    children: [
      { index: true, element: <SchedulePage /> },
      { path: PATTERNS.students, element: <StudentsListPage /> },
      { path: PATTERNS.studentsNew, element: <StudentFormPage /> },
      { path: PATTERNS.studentDetails, element: <StudentDetailsPage /> },
      { path: PATTERNS.studentEdit, element: <StudentFormPage /> },
      { path: PATTERNS.studentSeries, element: <StudentSeriesPage /> },
      { path: PATTERNS.studentHistory, element: <StudentHistoryPage /> },
      { path: PATTERNS.studentDebts, element: <StudentDebtsPage /> },
      { path: PATTERNS.lessonsNew, element: <LessonFormPage /> },
      { path: PATTERNS.seriesNew, element: <SeriesNewRedirect /> },
      { path: PATTERNS.seriesView, element: <SeriesViewPage /> },
      { path: PATTERNS.seriesEdit, element: <SeriesEditPage /> },
      { path: PATTERNS.lessonDetails, element: <LessonDetailPage /> },
      { path: PATTERNS.reports, element: <ReportsPage /> },
      { path: PATTERNS.profile, element: <ProfilePage /> },
    ],
  },
]);
