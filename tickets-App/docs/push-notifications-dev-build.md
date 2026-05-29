# Push Notifications — Development Build

## Problema

Expo Go (SDK 54) ya no soporta `getExpoPushTokenAsync()` para notificaciones push remotas (FCM/APNs). El error:

> expo-notifications: Android Push notifications functionality was removed from Expo Go with the release of SDK 53. Use a development build instead of Expo Go.

## Solución definitiva: Development Build

### 1. Requisitos

```bash
npm install -g eas-cli
eas login
```

### 2. Agregar al `app.json`

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.alcaldia.tickets"
    },
    "android": {
      "package": "com.alcaldia.tickets"
    }
  }
}
```

### 3. Generar build de desarrollo

```bash
eas build --platform android --profile development
```

### 4. Ejecutar con el dev client

```bash
npx expo start --dev-client
```

Instalar el `.apk` generado en el dispositivo y escanear el QR desde él (no desde Expo Go).

### 5. Notas

- Solo se necesita regenerar el build al agregar/quitar módulos nativos o plugins
- Hot reload y fast refresh funcionan igual que en Expo Go
- Para iOS se requiere Apple Developer account ($99/año)

## Solución temporal: código condicional

Si se necesita seguir usando Expo Go mientras tanto, envolver el registro de push token:

```ts
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

async function registerForPushNotifications(): Promise<string | null> {
  if (isExpoGo) return null; // Saltar en Expo Go
  // ... resto del código
}
```

El polling de notificaciones (cada 30s) y las notificaciones locales **sí funcionan** en Expo Go.
