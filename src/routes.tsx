import type { RouteObject } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { StudentsPage } from './features/students/StudentsPage'
import { StudentDetailPage } from './features/students/StudentDetailPage'
import { CreateStudentPage } from './features/students/CreateStudentPage'

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { path: '/',          element: <div>Dashboard</div> },
      { path: '/students',  element: <StudentsPage /> },
      { path: '/schedule',  element: <div>Schedule</div> },
      { path: '/finance',   element: <div>Finance</div> },
      { path: '/settings',  element: <div>Settings</div> },
    ],
  },
  { path: '/students/create', element: <CreateStudentPage /> },
  { path: '/students/:id',    element: <StudentDetailPage /> },
]
