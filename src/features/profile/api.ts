import { apiRequest } from '@/shared/api';
import type { Profile, UpdateProfileRequest } from '@/shared/api';

/** `GET /profile` — 404 until the tutor saves a time zone. */
export const getProfile = (signal?: AbortSignal) =>
  apiRequest<Profile>('/profile', { signal });

/** `PUT /profile` — upsert the tutor's time zone. */
export const putProfile = (body: UpdateProfileRequest) =>
  apiRequest<Profile>('/profile', { method: 'PUT', body: JSON.stringify(body) });

/** `GET /profile/timezones` — IANA time zone ids the server accepts. */
export const getTimeZones = (signal?: AbortSignal) =>
  apiRequest<string[]>('/profile/timezones', { signal });
