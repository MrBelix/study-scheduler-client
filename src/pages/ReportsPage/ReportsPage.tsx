import { m } from '@/paraglide/messages';
import { Placeholder } from '@/shared/ui';

export function ReportsPage() {
  return <Placeholder glyph="📊" title={m.reports()} description={m.reports_empty_desc()} />;
}
