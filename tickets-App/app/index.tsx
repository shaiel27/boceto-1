import { Redirect, Stack } from 'expo-router';
import { Loading } from '../src/components/ui/Loading';
import { useAuth } from '../src/hooks/useAuth';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen message="Cargando..." />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/technician" />;
  }

  return <Redirect href="/(auth)/login" />;
}
