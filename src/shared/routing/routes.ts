// Single source of truth for app routes: `PATTERNS` for the router (with
// `:param` placeholders, relative to the layout's `/`) and `routes` typed
// builders for navigation. No bare route strings elsewhere — see router.tsx
// (consumes PATTERNS) and every navigate/Link/useBackButton call (consumes
// `routes`).

/** Route patterns for `router.tsx`'s children — relative to the `/` layout. */
export const PATTERNS = {
  students: 'students',
  studentsNew: 'students/new',
  studentDetails: 'students/:id',
  studentEdit: 'students/:id/edit',
  studentSeries: 'students/:id/series',
  studentHistory: 'students/:id/lessons',
  studentDebts: 'students/:id/debts',
  lessonsNew: 'lessons/new',
  // Legacy path — F8 merged the two create forms into one; this now just
  // redirects to `lessonsNew` (see `SeriesNewRedirect`).
  seriesNew: 'lessons/series/new',
  seriesView: 'lessons/series/:id',
  seriesEdit: 'lessons/series/:id/edit',
  lessonDetails: 'lessons/:id',
  reports: 'reports',
  profile: 'profile',
} as const;

/** `?studentId=` preselect, shared by the one-off and series lesson forms. */
interface StudentPreselect {
  studentId?: string;
}

/** `?studentId=&date=&repeat=` preselect for the unified lesson/series create form. */
interface LessonNewPreselect extends StudentPreselect {
  date?: string;
  /** Preselects "Повторювати: Щотижня" (used by `AddSeriesRow` and the legacy series-form redirect). */
  repeat?: 'weekly';
}

function withLessonPreselect(base: string, params?: LessonNewPreselect): string {
  const query = new URLSearchParams();
  if (params?.studentId) query.set('studentId', params.studentId);
  if (params?.date) query.set('date', params.date);
  if (params?.repeat) query.set('repeat', params.repeat);
  const qs = query.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Typed navigation targets — build with these instead of bare path strings. */
export const routes = {
  schedule: () => '/',
  students: {
    list: () => `/${PATTERNS.students}`,
    new: () => `/${PATTERNS.studentsNew}`,
    details: (id: string) => `/students/${id}`,
    edit: (id: string) => `/students/${id}/edit`,
    series: (id: string) => `/students/${id}/series`,
    /** F7 — the student's own lesson list (upcoming/history tabs). */
    history: (id: string) => `/students/${id}/lessons`,
    /** The bulk-settle page — unpaid Completed lessons, mark-paid in one go. */
    debts: (id: string) => `/students/${id}/debts`,
  },
  lessons: {
    // `id` is the lesson row's own Guid — a plain path segment, no encoding needed.
    details: (id: string) => `/lessons/${id}`,
    // The one create form — a one-off lesson, or (with `repeat: 'weekly'`
    // preselected) a series; both go through the same route.
    new: (params?: LessonNewPreselect) => withLessonPreselect(`/${PATTERNS.lessonsNew}`, params),
    // One recurring set's own page — status, upcoming occurrences, and entry points into editing/ending/cancelling it.
    seriesView: (id: string) => `/lessons/series/${id}`,
    seriesEdit: (id: string) => `/lessons/series/${id}/edit`,
  },
  reports: () => `/${PATTERNS.reports}`,
  profile: () => `/${PATTERNS.profile}`,
} as const;
