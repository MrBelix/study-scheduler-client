import { useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { ApiError } from '@/shared/api';
import { LocaleProvider, useLocale, type AppLocale } from '@/shared/i18n';
import { ToastHost } from '@/shared/ui';
import { useProfile } from '@/features/profile/queries';
import { OnboardingPage } from '@/pages/Onboarding/OnboardingPage';
import { GlobalProgressBar } from './GlobalProgressBar/GlobalProgressBar';
import { router } from './router';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false, // Telegram WebView fires focus often — avoid refetch storms
        retry: (count, error) => {
          // Client errors (401/400/404) won't fix themselves — don't retry.
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
          return count < 2;
        },
      },
    },
  });
}

// Keyed by locale so switching language re-renders the whole route tree
// (incl. the tab bar) — components that don't read the locale context otherwise
// wouldn't update. The `router` singleton keeps the current URL across remount.
function AppRoutes() {
  const { locale } = useLocale();
  return <RouterProvider key={locale} router={router} />;
}

// First-run gate: decide ONCE, when the profile query first settles, whether to
// show onboarding. The decision latches via the "adjust state during render"
// pattern — once it leaves `loading` the guard below never re-runs, so when
// step 1 saves the profile (flipping `isNotFound` to false) the wizard stays
// mounted until it calls `onDone`.
function RootGate() {
  const { isNotFound, isPending } = useProfile();
  const [decision, setDecision] = useState<'loading' | 'onboarding' | 'app'>('loading');

  if (decision === 'loading' && !isPending) {
    setDecision(isNotFound ? 'onboarding' : 'app'); // no profile → onboard; else → app
  }

  if (decision === 'loading') return null; // brief: profile still loading
  if (decision === 'onboarding') {
    return (
      <OnboardingPage
        onDone={(path) => {
          // Navigate the router singleton before `AppRoutes` ever mounts, so
          // `RouterProvider` picks up the target location on its first render
          // (used by O4's "set one manually" exit) — react-router supports
          // calling `router.navigate()` imperatively from outside React.
          if (path) router.navigate(path);
          setDecision('app');
        }}
      />
    );
  }
  return <AppRoutes />;
}

const APP_LOCALES: AppLocale[] = ['uk', 'en'];

// The server-side member settings win over the device — but ONLY at startup.
// This is a one-shot sync, latched via a ref: the first time the profile
// query carries a real `languageCode`, it's applied (if valid and different)
// and the latch closes for the rest of the session. `code` stays undefined
// while onboarding is in progress (the profile is a 404), so the latch isn't
// consumed until a real profile exists — the first post-onboarding load still
// gets a sync, it's just a no-op because `LanguageStep` already set the locale.
//
// Without the latch this raced `ProfilePage.pickLanguage()`: that handler
// calls `setLocale(next)` optimistically and only then `saveProfile.mutate`.
// This effect would still see the stale cached profile and immediately call
// `setLocale(old)` (remount #2, reverting the language), then fire again once
// the PUT's `onSuccess` cache update lands (remount #3) — a visible
// new → old → new flicker. Post-startup, the local pick is authoritative: it's
// persisted via PUT anyway, a failed PUT surfaces through the existing
// `saveProfile.isError` toast, and the next app start re-syncs from the server.
function ProfileLocaleSync() {
  const { data: profile } = useProfile();
  const { locale, setLocale } = useLocale();
  const code = profile?.languageCode;
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current || !code) return; // wait for a real (post-onboarding) profile
    synced.current = true;
    if (code !== locale && APP_LOCALES.includes(code as AppLocale)) {
      setLocale(code as AppLocale);
    }
  }, [code, locale, setLocale]);

  return null;
}

export function App() {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalProgressBar />
      <ToastHost />
      <LocaleProvider>
        <ProfileLocaleSync />
        <RootGate />
      </LocaleProvider>
    </QueryClientProvider>
  );
}
