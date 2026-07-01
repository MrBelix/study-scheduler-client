import { m } from '@/paraglide/messages';
import { Placeholder } from '@/shared/ui';

export function SchedulePage() {
  return <Placeholder glyph="🗓️" title={m.schedule()} description={m.schedule_empty_desc()} />;
}
