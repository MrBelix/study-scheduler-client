// Telegram auth failure codes returned by the server on 401.
export type AuthErrorCode = 'invalid_signature' | 'missing_data' | 'unauthorized';

/**
 * One slot from a 409 body: either an existing lesson (`lessonId`) or a future
 * occurrence of an active series (`seriesId`/`seriesTitle`).
 */
export interface LessonConflict {
  lessonId: string | null;
  seriesId: string | null;
  seriesTitle: string | null;
  startUtc: string;
  endUtc: string;
}

/**
 * Normalized API failure. Carries the HTTP status, a machine-readable `code`,
 * (for 400 validation) per-field messages from the RFC 7807 problem body, and
 * (for 409) the list of conflicting slots.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string[]>;
  readonly conflicts?: LessonConflict[];

  constructor(status: number, code: string, fields?: Record<string, string[]>, conflicts?: LessonConflict[]) {
    super(`API ${status}: ${code}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.conflicts = conflicts;
  }

  /** Build from a failed Response, parsing the server's error shapes. */
  static async fromResponse(res: Response): Promise<ApiError> {
    let code = res.statusText || 'error';
    let fields: Record<string, string[]> | undefined;
    let conflicts: LessonConflict[] | undefined;

    try {
      const body = await res.json();
      if (Array.isArray(body?.conflicts)) {
        code = 'conflict'; // 409: { message, conflicts: [...] }
        conflicts = body.conflicts;
      } else if (typeof body?.error === 'string') {
        code = body.error; // 401: { error: "invalid_signature" | ... }
      } else if (body?.errors) {
        code = body.title ?? 'validation_error'; // 400: ProblemDetails
        fields = body.errors;
      }
    } catch {
      // non-JSON body — keep the status text
    }

    return new ApiError(res.status, code, fields, conflicts);
  }
}
