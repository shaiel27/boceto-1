import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ToastProvider } from '../src/contexts/ToastContext';
import { TicketProvider } from '../src/contexts/TicketContext';
import { NotificationProvider } from '../src/contexts/NotificationContext';
import { useAuth } from '../src/hooks/useAuth';
import { Colors } from '../src/constants/colors';
import { Loading } from '../src/components/ui/Loading';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const wasAuthenticated = useRef(isAuthenticated);
  const initialLoadDone = useRef(false);
  const lastRedirect = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && lastRedirect.current !== 'login') {
      router.replace('/(auth)/login');
      lastRedirect.current = 'login';
      initialLoadDone.current = true;
    } else if (isAuthenticated && !wasAuthenticated.current) {
      const target = isAdmin ? '/admin' : '/technician';
      router.replace(`/(tabs)${target}` as any);
      lastRedirect.current = isAdmin ? 'admin' : 'technician';
      initialLoadDone.current = true;
    }

    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, isLoading]);

  if (!initialLoadDone.current && isLoading) {
    return <Loading fullScreen message="Cargando..." />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <TicketProvider>
          <NotificationProvider>
            <StatusBar style="light" />
            <AuthGate>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: Colors.background },
                  animation: 'slide_from_right',
                }}
              />
            </AuthGate>
          </NotificationProvider>
        </TicketProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
