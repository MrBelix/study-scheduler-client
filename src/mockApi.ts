// Dev-only in-memory API mock (enabled via VITE_API_MOCK, see .env.development).
// Implements enough of the StudyScheduler backend to develop every screen
// without running it: students CRUD, profile upsert, lessons/series, overlap
// 409s, field-level 400s and a Money dashboard aggregate.
// Mirrors the real backend's eager generation: every series occurrence within
// the planning horizon (`SERIES_REGEN_HORIZON_DAYS`) is a physical row with a
// stable Guid id the moment the series is created/extended (`generateFutureRows`),
// backfilled once more at load (`topUpSeriesRows`) to cover time passed since
// the last session. A schedule edit deletes the future window's rows and
// regenerates them right away (`applySeriesPatch`), so ids do not survive a
// series schedule change — a lesson addressed by a since-swept id 404s, same
// as the real API.
// State persists in localStorage — clear the key below (or bump the version)
// to reseed.
//
// NOTE 2026-08-03: rebuilt after an accidental full-file overwrite lost the
// previous (more battle-tested) version. Functionally equivalent for every
// screen this app has, rewritten from the current `shared/api` contract —
// some seed-data flavor and edge-case fidelity from the lost version may
// differ slightly.
// NOTE 2026-08-04: adopted the plain-Guid lesson id contract — dropped the
// LessonKey (`l:`/`s:`) format and the virtual/materialize shortcut it
// enabled; every occurrence is now generated as a physical row up front.
import type {
  Student,
  StudentDetails,
  StudentNextLesson,
  StudentNextLessonDetails,
  StudentDebt,
  CreateStudentRequest,
  UpdateStudentRequest,
  UnpaidLesson,
  StudentDebtsResponse,
  Profile,
  UpdateProfileRequest,
  Lesson,
  LessonStatus,
  CreateLessonRequest,
  CreateLessonResponse,
  UpdateLessonRequest,
  SettleLessonsRequest,
  SettleLessonsResponse,
  LessonSeries,
  UpdateLessonSeriesRequest,
  UpdateSeriesResponse,
  CancelSeriesResponse,
  LessonConflict,
  DashboardPeriodKind,
  Dashboard,
  DashboardBucket,
  Debtor,
  StudentIncome,
} from '@/shared/api';

const STORAGE_KEY = 'mock-api-v10'; // v10: notifyAfterLesson -> daySummary + morningAgenda/morningAgendaAt, tomorrowLessonsCount
const LATENCY_MS = 250;

const WEEKDAY_FLAGS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** `nextLesson` is server-computed, never stored — students in state carry everything else the wire type has. */
type StoredStudent = Omit<Student, 'nextLesson'>;

/** `tomorrowLessonsCount` is server-computed off `state.lessons`, never stored — see `toWireProfile`. */
type StoredProfile = Omit<Profile, 'tomorrowLessonsCount'>;

/**
 * A physical lesson row — every occurrence within the planning horizon is one,
 * eagerly generated the moment its series is created/extended (mirrors the
 * real backend; see `SERIES_REGEN_HORIZON_DAYS`). `dbId` is the row's Guid,
 * copied onto the wire `Lesson.id` as-is by `toWireLesson`.
 */
type StoredLesson = Omit<Lesson, 'id'> & { dbId: string };

interface MockState {
  profile: StoredProfile | null;
  students: StoredStudent[];
  lessons: StoredLesson[];
  series: LessonSeries[];
}

const localDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Device-local wall clock from a `yyyy-MM-dd` date and `HH:mm`/`HH:mm:ss` time — this mock is device-local throughout (no server time zone of its own). */
function combineLocal(dateKeyStr: string, timeStr: string): Date {
  const [y, mo, d] = dateKeyStr.split('-').map(Number);
  const [h, mi] = timeStr.split(':').map(Number);
  return new Date(y, mo - 1, d, h, mi);
}

// ---- Dashboard period math (mirrors the backend's DashboardPeriod — Features/Reports/DashboardPeriod.cs).
// Local-date-only arithmetic, device-local like the rest of this mock. ----

const mondayOf = (d: Date): Date => {
  const result = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
};

/** The window of `kind` containing `anchor` — Monday-based weeks, calendar months/quarters. */
function resolveDashboardPeriod(kind: DashboardPeriodKind, anchor: Date): { from: Date; to: Date } {
  if (kind === 'week') {
    const monday = mondayOf(anchor);
    const to = new Date(monday);
    to.setDate(to.getDate() + 6);
    return { from: monday, to };
  }
  if (kind === 'month') {
    return {
      from: new Date(anchor.getFullYear(), anchor.getMonth(), 1),
      to: new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0),
    };
  }
  const quarterStartMonth = Math.floor(anchor.getMonth() / 3) * 3;
  return {
    from: new Date(anchor.getFullYear(), quarterStartMonth, 1),
    to: new Date(anchor.getFullYear(), quarterStartMonth + 3, 0),
  };
}

function seed(): MockState {
  const now = new Date();
  const day = (offset: number, h: number, min = 0) =>
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, h, min);
  // Monday-first index of "today" and a small offset helper — keeps which
  // series occur "today" (or definitely not today) deterministic regardless
  // of the real run date.
  const todayIdx = (now.getDay() + 6) % 7;
  const flagAt = (offset: number) => WEEKDAY_FLAGS[(todayIdx + offset) % 7];
  const timeZoneId = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const students: StoredStudent[] = [
    { id: crypto.randomUUID(), name: 'Марія Коваленко', rate: 450, status: 'Active', createdAtUtc: day(-30, 12).toISOString() },
    { id: crypto.randomUUID(), name: 'Іван Петренко', rate: 300, status: 'Active', createdAtUtc: day(-20, 12).toISOString() },
    { id: crypto.randomUUID(), name: 'Дмитро Мельник', rate: 500, status: 'Active', createdAtUtc: day(-10, 12).toISOString() },
    { id: crypto.randomUUID(), name: 'Оля Шевчук', rate: 0, status: 'Archived', createdAtUtc: day(-60, 12).toISOString() },
  ];
  const series: LessonSeries[] = [
    {
      id: crypto.randomUUID(),
      studentId: students[0].id,
      title: 'Математика',
      startDate: localDateKey(day(-14, 0)),
      endDate: null,
      // Two/four days away from "today" — never collides with Дмитро's today-only slot below.
      weekdays: `${flagAt(2)}, ${flagAt(4)}`,
      startTimeLocal: '16:00:00',
      durationMinutes: 60,
      timeZoneId,
      price: null,
      createdAtUtc: day(-14, 12).toISOString(),
    },
    // Ended a while ago — excluded from Іван's current series (`isSeriesCurrent`).
    {
      id: crypto.randomUUID(),
      studentId: students[1].id,
      title: 'Геометрія',
      startDate: localDateKey(day(-120, 0)),
      endDate: localDateKey(day(-10, 0)),
      weekdays: 'Wednesday',
      startTimeLocal: '15:00:00',
      durationMinutes: 60,
      timeZoneId,
      price: null,
      createdAtUtc: day(-120, 12).toISOString(),
    },
    // Occurs today, later than "now" — Дмитро's next lesson is this occurrence, generated eagerly
    // like the rest of the series' horizon (`topUpSeriesRows` fills it in right after load).
    {
      id: crypto.randomUUID(),
      studentId: students[2].id,
      title: 'Фізика',
      startDate: localDateKey(day(-7, 0)),
      endDate: null,
      weekdays: flagAt(0),
      startTimeLocal: '22:00:00',
      durationMinutes: 90,
      timeZoneId,
      price: null,
      createdAtUtc: day(-7, 12).toISOString(),
    },
  ];
  const oneOff = (
    studentId: string,
    offset: number,
    h: number,
    status: LessonStatus,
    isPaid: boolean,
    topic: string | null,
  ): StoredLesson => ({
    dbId: crypto.randomUUID(),
    studentId,
    seriesId: null,
    occurrenceDate: null,
    startUtc: day(offset, h).toISOString(),
    endUtc: day(offset, h + 1).toISOString(),
    durationMinutes: 60,
    status,
    price: 300,
    isPaid,
    topic,
    description: null,
    createdAtUtc: day(offset - 7, 12).toISOString(),
  });

  return {
    profile: {
      timeZoneId,
      languageCode: null,
      remindMinutes: 30,
      daySummary: true,
      morningAgenda: false,
      morningAgendaAt: '08:00',
      botReachable: true,
      createdAtUtc: day(-30, 0).toISOString(),
    },
    students,
    series,
    lessons: [
      oneOff(students[1].id, -1, 10, 'Completed', true, 'Кінематика'),
      oneOff(students[1].id, 2, 10, 'Scheduled', false, null),
      oneOff(students[1].id, 3, 9, 'Cancelled', false, null),
      // Two unpaid Completed lessons — the Money dashboard debt demo.
      oneOff(students[0].id, -3, 17, 'Completed', false, 'Інтеграли'),
      oneOff(students[2].id, -5, 19, 'Completed', false, 'Кола Ньютона'),
    ],
  };
}

function load(): MockState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* corrupted — reseed */
  }
  return seed();
}

function toWireLesson(l: StoredLesson): Lesson {
  return {
    id: l.dbId,
    studentId: l.studentId,
    seriesId: l.seriesId,
    occurrenceDate: l.occurrenceDate,
    startUtc: l.startUtc,
    endUtc: l.endUtc,
    durationMinutes: l.durationMinutes,
    status: l.status,
    price: l.price,
    isPaid: l.isPaid,
    topic: l.topic,
    description: l.description,
    createdAtUtc: l.createdAtUtc,
  };
}

export function installMockApi() {
  const state = load();
  const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
  const validation = (field: string, message: string) => json({ errors: { [field]: [message] } }, 400);
  const notFound = () => json({}, 404);

  /** One series' occurrence on `dateKeyStr`, as an (ungenerated) `StoredLesson`-shape — null if the series has no slot there. */
  const slotOn = (s: LessonSeries, dateKeyStr: string): Omit<StoredLesson, 'dbId'> | null => {
    if (dateKeyStr < s.startDate || (s.endDate && dateKeyStr > s.endDate)) return null;
    const wanted = new Set(s.weekdays.split(',').map((w) => w.trim()));
    const [y, mo, d] = dateKeyStr.split('-').map(Number);
    const localNoon = new Date(y, mo - 1, d, 12);
    if (!wanted.has(WEEKDAY_FLAGS[(localNoon.getDay() + 6) % 7])) return null;
    const [h, min] = s.startTimeLocal.split(':').map(Number);
    const start = new Date(y, mo - 1, d, h, min);
    return {
      studentId: s.studentId,
      seriesId: s.id,
      occurrenceDate: dateKeyStr,
      startUtc: start.toISOString(),
      endUtc: new Date(start.getTime() + s.durationMinutes * 60_000).toISOString(),
      durationMinutes: s.durationMinutes,
      status: 'Scheduled',
      price: s.price ?? state.students.find((st) => st.id === s.studentId)?.rate ?? 0,
      isPaid: false,
      topic: null,
      description: null,
      createdAtUtc: s.createdAtUtc,
    };
  };

  // Whether a series still produces occurrences today or later — mirrors the client's `isSeriesCurrent`.
  const isSeriesCurrent = (s: LessonSeries): boolean => {
    const today = localDateKey(new Date());
    return s.endDate == null || (s.endDate >= today && s.endDate >= s.startDate);
  };

  // Overlap check mirrors the backend: every physical row inside the horizon can collide — there's
  // no unmaterialized state left to special-case.
  const overlaps = (startIso: string, endIso: string, ignore?: { dbId?: string }): StoredLesson[] =>
    state.lessons.filter(
      (l) => l.status !== 'Cancelled' && !(ignore?.dbId != null && l.dbId === ignore.dbId) && l.startUtc < endIso && startIso < l.endUtc,
    );
  const conflict409 = (found: StoredLesson[]) =>
    json(
      {
        message: 'The requested time overlaps existing lessons or series.',
        // Mirrors the real backend (`LessonOverlapChecker.FromLesson`): row conflicts always carry a
        // null seriesTitle — a title only appears on analytic series-vs-series conflicts (lessonId: null),
        // which this mock never produces.
        conflicts: found.map((l): LessonConflict => ({
          lessonId: l.dbId,
          seriesId: l.seriesId,
          seriesTitle: null,
          startUtc: l.startUtc,
          endUtc: l.endUtc,
        })),
      },
      409,
    );

  // Earliest upcoming non-cancelled lesson for a student — every occurrence within the planning
  // horizon is already a physical row, so this is a plain scan, no window bound needed.
  const computeNextLessonDetails = (studentId: string): StudentNextLessonDetails | null => {
    const nowIso = new Date().toISOString();
    const candidates = state.lessons.filter((l) => l.studentId === studentId && l.status !== 'Cancelled' && l.startUtc >= nowIso);
    if (candidates.length === 0) return null;
    const next = candidates.reduce((a, b) => (a.startUtc <= b.startUtc ? a : b));
    const series = next.seriesId ? state.series.find((s) => s.id === next.seriesId) : undefined;
    return {
      startUtc: next.startUtc,
      durationMinutes: next.durationMinutes,
      subject: next.topic ?? series?.title ?? null,
      lessonId: next.dbId,
    };
  };
  const computeNextLesson = (studentId: string): StudentNextLesson | null => {
    const details = computeNextLessonDetails(studentId);
    return details ? { startUtc: details.startUtc, subject: details.subject } : null;
  };
  const withNextLesson = (student: StoredStudent): Student => ({ ...student, nextLesson: computeNextLesson(student.id) });

  // Non-cancelled lessons starting tomorrow (device-local, like the rest of this mock) — the hint
  // the agenda-time bottom sheet shows, mirrors the real backend's `TomorrowLessonsCount`.
  const computeTomorrowLessonsCount = (): number => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const key = localDateKey(tomorrow);
    return state.lessons.filter((l) => l.status !== 'Cancelled' && localDateKey(new Date(l.startUtc)) === key).length;
  };
  const toWireProfile = (profile: StoredProfile): Profile => ({ ...profile, tomorrowLessonsCount: computeTomorrowLessonsCount() });

  // Unpaid Completed lessons for a student — shared by StudentDetails.debt and
  // GET /students/{id}/debts so the two stay consistent (null-when-zero on one, the same rows
  // listed on the other).
  const unpaidCompletedLessonsOf = (studentId: string): StoredLesson[] =>
    state.lessons.filter((l) => l.studentId === studentId && l.status === 'Completed' && !l.isPaid);

  const computeStudentDebt = (studentId: string): StudentDebt | null => {
    const unpaid = unpaidCompletedLessonsOf(studentId);
    if (unpaid.length === 0) return null;
    return { amount: unpaid.reduce((sum, l) => sum + l.price, 0), lessonsCount: unpaid.length };
  };

  const withStudentDetails = (student: StoredStudent): StudentDetails => {
    const currentSeries = state.series.filter((s) => s.studentId === student.id && isSeriesCurrent(s));
    const studentLessons = state.lessons.filter((l) => l.studentId === student.id);
    const lessonsCompleted = studentLessons.filter((l) => l.status === 'Completed').length;
    const moneyReceived = studentLessons.filter((l) => l.status !== 'Cancelled' && l.isPaid).reduce((sum, l) => sum + l.price, 0);
    const firstLessonAtUtc = studentLessons.length
      ? studentLessons.reduce((min, l) => (l.startUtc < min ? l.startUtc : min), studentLessons[0].startUtc)
      : null;
    return {
      id: student.id,
      name: student.name,
      rate: student.rate,
      status: student.status,
      createdAtUtc: student.createdAtUtc,
      nextLesson: computeNextLessonDetails(student.id),
      series: currentSeries,
      lessonsCompleted,
      moneyReceived,
      firstLessonAtUtc,
      debt: computeStudentDebt(student.id),
    };
  };

  // ---- series row generation (create/patch /lessons/series, and once at load) ----

  const SERIES_REGEN_HORIZON_DAYS = 120; // mirrors the backend's own PlanningHorizon (~4 months) that `LessonGenerator` fills eagerly.

  /** Future (not-yet-started), non-Completed physical rows of a series, past `after`. */
  const futurePhysicalRowsOf = (s: LessonSeries, after: Date): StoredLesson[] =>
    state.lessons.filter((l) => l.seriesId === s.id && l.status !== 'Completed' && l.startUtc >= after.toISOString());

  /**
   * Physical rows for every occurrence of `s` in `[after, after + SERIES_REGEN_HORIZON_DAYS]`
   * (clipped to the series' own window) that has none yet — mirrors the real `LessonGenerator`'s
   * eager fill. Called right after a series is created/patched and once more at load
   * (`topUpSeriesRows`), so every occurrence in range always has a stable, addressable id.
   */
  const generateFutureRows = (s: LessonSeries, after: Date): StoredLesson[] => {
    const horizon = new Date(after.getFullYear(), after.getMonth(), after.getDate() + SERIES_REGEN_HORIZON_DAYS);
    const generated: StoredLesson[] = [];
    for (
      let d = new Date(after.getFullYear(), after.getMonth(), after.getDate());
      d <= horizon;
      d.setDate(d.getDate() + 1)
    ) {
      const key = localDateKey(d);
      if (state.lessons.some((l) => l.seriesId === s.id && l.occurrenceDate === key)) continue;
      const slot = slotOn(s, key);
      if (!slot) continue;
      const row: StoredLesson = { ...slot, dbId: crypto.randomUUID() };
      state.lessons.push(row);
      generated.push(row);
    }
    return generated;
  };

  /**
   * Backfills every still-current series with physical rows through the planning horizon — run
   * once at load, so ids saved from a previous session stay addressable and any occurrences the
   * horizon has newly rolled into since then exist too. Idempotent (skips dates that already have
   * a row).
   */
  const topUpSeriesRows = () => {
    const today = new Date();
    for (const s of state.series) {
      if (!isSeriesCurrent(s)) continue;
      const after = s.startDate > localDateKey(today) ? new Date(`${s.startDate}T00:00`) : today;
      generateFutureRows(s, after);
    }
  };

  /**
   * `PATCH /lessons/series/{id}` — a full edit, schedule included. A schedule
   * change (weekdays/time/duration) deletes every future row; an end-date
   * tightening only sweeps what now falls outside the window. `keepCustomized`
   * isn't tracked by this mock's `Lesson` shape (no hand-edited flag), so —
   * the same simplification the endDate branch already made before — every
   * future occurrence a schedule change touches goes, physical or not. Either
   * way, the window is regenerated right away (eager, like the real
   * generator) — new ids for a schedule change, any newly-opened dates for an
   * end-date loosening.
   */
  const applySeriesPatch = (series: LessonSeries, body: UpdateLessonSeriesRequest): UpdateSeriesResponse => {
    if (body.title !== undefined) series.title = body.title || null;
    if (body.price !== undefined) series.price = body.price;

    const scheduleChanged = body.weekdays !== undefined || body.startTimeLocal !== undefined || body.durationMinutes !== undefined;
    if (body.weekdays !== undefined) series.weekdays = body.weekdays;
    if (body.startTimeLocal !== undefined) series.startTimeLocal = body.startTimeLocal;
    if (body.durationMinutes !== undefined) series.durationMinutes = body.durationMinutes;

    let endDateChanged = false;
    if (body.clearEndDate) {
      endDateChanged = series.endDate != null;
      series.endDate = null;
    } else if (body.endDate !== undefined) {
      endDateChanged = series.endDate !== body.endDate;
      series.endDate = body.endDate;
    }

    const now = new Date();
    let removedLessons: StoredLesson[] = [];
    if (scheduleChanged) {
      removedLessons = futurePhysicalRowsOf(series, now);
      state.lessons = state.lessons.filter((l) => !removedLessons.includes(l));
    } else if (endDateChanged) {
      const today = localDateKey(now);
      removedLessons = state.lessons.filter(
        (l) =>
          l.seriesId === series.id &&
          l.status !== 'Completed' &&
          l.occurrenceDate != null &&
          l.occurrenceDate >= today &&
          (series.endDate == null ? false : l.occurrenceDate > series.endDate),
      );
      state.lessons = state.lessons.filter((l) => !removedLessons.includes(l));
    }
    // Backfill the (possibly new) window right away — a no-op when nothing changed that would open
    // new occurrences.
    generateFutureRows(series, now);
    return { series, removedLessons: removedLessons.map(toWireLesson) };
  };

  /** `POST /lessons/series/{id}/cancel` — ends the series as of today and sweeps everything ahead of it. */
  const cancelSeries = (series: LessonSeries): CancelSeriesResponse => {
    const today = localDateKey(new Date());
    if (!series.endDate || series.endDate > today) series.endDate = today;
    const removed = state.lessons.filter(
      (l) => l.seriesId === series.id && l.status !== 'Completed' && l.occurrenceDate != null && l.occurrenceDate > today,
    );
    state.lessons = state.lessons.filter((l) => !removed.includes(l));
    return { series, removedLessons: removed.map(toWireLesson) };
  };

  // ---- Dashboard aggregation (GET /reports/dashboard) ----

  const buildDashboard = (period: DashboardPeriodKind, anchor: Date): Dashboard => {
    const { from, to } = resolveDashboardPeriod(period, anchor);
    const toExclusive = new Date(to.getFullYear(), to.getMonth(), to.getDate() + 1);
    const fromIso = from.toISOString();
    const toIso = toExclusive.toISOString();

    const inPeriod = state.lessons.filter((l) => l.startUtc >= fromIso && l.startUtc < toIso);
    const nonCancelled = inPeriod.filter((l) => l.status !== 'Cancelled');

    const actual = inPeriod.filter((l) => l.status !== 'Cancelled' && l.isPaid).reduce((sum, l) => sum + l.price, 0);
    const expected = nonCancelled.reduce((sum, l) => sum + l.price, 0);
    const prevAnchor = new Date(from.getTime() - 86_400_000);
    const prevPeriod = resolveDashboardPeriod(period, prevAnchor);
    const prevToExclusive = new Date(prevPeriod.to.getFullYear(), prevPeriod.to.getMonth(), prevPeriod.to.getDate() + 1);
    const previous = state.lessons
      .filter(
        (l) =>
          l.status !== 'Cancelled' &&
          l.isPaid &&
          l.startUtc >= prevPeriod.from.toISOString() &&
          l.startUtc < prevToExclusive.toISOString(),
      )
      .reduce((sum, l) => sum + l.price, 0);

    // Debt ledger: unpaid Completed lessons over the whole history, not just the period.
    const debtors = new Map<string, Debtor>();
    for (const l of state.lessons.filter((l) => l.status === 'Completed' && !l.isPaid)) {
      const student = state.students.find((s) => s.id === l.studentId);
      const existing = debtors.get(l.studentId);
      if (existing) {
        existing.amount += l.price;
        existing.lessonsCount += 1;
        if (l.startUtc < existing.oldestUtc) existing.oldestUtc = l.startUtc;
      } else {
        debtors.set(l.studentId, {
          studentId: l.studentId,
          name: student?.name ?? '',
          amount: l.price,
          lessonsCount: 1,
          oldestUtc: l.startUtc,
        });
      }
    }
    const debtorList = [...debtors.values()].sort((a, b) => b.amount - a.amount);

    const lessons = {
      completed: inPeriod.filter((l) => l.status === 'Completed').length,
      scheduled: inPeriod.filter((l) => l.status === 'Scheduled').length,
      cancelled: inPeriod.filter((l) => l.status === 'Cancelled').length,
    };

    const totalMinutes = nonCancelled.reduce((sum, l) => sum + l.durationMinutes, 0);
    const periodWeeks = Math.max(1, (toExclusive.getTime() - from.getTime()) / (7 * 86_400_000));
    const weeklyLoad = { hours: Math.round((totalMinutes / 60 / periodWeeks) * 10) / 10, lessonsInPeriod: nonCancelled.length };

    // Buckets: one per day for a week, one per Monday-based calendar week otherwise.
    const buckets: DashboardBucket[] = [];
    if (period === 'week') {
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const dayStart = new Date(d);
        const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
        const dayLessons = nonCancelled.filter((l) => l.startUtc >= dayStart.toISOString() && l.startUtc < dayEnd.toISOString());
        buckets.push({
          from: localDateKey(dayStart),
          to: localDateKey(dayStart),
          completedCount: dayLessons.filter((l) => l.status === 'Completed').length,
          scheduledCount: dayLessons.filter((l) => l.status === 'Scheduled').length,
        });
      }
    } else {
      let weekStart = mondayOf(from);
      while (weekStart <= to) {
        const weekEndExclusive = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7);
        const clippedFrom = weekStart < from ? from : weekStart;
        const clippedToExclusive = weekEndExclusive > toExclusive ? toExclusive : weekEndExclusive;
        const weekLessons = nonCancelled.filter(
          (l) => l.startUtc >= clippedFrom.toISOString() && l.startUtc < clippedToExclusive.toISOString(),
        );
        buckets.push({
          from: localDateKey(clippedFrom),
          to: localDateKey(new Date(clippedToExclusive.getTime() - 86_400_000)),
          completedCount: weekLessons.filter((l) => l.status === 'Completed').length,
          scheduledCount: weekLessons.filter((l) => l.status === 'Scheduled').length,
        });
        weekStart = weekEndExclusive;
      }
    }

    const perStudentMap = new Map<string, number>();
    for (const l of inPeriod.filter((l) => l.status !== 'Cancelled' && l.isPaid)) {
      perStudentMap.set(l.studentId, (perStudentMap.get(l.studentId) ?? 0) + l.price);
    }
    const perStudent: StudentIncome[] = [...perStudentMap.entries()]
      .map(([studentId, income]) => ({ studentId, name: state.students.find((s) => s.id === studentId)?.name ?? '', income }))
      .sort((a, b) => b.income - a.income);

    return {
      period: { from: localDateKey(from), to: localDateKey(to) },
      income: { actual, expected, previous },
      debt: { total: debtorList.reduce((sum, d) => sum + d.amount, 0), debtors: debtorList },
      lessons,
      weeklyLoad,
      buckets,
      perStudent,
    };
  };

  // Backfill once at install — covers state loaded from a previous session and any occurrences the
  // horizon has newly rolled into since then (see `topUpSeriesRows`).
  topUpSeriesRows();
  persist();

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
    const rawUrl = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
    const url = new URL(rawUrl, window.location.origin);
    // The client prefixes requests with VITE_API_URL (`/api` in dev) — strip it so route matching below sees bare paths.
    const path = url.pathname.replace(/^\/api(?=\/|$)/, '');
    const isOurs =
      path.startsWith('/students') || path.startsWith('/lessons') || path.startsWith('/profile') || path.startsWith('/reports');
    if (!isOurs) return originalFetch(input, init);

    const method = (init.method ?? 'GET').toUpperCase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- parsed request JSON, shape enforced by the client's typed api layer
    const body: any = init.body ? JSON.parse(init.body as string) : undefined;

    await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

    // --- profile ---
    if (path === '/profile') {
      if (method === 'GET') return state.profile ? json(toWireProfile(state.profile)) : notFound();
      if (method === 'PUT') {
        const req = body as UpdateProfileRequest;
        if (!req.timeZoneId) return validation('TimeZoneId', 'Time zone is required.');
        state.profile = {
          timeZoneId: req.timeZoneId,
          languageCode: req.languageCode ?? state.profile?.languageCode ?? null,
          remindMinutes: req.remindMinutes ?? state.profile?.remindMinutes ?? null,
          daySummary: req.daySummary ?? state.profile?.daySummary ?? true,
          morningAgenda: req.morningAgenda ?? state.profile?.morningAgenda ?? false,
          morningAgendaAt: req.morningAgendaAt ?? state.profile?.morningAgendaAt ?? '08:00',
          botReachable: state.profile?.botReachable ?? true,
          createdAtUtc: state.profile?.createdAtUtc ?? new Date().toISOString(),
        };
        persist();
        return json(toWireProfile(state.profile));
      }
    }
    if (path === '/profile/timezones' && method === 'GET') {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const common = [
        'Europe/Kyiv',
        'Europe/Warsaw',
        'Europe/London',
        'Europe/Berlin',
        'Europe/Paris',
        'America/New_York',
        'America/Los_Angeles',
        'Asia/Dubai',
        'Asia/Almaty',
        'UTC',
      ];
      return json([detected, ...common.filter((z) => z !== detected)]);
    }

    // --- students ---
    if (path === '/students' && method === 'GET') {
      return json(state.students.filter((s) => s.status === 'Active').map(withNextLesson));
    }
    if (path === '/students/archived' && method === 'GET') {
      return json(state.students.filter((s) => s.status === 'Archived').map(withNextLesson));
    }
    if (path === '/students' && method === 'POST') {
      const req = body as CreateStudentRequest;
      if (!req.name || !req.name.trim()) return validation('Name', 'Name is required.');
      const student: StoredStudent = {
        id: crypto.randomUUID(),
        name: req.name.trim(),
        rate: req.rate ?? 0,
        status: 'Active',
        createdAtUtc: new Date().toISOString(),
      };
      state.students.push(student);
      persist();
      return json(withNextLesson(student), 201);
    }
    const studentMatch = path.match(/^\/students\/([^/]+)$/);
    if (studentMatch) {
      const student = state.students.find((s) => s.id === studentMatch[1]);
      if (!student) return notFound();
      if (method === 'GET') return json(withStudentDetails(student));
      if (method === 'PATCH') {
        const req = body as UpdateStudentRequest;
        if (req.name !== undefined && !req.name.trim()) return validation('Name', 'Name is required.');
        if (req.name !== undefined) student.name = req.name.trim();
        if (req.rate !== undefined) student.rate = req.rate;
        if (req.status !== undefined) {
          student.status = req.status;
          // Archiving cascades, mirroring the real backend: the student's current series end
          // YESTERDAY (not today — today's occurrence, if any, is a physical row already handled by
          // the lesson sweep below) and every future non-Completed lesson row is deleted outright.
          // Restoring (Archived -> Active) does NOT resurrect either — no code runs for it here.
          // Simplification (same spirit as applySeriesPatch's schedule-change branch): no
          // `IsCustomized` tracking in this mock's Lesson shape, so a hand-edited future lesson is
          // swept the same as any other.
          if (req.status === 'Archived') {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayKey = localDateKey(yesterday);
            for (const s of state.series.filter((s) => s.studentId === student.id && isSeriesCurrent(s))) {
              s.endDate = yesterdayKey;
            }
            const nowIso = new Date().toISOString();
            state.lessons = state.lessons.filter(
              (l) => !(l.studentId === student.id && l.status !== 'Completed' && l.startUtc > nowIso),
            );
          }
        }
        persist();
        return json(withNextLesson(student));
      }
    }

    // --- student debts (before the series section, no particular ordering requirement — just kept
    // near the other /students/{id}/... reads) ---
    const debtsMatch = path.match(/^\/students\/([^/]+)\/debts$/);
    if (debtsMatch && method === 'GET') {
      const student = state.students.find((s) => s.id === debtsMatch[1]);
      if (!student) return notFound();
      // Newest first (startUtc DESC); subject = topic ?? seriesTitle ?? null, mirroring the backend.
      const unpaid = unpaidCompletedLessonsOf(student.id).sort((a, b) => b.startUtc.localeCompare(a.startUtc));
      const lessons: UnpaidLesson[] = unpaid.map((l) => {
        const series = l.seriesId ? state.series.find((s) => s.id === l.seriesId) : undefined;
        return {
          id: l.dbId,
          startUtc: l.startUtc,
          durationMinutes: l.durationMinutes,
          price: l.price,
          subject: l.topic ?? series?.title ?? null,
        };
      });
      const response: StudentDebtsResponse = {
        lessons,
        totalAmount: lessons.reduce((sum, l) => sum + l.price, 0),
        count: lessons.length,
      };
      return json(response);
    }

    // --- series (before /lessons/{id} — the path is nested; no POST here — series are created
    // through the one `POST /lessons` route below, via `repeat`) ---
    if (path === '/lessons/series' && method === 'GET') {
      return json(state.series);
    }
    const seriesMatch = path.match(/^\/lessons\/series\/([^/]+)(\/cancel)?$/);
    if (seriesMatch) {
      const series = state.series.find((s) => s.id === seriesMatch[1]);
      if (!series) return notFound();
      if (seriesMatch[2] && method === 'POST') {
        const response = cancelSeries(series);
        persist();
        return json(response);
      }
      if (method === 'GET') return json(series);
      if (method === 'PATCH') {
        const result = applySeriesPatch(series, body as UpdateLessonSeriesRequest);
        persist();
        return json(result);
      }
    }

    // --- lessons ---
    if (path === '/lessons' && method === 'GET') {
      const fromIso = url.searchParams.get('from');
      const toIso = url.searchParams.get('to');
      if (!fromIso || !toIso) return json({ errors: { From: ['Required.'], To: ['Required.'] } }, 400);
      const studentId = url.searchParams.get('studentId') ?? undefined;
      const filtered = state.lessons.filter(
        (l) => l.startUtc < toIso && fromIso < l.endUtc && (!studentId || l.studentId === studentId),
      );
      return json(filtered.sort((a, b) => a.startUtc.localeCompare(b.startUtc)).map(toWireLesson));
    }
    if (path === '/lessons' && method === 'POST') {
      const req = body as CreateLessonRequest;
      if (!state.students.some((s) => s.id === req.studentId)) return validation('StudentId', 'Student not found.');
      if (!req.durationMinutes || req.durationMinutes < 15 || req.durationMinutes > 600) {
        return validation('DurationMinutes', 'Duration must be between 15 and 600 minutes.');
      }
      const price = req.price ?? state.students.find((s) => s.id === req.studentId)?.rate ?? 0;
      // Both branches place a lesson by the wall-clock rule in the tutor's PROFILE time zone (see
      // `CreateLessonRequest`'s doc comment), so a saved profile is required either way — not just
      // for a series.
      if (!state.profile) return validation('Profile', 'Set your time zone first via PUT /profile.');

      if (req.repeat) {
        const start = combineLocal(req.date, req.startTimeLocal);
        const end = new Date(start.getTime() + req.durationMinutes * 60_000);
        // Simplified conflict check — the mock only checks the series' first occurrence, not the
        // whole future window a real overlap check would cover.
        const found = overlaps(start.toISOString(), end.toISOString());
        if (found.length) return conflict409(found);
        const newSeries: LessonSeries = {
          id: crypto.randomUUID(),
          studentId: req.studentId,
          title: req.repeat.title ?? null,
          startDate: req.date,
          endDate: req.repeat.endDate ?? null,
          weekdays: req.repeat.weekdays,
          startTimeLocal: `${req.startTimeLocal}:00`.slice(0, 8),
          durationMinutes: req.durationMinutes,
          timeZoneId: state.profile.timeZoneId,
          price: req.price ?? null,
          createdAtUtc: new Date().toISOString(),
        };
        state.series.push(newSeries);
        // Eager generation, same moment the real backend materializes a fresh series' rows.
        generateFutureRows(newSeries, new Date(`${req.date}T00:00`));
        persist();
        const response: CreateLessonResponse = { lesson: null, series: newSeries };
        return json(response, 201);
      }

      const start = combineLocal(req.date, req.startTimeLocal);
      const end = new Date(start.getTime() + req.durationMinutes * 60_000);
      const found = overlaps(start.toISOString(), end.toISOString());
      if (found.length) return conflict409(found);
      const lesson: StoredLesson = {
        dbId: crypto.randomUUID(),
        studentId: req.studentId,
        seriesId: null,
        occurrenceDate: null,
        startUtc: start.toISOString(),
        endUtc: end.toISOString(),
        durationMinutes: req.durationMinutes,
        status: 'Scheduled',
        price,
        isPaid: false,
        topic: req.topic ?? null,
        description: null,
        createdAtUtc: new Date().toISOString(),
      };
      state.lessons.push(lesson);
      persist();
      const response: CreateLessonResponse = { lesson: toWireLesson(lesson), series: null };
      return json(response, 201);
    }

    // --- settle (before /lessons/{id} — "settle" would otherwise match as an id) ---
    if (path === '/lessons/settle' && method === 'POST') {
      const req = body as SettleLessonsRequest;
      const ids = [...new Set(req.lessonIds ?? [])]; // distinct ids only, duplicates deduped
      if (ids.length === 0) return validation('LessonIds', 'Select at least one lesson to settle.');
      const rows = ids.map((id) => state.lessons.find((l) => l.dbId === id));
      if (rows.some((l) => !l)) return validation('LessonIds', 'Some of the selected lessons no longer exist.');
      const found = rows as StoredLesson[];
      if (found.some((l) => l.status !== 'Completed')) {
        return validation('LessonIds', 'Only lessons already recorded as completed can be settled.');
      }
      // All-or-nothing: every id validated above before anything is written. An already-paid id is
      // an idempotent no-op, still counted in `settled`.
      for (const l of found) l.isPaid = true;
      persist();
      const response: SettleLessonsResponse = { settled: found.length };
      return json(response);
    }

    const lessonMatch = path.match(/^\/lessons\/([^/]+)$/);
    if (lessonMatch) {
      const id = lessonMatch[1];
      const lesson = state.lessons.find((l) => l.dbId === id);
      if (!lesson) return notFound();
      if (method === 'GET') return json(toWireLesson(lesson));
      if (method === 'PATCH') {
        const req = body as UpdateLessonRequest;
        if (req.startUtc !== undefined || req.durationMinutes !== undefined) {
          const start = new Date(req.startUtc ?? lesson.startUtc);
          const duration = req.durationMinutes ?? lesson.durationMinutes;
          const startUtc = start.toISOString();
          const endUtc = new Date(start.getTime() + duration * 60_000).toISOString();
          const found = overlaps(startUtc, endUtc, { dbId: lesson.dbId });
          if (found.length) return conflict409(found);
          lesson.startUtc = startUtc;
          lesson.endUtc = endUtc;
          lesson.durationMinutes = duration;
        }
        if (req.status !== undefined) lesson.status = req.status;
        if (req.price !== undefined) lesson.price = req.price;
        if (req.isPaid !== undefined) lesson.isPaid = req.isPaid;
        // Mirrors the backend's `Lesson.ChangeStatus`: cancelling always drops `isPaid`, even if the
        // same request also sent `isPaid: true` — a cancelled lesson owes and is owed nothing.
        if (lesson.status === 'Cancelled') lesson.isPaid = false;
        if (req.topic !== undefined) lesson.topic = req.topic;
        if (req.description !== undefined) lesson.description = req.description;
        persist();
        return json(toWireLesson(lesson));
      }
    }

    // --- reports ---
    if (path === '/reports/dashboard' && method === 'GET') {
      const period = (url.searchParams.get('period') ?? 'week') as DashboardPeriodKind;
      const anchorParam = url.searchParams.get('anchor');
      const anchor = anchorParam ? new Date(`${anchorParam}T00:00`) : new Date();
      return json(buildDashboard(period, anchor));
    }

    return notFound();
  };
}
