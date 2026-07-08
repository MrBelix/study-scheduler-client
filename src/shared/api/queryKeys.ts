// Query-key factories — shared so features can invalidate each other's caches
// without importing one another.

/**
 * Everything nests under `all`, so a single invalidation after any mutation
 * refreshes ranges, details and series alike.
 */
export const lessonKeys = {
  all: ['lessons'] as const,
  range: (fromIso: string, toIso: string) => ['lessons', 'range', fromIso, toIso] as const,
  detail: (id: string) => ['lessons', 'detail', id] as const,
  seriesList: ['lessons', 'series'] as const,
  series: (id: string) => ['lessons', 'series', id] as const,
};

export const studentKeys = {
  all: ['students'] as const,
};

export const profileKeys = {
  all: ['profile'] as const,
  timezones: ['profile', 'timezones'] as const,
};
