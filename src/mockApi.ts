// Dev-only in-memory API mock (enabled via VITE_API_MOCK, see .env.development).
// Implements enough of the StudyScheduler backend to develop every screen
// without running it: students CRUD, profile upsert, lessons with lazy series
// materialization, overlap 409s and field-level 400s. State persists in
// localStorage — clear the key below (or bump the version) to reseed.
import type {
  Student,
  Profile,
  Lesson,
  LessonSeries,
  LessonStatus,
} from '@/shared/api';

const STORAGE_KEY = 'mock-api-v4'; // v4: profile.botReachable
const LATENCY_MS = 250;
const BASE = import.meta.env.VITE_API_URL ?? '';

interface MockState {
  profile: Profile | null;
  students: Student[];
  lessons: Lesson[];
  series: LessonSeries[];
}

const WEEKDAY_FLAGS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const localDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function seed(): MockState {
  const now = new Date();
  const day = (offset: number, h: number, min = 0) =>
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, h, min);
  const students: Student[] = [
    { id: crypto.randomUUID(), name: 'Марія Коваленко', rate: 450, status: 'Active', createdAtUtc: day(-30, 12).toISOString() },
    { id: crypto.randomUUID(), name: 'Іван Петренко', rate: 300, status: 'Active', createdAtUtc: day(-20, 12).toISOString() },
    { id: crypto.randomUUID(), name: 'Оля Шевчук', rate: 0, status: 'Archived', createdAtUtc: day(-60, 12).toISOString() },
  ];
  const series: LessonSeries[] = [
    {
      id: crypto.randomUUID(),
      studentId: students[0].id,
      title: 'Математика',
      startDate: localDateKey(day(-14, 0)),
      endDate: null,
      weekdays: 'Monday, Thursday',
      startTimeLocal: '16:00:00',
      durationMinutes: 60,
      timeZoneId: Intl.DateTimeFormat().resolvedOptions().timeZone,
      price: null,
      createdAtUtc: day(-14, 12).toISOString(),
    },
  ];
  const oneOff = (studentId: string, offset: number, h: number, status: LessonStatus, isPaid: boolean, topic: string | null): Lesson => ({
    id: crypto.randomUUID(),
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
    isVirtual: false,
    createdAtUtc: day(offset - 7, 12).toISOString(),
  });
  return {
    profile: {
      timeZoneId: Intl.DateTimeFormat().resolvedOptions().timeZone,
      languageCode: null,
      remindMinutes: 30,
      notifyAfterLesson: true,
      botReachable: true,
      createdAtUtc: day(-30, 0).toISOString(),
    },
    students,
    series,
    lessons: [
      oneOff(students[1].id, -1, 10, 'Completed', true, 'Кінематика'),
      oneOff(students[1].id, 2, 10, 'Scheduled', false, null),
      oneOff(students[1].id, 3, 9, 'Cancelled', false, null),
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

export function installMockApi() {
  const state = load();
  const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  persist();

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
  const validation = (field: string, message: string) => json({ errors: { [field]: [message] } }, 400);
  const notFound = () => json({}, 404);

  /** Virtual slots of active series inside [from, to), skipping materialized dates. Read-only. */
  const virtualSlots = (from: Date, to: Date): Lesson[] => {
    const slots: Lesson[] = [];
    for (const s of state.series) {
      const [h, min] = s.startTimeLocal.split(':').map(Number);
      const wanted = new Set(s.weekdays.split(',').map((w) => w.trim()));
      for (let d = new Date(from.getFullYear(), from.getMonth(), from.getDate()); d < to; d.setDate(d.getDate() + 1)) {
        const key = localDateKey(d);
        if (key < s.startDate || (s.endDate && key > s.endDate)) continue;
        if (!wanted.has(WEEKDAY_FLAGS[(d.getDay() + 6) % 7])) continue;
        if (state.lessons.some((l) => l.seriesId === s.id && l.occurrenceDate === key)) continue;
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, min);
        slots.push({
          id: null,
          studentId: s.studentId,
          seriesId: s.id,
          occurrenceDate: key,
          startUtc: start.toISOString(),
          endUtc: new Date(start.getTime() + s.durationMinutes * 60_000).toISOString(),
          durationMinutes: s.durationMinutes,
          status: 'Scheduled',
          price: s.price ?? state.students.find((st) => st.id === s.studentId)?.rate ?? 0,
          isPaid: false,
          topic: null,
          description: null,
          isVirtual: true,
          createdAtUtc: s.createdAtUtc,
        });
      }
    }
    return slots;
  };

  // Overlap check mirrors the backend: physical lessons AND unmaterialized series slots collide.
  const overlaps = (
    startIso: string,
    endIso: string,
    ignore?: { lessonId?: string | null; seriesId?: string | null; occurrenceDate?: string | null },
  ) => {
    const windowFrom = new Date(new Date(startIso).getTime() - 86_400_000);
    const windowTo = new Date(new Date(endIso).getTime() + 86_400_000);
    return [...state.lessons, ...virtualSlots(windowFrom, windowTo)].filter(
      (l) =>
        l.status !== 'Cancelled' &&
        !(ignore?.lessonId != null && l.id === ignore.lessonId) &&
        !(ignore?.seriesId != null && l.seriesId === ignore.seriesId && l.occurrenceDate === ignore.occurrenceDate) &&
        l.startUtc < endIso &&
        startIso < l.endUtc,
    );
  };
  const conflict409 = (found: Lesson[]) =>
    json(
      {
        message: 'The requested time overlaps existing lessons or series.',
        conflicts: found.map((l) => {
          const s = l.seriesId ? state.series.find((x) => x.id === l.seriesId) : undefined;
          return { lessonId: l.id, seriesId: l.seriesId, seriesTitle: s?.title ?? null, startUtc: l.startUtc, endUtc: l.endUtc };
        }),
      },
      409,
    );

  // Shared patch pipeline — same partial-update semantics for physical lessons
  // and freshly materialized slots; re-checks overlaps when the time changes.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- parsed request JSON, shape enforced by the client's typed api layer
  const applyPatch = (lesson: Lesson, body: any): Response => {
    if (body.startUtc !== undefined || body.durationMinutes !== undefined) {
      const start = new Date(body.startUtc ?? lesson.startUtc);
      const duration = body.durationMinutes ?? lesson.durationMinutes;
      const startUtc = start.toISOString();
      const endUtc = new Date(start.getTime() + duration * 60_000).toISOString();
      const found = overlaps(startUtc, endUtc, {
        lessonId: lesson.id,
        seriesId: lesson.seriesId,
        occurrenceDate: lesson.occurrenceDate,
      });
      if (found.length) return conflict409(found);
      lesson.startUtc = startUtc;
      lesson.endUtc = endUtc;
      lesson.durationMinutes = duration;
    }
    if (body.status !== undefined) lesson.status = body.status;
    if (body.price !== undefined) lesson.price = body.price;
    if (body.isPaid !== undefined) lesson.isPaid = body.isPaid;
    if (body.topic !== undefined) lesson.topic = body.topic;
    if (body.description !== undefined) lesson.description = body.description;
    persist();
    return json(lesson);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- parsed request JSON, shape enforced by the client's typed api layer
  const handle = (method: string, path: string, query: URLSearchParams, body: any): Response => {
    // --- profile ---
    if (path === '/profile/timezones') {
      return json(Intl.supportedValuesOf('timeZone'));
    }
    if (path === '/profile') {
      if (method === 'PUT') {
        if (!body?.timeZoneId) return validation('TimeZoneId', 'Time zone is required.');
        state.profile = {
          timeZoneId: body.timeZoneId,
          languageCode: body.languageCode ?? state.profile?.languageCode ?? null,
          // 0 turns reminders off; an omitted field keeps the stored value (backend parity).
          // Stored null means "off" and must survive unrelated saves — no ?? fallback here.
          remindMinutes:
            body.remindMinutes != null
              ? body.remindMinutes === 0 ? null : body.remindMinutes
              : state.profile ? state.profile.remindMinutes : 30,
          notifyAfterLesson: body.notifyAfterLesson ?? state.profile?.notifyAfterLesson ?? true,
          // Optimistic default, matching the server; the mock has no bot to flip it false.
          botReachable: true,
          createdAtUtc: state.profile?.createdAtUtc ?? new Date().toISOString(),
        };
        persist();
        return json(state.profile);
      }
      return state.profile ? json(state.profile) : notFound();
    }

    // --- students ---
    if (path === '/students') {
      if (method === 'POST') {
        if (!body?.name?.trim()) return validation('Name', 'Name is required.');
        const student: Student = {
          id: crypto.randomUUID(),
          name: body.name,
          rate: body.rate ?? 0,
          status: 'Active',
          createdAtUtc: new Date().toISOString(),
        };
        state.students.push(student);
        persist();
        return json(student, 201);
      }
      return json(state.students);
    }
    const studentMatch = path.match(/^\/students\/([^/]+)$/);
    if (studentMatch) {
      const student = state.students.find((s) => s.id === studentMatch[1]);
      if (!student) return notFound();
      if (method === 'PATCH') {
        if (body.name !== undefined && !body.name.trim()) return validation('Name', 'Name is required.');
        Object.assign(student, Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined)));
        persist();
      }
      return json(student);
    }

    // --- series (before /lessons/{id} — the path is nested) ---
    if (path === '/lessons/series') {
      if (method === 'POST') {
        if (!state.profile) return validation('Profile', 'Set your time zone first via PUT /profile.');
        if (!state.students.some((s) => s.id === body?.studentId)) return validation('StudentId', 'Student not found.');
        const series: LessonSeries = {
          id: crypto.randomUUID(),
          studentId: body.studentId,
          title: body.title ?? null,
          startDate: body.startDate,
          endDate: body.endDate ?? null,
          weekdays: body.weekdays,
          startTimeLocal: body.startTimeLocal,
          durationMinutes: body.durationMinutes,
          timeZoneId: state.profile.timeZoneId,
          price: body.price ?? null,
          createdAtUtc: new Date().toISOString(),
        };
        state.series.push(series);
        persist();
        return json(series, 201);
      }
      return json(state.series);
    }
    // Mutates one slot by its original date, materializing it on demand.
    const occurrenceMatch = path.match(/^\/lessons\/series\/([^/]+)\/occurrences\/([^/]+)$/);
    if (occurrenceMatch && method === 'PATCH') {
      const series = state.series.find((s) => s.id === occurrenceMatch[1]);
      if (!series) return notFound();
      const date = occurrenceMatch[2];
      const existing = state.lessons.find((l) => l.seriesId === series.id && l.occurrenceDate === date);
      if (existing) return applyPatch(existing, body);
      const dayStart = new Date(`${date}T00:00`);
      const slot = virtualSlots(dayStart, new Date(dayStart.getTime() + 86_400_000)).find(
        (l) => l.seriesId === series.id && l.occurrenceDate === date,
      );
      if (!slot) return notFound();
      const lesson: Lesson = { ...slot, id: crypto.randomUUID(), isVirtual: false, createdAtUtc: new Date().toISOString() };
      state.lessons.push(lesson);
      return applyPatch(lesson, body);
    }

    const seriesMatch = path.match(/^\/lessons\/series\/([^/]+)(\/cancel)?$/);
    if (seriesMatch) {
      const series = state.series.find((s) => s.id === seriesMatch[1]);
      if (!series) return notFound();
      if (seriesMatch[2] && method === 'POST') {
        // End(today): tighten endDate, then remove future materialized overrides (> today).
        const today = localDateKey(new Date());
        if (!series.endDate || series.endDate > today) series.endDate = today;
        const removedLessons = state.lessons.filter(
          (l) => l.seriesId === series.id && l.occurrenceDate != null && l.occurrenceDate > today,
        );
        state.lessons = state.lessons.filter((l) => !removedLessons.includes(l));
        persist();
        return json({ series, removedLessons });
      }
      if (method === 'PATCH') {
        if (body.title !== undefined) series.title = body.title;
        if (body.price !== undefined) series.price = body.price;
        persist();
      }
      return json(series);
    }

    // --- lessons ---
    if (path === '/lessons') {
      if (method === 'POST') {
        if (!state.students.some((s) => s.id === body?.studentId)) return validation('StudentId', 'Student not found.');
        if (!body.durationMinutes || body.durationMinutes < 15 || body.durationMinutes > 600)
          return validation('DurationMinutes', 'Duration must be between 15 and 600 minutes.');
        const startUtc = new Date(body.startUtc).toISOString();
        const endUtc = new Date(new Date(body.startUtc).getTime() + body.durationMinutes * 60_000).toISOString();
        const found = overlaps(startUtc, endUtc);
        if (found.length) return conflict409(found);
        const lesson: Lesson = {
          id: crypto.randomUUID(),
          studentId: body.studentId,
          seriesId: null,
          occurrenceDate: null,
          startUtc,
          endUtc,
          durationMinutes: body.durationMinutes,
          status: 'Scheduled',
          price: body.price ?? state.students.find((s) => s.id === body.studentId)?.rate ?? 0,
          isPaid: false,
          topic: body.topic ?? null,
          description: body.description ?? null,
          isVirtual: false,
          createdAtUtc: new Date().toISOString(),
        };
        state.lessons.push(lesson);
        persist();
        return json(lesson, 201);
      }
      // Read-only: physical lessons merged with virtual slots, clipped to the range.
      const from = new Date(query.get('from') ?? '');
      const to = new Date(query.get('to') ?? '');
      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from)
        return validation('from', 'Invalid range.');
      const fromIso = from.toISOString();
      const toIso = to.toISOString();
      return json(
        [...state.lessons, ...virtualSlots(from, to)].filter((l) => l.startUtc < toIso && fromIso < l.endUtc),
      );
    }
    const lessonMatch = path.match(/^\/lessons\/([^/]+)$/);
    if (lessonMatch) {
      const lesson = state.lessons.find((l) => l.id === lessonMatch[1]);
      if (!lesson) return notFound();
      if (method === 'PATCH') return applyPatch(lesson, body);
      return json(lesson);
    }

    return notFound();
  };

  const origFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (!url.startsWith(`${BASE}/`)) return origFetch(input, init);
    const [pathPart, queryPart] = url.slice(BASE.length).split('?');
    const method = init?.method ?? 'GET';
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    await new Promise((r) => setTimeout(r, LATENCY_MS));
    const res = handle(method, pathPart, new URLSearchParams(queryPart), body);
    console.info(`[mock-api] ${method} ${pathPart} → ${res.status}`);
    return res;
  };
  console.info(`[mock-api] enabled — state in localStorage["${STORAGE_KEY}"], remove it to reseed`);
}
