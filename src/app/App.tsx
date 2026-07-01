import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { ApiError } from '@/shared/api';
import { LocaleProvider, useLocale } from '@/shared/i18n';
import { router } from './router';

const queryClient = new QueryClient({
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

// Keyed by locale so switching language re-renders the whole route tree
// (incl. the tab bar) — components that don't read the locale context otherwise
// wouldn't update. The `router` singleton keeps the current URL across remount.
function AppRoutes() {
  const { locale } = useLocale();
  return <RouterProvider key={locale} router={router} />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <AppRoutes />
      </LocaleProvider>
    </QueryClientProvider>
  );
}
