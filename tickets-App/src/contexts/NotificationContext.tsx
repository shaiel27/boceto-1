import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import {
  fetchNotifications,
  fetchUnreadCount,
  AppNotification,
} from '../services/notificationService';

let Notifications: any = null;
let pushAvailable = false;

try {
  Notifications = require('expo-notifications');
  pushAvailable = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  pushAvailable = false;
}

async function registerForPushNotifications(): Promise<string | null> {
  if (!pushAvailable || !Notifications) return null;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('tickets', {
        name: 'Asignaciones de Tickets',
        importance: Notifications.AndroidImportance?.HIGH ?? 4,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch {
    return null;
  }
}

async function scheduleLocalNotification(title: string, body: string, ticketId: number | null, notificationId: number) {
  if (!pushAvailable || !Notifications) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { ticketId, notificationId },
      },
      trigger: null,
    });
  } catch {}
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastIdRef = useRef(0);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const [notifs, count] = await Promise.all([
        fetchNotifications(20),
        fetchUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);

      const newNotifs = notifs.filter((n) => n.id > lastIdRef.current && !n.isRead);
      if (newNotifs.length > 0 && lastIdRef.current > 0) {
        for (const n of newNotifs) {
          await scheduleLocalNotification(
            n.title,
            n.message,
            n.ticketId,
            n.id,
          );
        }
      }

      if (notifs.length > 0) {
        lastIdRef.current = notifs[0].id;
      }
    } catch {}
  }, [isAuthenticated]);

  const contextMarkAsRead = useCallback(async (id: number) => {
    const { markAsRead: apiMarkAsRead } = await import('../services/notificationService');
    const ok = await apiMarkAsRead(id);
    if (ok) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications().then((token) => {
        if (token) console.log('Push token:', token);
      });

      refreshNotifications();

      const interval = setInterval(refreshNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, refreshNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        refreshNotifications,
        markAsRead: contextMarkAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
