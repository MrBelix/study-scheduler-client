import { getRawInitData } from '@/shared/tg';
import { ApiError } from './errors';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * Single entry point for HTTP calls. Attaches the Telegram auth header,
 * sets JSON content type when there's a body, and normalizes failures to
 * {@link ApiError}. Pass `init.signal` to make a request cancellable.
 */
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  const raw = getRawInitData();
  if (raw) headers.set('Authorization', `tma ${raw}`);
  if (init.body !== undefined) headers.set('Content-Type', 'application/json');

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (!res.ok) throw await ApiError.fromResponse(res);

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
