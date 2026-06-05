import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { Loading } from '../src/components/ui/Loading';

export default function Index() {
  const { isAuthenticated, isLoading, isAdmin, isTechnician } = useAuth();

  if (isLoading) {
    return <Loading fullScreen message="Cargando..." />;
  }

  if (isAuthenticated) {
    const target = isAdmin ? '/(tabs)/admin' : isTechnician ? '/(tabs)/technician' : '/(tabs)/requester';
    return <Redirect href={target as any} />;
  }

  return <Redirect href="/(auth)/login" />;
}
