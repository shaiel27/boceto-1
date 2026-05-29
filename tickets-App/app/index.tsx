import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { Loading } from '../src/components/ui/Loading';

export default function Index() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return <Loading fullScreen message="Cargando..." />;
  }

  if (isAuthenticated) {
    const target = isAdmin ? '/(tabs)/admin' : '/(tabs)/technician';
    return <Redirect href={target as any} />;
  }

  return <Redirect href="/(auth)/login" />;
}
