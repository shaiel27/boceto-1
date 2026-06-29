import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { Colors } from '../../src/constants/colors';

export default function AuthLayout() {
  return (
    <>
      <Head><title>Autenticacion — Sistema de Tickets</title></Head>
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    /></>
  );
}
