import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { Colors } from '../../../src/constants/colors';

export default function TechnicianLayout() {
  return (
    <>
      <Head><title>Panel Tecnico — Sistema de Tickets</title></Head>
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '600', fontSize: 16 },
        headerBackTitle: 'Volver',
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="history" options={{ title: 'Historial' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalle' }} />
      <Stack.Screen name="profile" options={{ title: 'Perfil' }} />
      <Stack.Screen name="assistance" options={{ title: 'Asistencia', presentation: 'modal' }} />
    </Stack></>
  );
}
