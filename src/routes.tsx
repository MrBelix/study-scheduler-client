import type { RouteObject } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { StudentsPage } from './features/students/StudentsPage'

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { path: '/',         element: <div>Dashboard</div> },
      { path: '/students', element: <StudentsPage/> },
      { path: '/schedule', element: <div>Schedule</div>  },
      { path: '/finance',  element: <div>Finance</div>   },
      { path: '/settings', element: <div>Settings</div>  },
    ],
  },
  { path: '/students/new', element: <div>Add Student</div>    },
  { path: '/students/:id', element: <div>Student Detail</div> },
]
