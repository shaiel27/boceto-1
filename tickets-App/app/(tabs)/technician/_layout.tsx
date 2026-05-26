import { Stack } from 'expo-router';
import { Colors } from '../../../src/constants/colors';

export default function TechnicianLayout() {
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
      <Stack.Screen
        name="[id]"
        options={{ title: 'Detalle del Ticket' }}
      />
      <Stack.Screen
        name="profile"
        options={{ title: 'Mi Perfil' }}
      />
      <Stack.Screen
        name="assistance"
        options={{ title: 'Solicitar Asistencia', presentation: 'modal' }}
      />
    </Stack>
  );
}
