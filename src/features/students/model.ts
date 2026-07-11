import type { Student } from '@/shared/api';
import { m } from '@/paraglide/messages';
import { fmt } from '@/shared/lib';

/**
 * List-row subtitle: "{subject} · {rate} ₴/год", or a muted placeholder.
 * `subject` is a derived value (e.g. subjects from active series).
 */
export function studentSubtitle(student: Student, subject?: string): { text: string; muted: boolean } {
  if (!subject) return { text: m.subject_none(), muted: true };
  if (student.rate) {
    return { text: m.subtitle_subject_rate({ subject, rate: fmt(student.rate) }), muted: false };
  }
  return { text: subject, muted: false };
}
