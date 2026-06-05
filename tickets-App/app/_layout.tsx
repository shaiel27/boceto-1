import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../src/contexts/ToastContext';
import { TicketProvider } from '../src/contexts/TicketContext';
import { NotificationProvider } from '../src/contexts/NotificationContext';
import { ToastRenderer } from '../src/components/ui/ToastRenderer';
import { useAuth } from '../src/hooks/useAuth';
import { Colors } from '../src/constants/colors';
import { Loading } from '../src/components/ui/Loading';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, initialized, isAdmin, isTechnician } = useAuth();
  const lastRedirect = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading || !initialized) return;

    if (!isAuthenticated && lastRedirect.current !== 'login') {
      router.replace('/(auth)/login');
      lastRedirect.current = 'login';
    } else if (isAuthenticated) {
      const target = isAdmin ? '/admin' : isTechnician ? '/technician' : '/requester';
      router.replace(`/(tabs)${target}` as any);
      lastRedirect.current = isAdmin ? 'admin' : isTechnician ? 'technician' : 'requester';
    }
  }, [isAuthenticated, isLoading, initialized]);

  if (!initialized) {
    return <Loading fullScreen message="Cargando..." />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const { restoreSession, initialized } = useAuth();

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <TicketProvider>
          <NotificationProvider>
            <StatusBar style="light" />
            {initialized ? (
              <AuthGate>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: Colors.background },
                    animation: 'slide_from_right',
                  }}
                />
              </AuthGate>
            ) : (
              <Loading fullScreen message="Cargando..." />
            )}
            <ToastRenderer />
          </NotificationProvider>
        </TicketProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
