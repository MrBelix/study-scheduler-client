// Telegram auth failure codes returned by the server on 401.
export type AuthErrorCode = 'expired' | 'invalid_signature' | 'missing_data' | 'unauthorized';

/**
 * Normalized API failure. Carries the HTTP status, a machine-readable `code`,
 * and (for 400 validation) per-field messages from the RFC 7807 problem body.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string[]>;

  constructor(status: number, code: string, fields?: Record<string, string[]>) {
    super(`API ${status}: ${code}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }

  /** Session init data expired — the user must reopen the Mini App. */
  get isAuthExpired(): boolean {
    return this.status === 401 && this.code === 'expired';
  }

  /** Build from a failed Response, parsing the server's error shapes. */
  static async fromResponse(res: Response): Promise<ApiError> {
    let code = res.statusText || 'error';
    let fields: Record<string, string[]> | undefined;

    try {
      const body = await res.json();
      if (typeof body?.error === 'string') {
        code = body.error; // 401: { error: "expired" | ... }
      } else if (body?.errors) {
        code = body.title ?? 'validation_error'; // 400: ProblemDetails
        fields = body.errors;
      }
    } catch {
      // non-JSON body — keep the status text
    }

    return new ApiError(res.status, code, fields);
  }
}
