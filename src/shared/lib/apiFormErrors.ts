import { m } from '@/paraglide/messages';
import { ApiError } from '@/shared/api';
import type { LessonConflict } from '@/shared/api';

export interface ApiFormErrors {
  /** 409 payload, when the save collided with existing slots. */
  conflicts?: LessonConflict[];
  /** Raw 400 per-field messages (backend keys are PascalCase DTO properties). */
  fields?: Record<string, string[]>;
  /** First message for a field, tolerating camelCase keys from the server. */
  fieldError: (key: string) => string | undefined;
  /** Messages whose field is not rendered by the form (not in `mappedKeys`). */
  unmappedMessages: string[];
  /** One generic line when the error carries neither fields nor conflicts. */
  genericError: string | undefined;
}

/**
 * Error breakdown of the last save attempt: 400 validation messages map to
 * their fields, 409s expose conflicts, anything else surfaces as one generic
 * line under the form.
 */
export function apiFormErrors(error: unknown, mappedKeys: string[] = []): ApiFormErrors {
  const conflicts = error instanceof ApiError ? error.conflicts : undefined;
  const fields = error instanceof ApiError ? error.fields : undefined;
  const fieldError = (key: string) => (fields?.[key] ?? fields?.[key.toLowerCase()])?.[0];
  const unmappedMessages = fields
    ? Object.entries(fields)
        .filter(([key]) => !mappedKeys.some((k) => k.toLowerCase() === key.toLowerCase()))
        .flatMap(([, messages]) => messages)
    : [];
  const genericError = error && !conflicts && !fields ? m.form_error_save() : undefined;
  return { conflicts, fields, fieldError, unmappedMessages, genericError };
}
