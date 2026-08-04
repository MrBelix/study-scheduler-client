import { Navigate, useSearchParams } from 'react-router-dom';
import { routes } from '@/shared/routing';

/**
 * `/lessons/series/new` — legacy route from before F8 merged the two create
 * forms into one. Kept only so old links/preselects still resolve; redirects
 * to the unified form with the "Щотижня" repeat mode preset. New navigation
 * should target `routes.lessons.new({ repeat: 'weekly' })` directly.
 */
export function SeriesNewRedirect() {
  const [params] = useSearchParams();
  const studentId = params.get('studentId') ?? undefined;
  return <Navigate to={routes.lessons.new({ studentId, repeat: 'weekly' })} replace />;
}
