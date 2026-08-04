// API contract — hand-written to mirror the StudyScheduler server.
// The server (.NET minimal API) serializes JSON as camelCase and returns
// Guids as strings. Keep these in sync with the backend DTOs.

/** Lifecycle status of a student. */
export type StudentStatus = 'Active' | 'Archived';

/**
 * Earliest upcoming non-cancelled lesson for a student, server-computed off
 * their already-generated lesson rows (a series's future occurrences are rows
 * from the moment it is created — there is no unmaterialized state to pick
 * from). `subject` is the series title or lesson topic, if any.
 */
export interface StudentNextLesson {
  startUtc: string;
  subject: string | null;
}

/** Student projection — `GET /students`, `POST /students`. */
export interface Student {
  id: string;
  name: string;
  rate: number;
  status: StudentStatus;
  createdAtUtc: string;
  nextLesson: StudentNextLesson | null;
}

/**
 * Richer next-lesson projection for `GET /students/{id}` — adds the duration
 * and `lessonId`, the lesson's own Guid `id` (same value `GET /lessons` serves
 * as `id`): the identity needed to open the lesson via `GET`/`PATCH /lessons/{lessonId}`.
 */
export interface StudentNextLessonDetails {
  startUtc: string;
  durationMinutes: number;
  subject: string | null;
  lessonId: string;
}

/**
 * A student's outstanding balance, embedded in `GET /students/{id}` as
 * `StudentDetails.debt`. Null exactly when nothing is owed (never a zero
 * object) — archived students report debt the same as active ones.
 */
export interface StudentDebt {
  amount: number;
  lessonsCount: number;
}

/**
 * Student detail projection — `GET /students/{id}`. `series` holds only
 * current schedules (no `endDate`, or ending today or later — see
 * `isSeriesCurrent`); `lessonsCompleted`/`moneyReceived` are lifetime totals;
 * `firstLessonAtUtc` is the earliest physical lesson's start, or null if the
 * student never had one.
 */
export interface StudentDetails {
  id: string;
  name: string;
  rate: number;
  status: StudentStatus;
  createdAtUtc: string;
  nextLesson: StudentNextLessonDetails | null;
  series: LessonSeries[];
  lessonsCompleted: number;
  moneyReceived: number;
  firstLessonAtUtc: string | null;
  debt: StudentDebt | null;
}

/** Body for `POST /students`. `rate` omitted defaults to 0 on the server. */
export interface CreateStudentRequest {
  name: string;
  rate?: number;
}

/** Body for `PATCH /students/{id}` — only provided fields are applied. */
export interface UpdateStudentRequest {
  name?: string;
  rate?: number;
  status?: StudentStatus;
}

/**
 * One unpaid Completed lesson, as listed by `GET /students/{id}/debts`.
 * `subject` is the lesson's own topic, falling back to its series' title, or
 * null when neither is set.
 */
export interface UnpaidLesson {
  id: string;
  startUtc: string;
  durationMinutes: number;
  price: number;
  subject: string | null;
}

/**
 * A student's unpaid ledger — `GET /students/{id}/debts`. `lessons` is
 * newest-first (`startUtc` DESC). Owing nothing still returns 200 with an
 * empty list and zero totals (never 404); 404 is reserved for an unknown
 * student id. Archived students are readable.
 */
export interface StudentDebtsResponse {
  lessons: UnpaidLesson[];
  totalAmount: number;
  count: number;
}

/** Tutor (member) settings — `GET /profile`, `PUT /profile` (upsert).
 * `languageCode` is the preferred UI language ("uk" | "en"), null until chosen.
 * `remindMinutes` — bot reminder lead time; null means reminders are off.
 * `botReachable` — true by default (optimistic); the server flips it to false
 * after a bot message fails with 403 (blocked/never started), and back to
 * true on any interaction with the bot.
 */
export interface Profile {
  timeZoneId: string;
  languageCode: string | null;
  remindMinutes: number | null;
  notifyAfterLesson: boolean;
  botReachable: boolean;
  createdAtUtc: string;
}

/**
 * Omitted fields keep their stored values; `remindMinutes: 0` turns reminders
 * off (an omitted field can't, or unrelated saves would disable them).
 */
export interface UpdateProfileRequest {
  timeZoneId: string;
  languageCode?: string;
  remindMinutes?: number;
  notifyAfterLesson?: boolean;
}

/** Lifecycle status of a lesson. */
export type LessonStatus = 'Scheduled' | 'Completed' | 'Cancelled';

/**
 * Lesson projection — `GET /lessons`. `id` is the lesson row's own Guid.
 * Every occurrence is a physical row the moment its series is created/
 * extended (eager generation) — there is no virtual/unmaterialized state
 * this id has to paper over. `seriesId`/`occurrenceDate` are set for series
 * lessons. Address and mutate any lesson via `GET`/`PATCH /lessons/{id}`.
 */
export interface Lesson {
  id: string;
  studentId: string;
  seriesId: string | null;
  occurrenceDate: string | null;
  startUtc: string;
  endUtc: string;
  durationMinutes: number;
  status: LessonStatus;
  price: number;
  isPaid: boolean;
  topic: string | null;
  description: string | null;
  createdAtUtc: string;
}

/**
 * The "repeat: weekly" half of `CreateLessonRequest` — present, the request
 * creates a series instead of a one-off lesson. `weekdays` is a flags string
 * (e.g. "Monday, Thursday"); `endDate` omitted/null makes the series
 * open-ended. A series has no per-lesson topic, so `CreateLessonRequest.topic`
 * applies to the one-off branch only.
 */
export interface LessonRepeatRequest {
  weekdays: string;
  title?: string;
  endDate?: string | null;
}

/**
 * Body for the one `POST /lessons` route: a one-off lesson without `repeat`,
 * a weekly series with it — the client never picks between two routes, it
 * fills in one form. `date` + `startTimeLocal` are wall clock in the tutor's
 * PROFILE time zone (both branches place a lesson by the same rule, so the
 * profile must be set either way). `price` omitted falls back to the
 * student's rate.
 */
export interface CreateLessonRequest {
  studentId: string;
  date: string;
  startTimeLocal: string;
  durationMinutes: number;
  price?: number;
  topic?: string;
  repeat?: LessonRepeatRequest;
}

/**
 * Result of `POST /lessons` — exactly one of the two is set: `lesson` when
 * the request had no `repeat`, `series` when it had one.
 */
export interface CreateLessonResponse {
  lesson: Lesson | null;
  series: LessonSeries | null;
}

/** Body for `PATCH /lessons/{id}` — only provided fields are applied. */
export interface UpdateLessonRequest {
  startUtc?: string;
  durationMinutes?: number;
  status?: LessonStatus;
  price?: number;
  isPaid?: boolean;
  topic?: string;
  description?: string;
}

/** Body for `POST /lessons/settle` — the lesson ids to mark paid in bulk. */
export interface SettleLessonsRequest {
  lessonIds: string[];
}

/**
 * Result of `POST /lessons/settle` — the count of distinct lessons actually
 * settled. Duplicate ids in the request are deduped; an already-paid id is an
 * idempotent no-op still counted here.
 */
export interface SettleLessonsResponse {
  settled: number;
}

/**
 * Series projection — `GET /lessons/series`. `weekdays` is a flags string
 * (e.g. "Monday, Thursday"); `startTimeLocal` is wall clock in `timeZoneId`.
 */
export interface LessonSeries {
  id: string;
  studentId: string;
  title: string | null;
  startDate: string;
  endDate: string | null;
  weekdays: string;
  startTimeLocal: string;
  durationMinutes: number;
  timeZoneId: string;
  price: number | null;
  createdAtUtc: string;
}

/**
 * Body for `PATCH /lessons/series/{id}` — a full edit, schedule included. A
 * null/omitted field means "not provided" (this API's convention
 * everywhere), so making an ended series open-ended again can't be expressed
 * by `endDate` alone and is asked for with `clearEndDate` instead; sending
 * both is refused as contradictory.
 *
 * `weekdays`, `startTimeLocal` and `durationMinutes` edit the weekly schedule
 * in place (the time zone isn't editable — it's the one the series was
 * created in). Any of them, and any change to the window, rewrites the
 * lessons the series generated for the future; `keepCustomized` decides what
 * happens to the occurrences somebody edited by hand: `true` (the default)
 * leaves them exactly where they are, `false` replaces them along with the
 * rest. Lessons that already started, and completed ones whenever they sit,
 * are never touched either way.
 */
export interface UpdateLessonSeriesRequest {
  title?: string;
  price?: number;
  endDate?: string | null;
  clearEndDate?: boolean;
  weekdays?: string;
  startTimeLocal?: string;
  durationMinutes?: number;
  keepCustomized?: boolean;
}

/**
 * Result of `PATCH /lessons/series/{id}` — the updated series plus the
 * lessons the new schedule/window no longer covers (a title/price-only patch
 * never loses any).
 */
export interface UpdateSeriesResponse {
  series: LessonSeries;
  removedLessons: Lesson[];
}

/**
 * Result of `POST /lessons/series/{id}/cancel` — the ended series plus the
 * future rows that got swept away (every remaining occurrence except a
 * completed one and, unless `keepCustomized` was sent `false`, ones edited by
 * hand), so the client can tell the tutor what went away.
 */
export interface CancelSeriesResponse {
  series: LessonSeries;
  removedLessons: Lesson[];
}

/** The Money dashboard's reporting granularity — `GET /reports/dashboard?period=`. */
export type DashboardPeriodKind = 'week' | 'month' | 'quarter';

/** The reporting window, as inclusive local dates (`yyyy-MM-dd`) in the tutor's own time zone. */
export interface DashboardPeriodRange {
  from: string;
  to: string;
}

/**
 * The period's money. `actual` is what was received (paid, non-cancelled); `expected` is what the
 * period is worth once everything non-cancelled in it is settled. `previous` is `actual` over the
 * same window one period earlier.
 */
export interface DashboardIncome {
  actual: number;
  expected: number;
  previous: number;
}

/** One student who owes money, with the name resolved server-side. */
export interface Debtor {
  studentId: string;
  name: string;
  amount: number;
  lessonsCount: number;
  oldestUtc: string;
}

/**
 * The debt ledger — unpaid completed lessons over the tutor's whole history, not just the period,
 * ordered by amount owed.
 */
export interface DashboardDebt {
  total: number;
  debtors: Debtor[];
}

/** Schedule entries in the period by status; every entry falls in exactly one bucket. */
export interface DashboardLessons {
  completed: number;
  scheduled: number;
  cancelled: number;
}

/**
 * How busy the period is: `hours` is the average non-cancelled teaching hours per week over it
 * (rounded to one decimal), `lessonsInPeriod` the non-cancelled entries behind that average.
 */
export interface WeeklyLoad {
  hours: number;
  lessonsInPeriod: number;
}

/**
 * One chart column: a day for a week period, a Monday-based calendar week otherwise — clipped to
 * the period, so the first and last bucket of a month or quarter are usually partial weeks.
 */
export interface DashboardBucket {
  from: string;
  to: string;
  completedCount: number;
  scheduledCount: number;
}

/** One student's received income in the period, with the name resolved server-side. */
export interface StudentIncome {
  studentId: string;
  name: string;
  income: number;
}

/**
 * Everything the Money screen shows for one reporting window, in a single response — the client
 * renders it without deriving anything. `GET /reports/dashboard?period=week|month|quarter&anchor=`.
 */
export interface Dashboard {
  period: DashboardPeriodRange;
  income: DashboardIncome;
  debt: DashboardDebt;
  lessons: DashboardLessons;
  weeklyLoad: WeeklyLoad;
  buckets: DashboardBucket[];
  perStudent: StudentIncome[];
}
