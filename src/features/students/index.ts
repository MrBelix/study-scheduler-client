// Public surface of the Students feature. Other slices (and the app
// router) should only import from this barrel — feature-internal
// modules (components/, mock.ts) stay private.
export { StudentsPage }       from './pages/StudentsPage'
export { StudentDetailPage }  from './pages/StudentDetailPage'
export { CreateStudentPage }  from './pages/CreateStudentPage'

export type { Student, Subject, HistoryItem } from './types'
