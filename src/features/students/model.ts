import type { Student } from '@/shared/api';
import { m } from '@/paraglide/messages';
import { fmt } from '@/shared/lib';

/**
 * List-row subtitle: "{subject} · {rate} ₴/год", or a muted placeholder.
 * `subject` defaults to the student's own field; pass a derived value (e.g.
 * subjects from active series) to override it.
 */
export function studentSubtitle(student: Student, subject = student.subject): { text: string; muted: boolean } {
  if (!subject) return { text: m.subject_none(), muted: true };
  if (student.rate) {
    return { text: m.subtitle_subject_rate({ subject, rate: fmt(student.rate) }), muted: false };
  }
  return { text: subject, muted: false };
}
