import { useEffect, useState } from 'react';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { m } from '@/paraglide/messages';
import { ApiError } from '@/shared/api';
import { Placeholder } from '@/shared/ui';
import { LocaleProvider, useLocale, type AppLocale } from '@/shared/i18n';
import { useProfile } from '@/features/profile/queries';
import { OnboardingPage } from '@/pages/Onboarding/OnboardingPage';
import { router } from './router';

// Auth expiry is handled once, centrally: any query or mutation failing with
// a 401 "expired" flips the app into a full-screen "reopen the Mini App"
// state — pages don't need their own isAuthExpired branches.
function createQueryClient(onAuthExpired: () => void) {
  const handleError = (error: unknown) => {
    if (error instanceof ApiError && error.isAuthExpired) onAuthExpired();
  };
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleError }),
    mutationCache: new MutationCache({ onError: handleError }),
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
  if (decision === 'onboarding') return <OnboardingPage onDone={() => setDecision('app')} />;
  return <AppRoutes />;
}

const APP_LOCALES: AppLocale[] = ['uk', 'en'];

// The server-side member settings win over the device: a language chosen on
// one device follows the tutor to the next. No-ops until the profile loads.
function ProfileLocaleSync() {
  const { data: profile } = useProfile();
  const { locale, setLocale } = useLocale();
  const code = profile?.languageCode;

  useEffect(() => {
    if (code && code !== locale && APP_LOCALES.includes(code as AppLocale)) {
      setLocale(code as AppLocale);
    }
  }, [code, locale, setLocale]);

  return null;
}

// Terminal state: the init data can only be refreshed by reopening the app.
function AuthExpiredScreen() {
  const { locale } = useLocale(); // re-render if the locale flips underneath
  return (
    <Placeholder
      key={locale}
      glyph="🔒"
      title={m.error_screen_title_auth()}
      description={m.error_screen_hint_auth()}
    />
  );
}

export function App() {
  const [authExpired, setAuthExpired] = useState(false);
  const [queryClient] = useState(() => createQueryClient(() => setAuthExpired(true)));

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        {authExpired ? (
          <AuthExpiredScreen />
        ) : (
          <>
            <ProfileLocaleSync />
            <RootGate />
          </>
        )}
      </LocaleProvider>
    </QueryClientProvider>
  );
}
