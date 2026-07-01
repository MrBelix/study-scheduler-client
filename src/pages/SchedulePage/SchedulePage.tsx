import { NavHeader, Placeholder } from '@/shared/ui';

export function SchedulePage() {
  return (
    <div>
      <NavHeader title="Розклад" />
      <Placeholder glyph="🗓️" title="Розклад" description="Тут з'явиться список занять на сьогодні." />
    </div>
  );
}
