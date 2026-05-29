import { Stack } from 'expo-router';
import { Colors } from '../../../src/constants/colors';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.textOnPrimary,
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitle: 'Volver',
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="tickets" options={{ title: 'Gestión de Tickets' }} />
      <Stack.Screen name="tickets/create" options={{ title: 'Nuevo Ticket', presentation: 'modal' }} />
      <Stack.Screen name="technicians" options={{ title: 'Gestión de Técnicos' }} />
      <Stack.Screen name="users" options={{ title: 'Gestión de Usuarios' }} />
      <Stack.Screen name="reports" options={{ title: 'Reportes' }} />
    </Stack>
  );
}
