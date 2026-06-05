import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user';
import { loginUser, getMe } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  initialized: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  initialized: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await loginUser(email, password);
      if (result.success && result.token && result.user) {
        await AsyncStorage.setItem('auth_token', result.token);
        await AsyncStorage.setItem('auth_user', JSON.stringify(result.user));
        set({
          user: result.user,
          token: result.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        const { prewarmBienesCache } = await import('../services/bienesService');
        prewarmBienesCache();
      } else {
        const message = result.message || 'Error al iniciar sesión';
        set({ isLoading: false, error: message });
        throw new Error(message);
      }
    } catch (err: any) {
      if (!get().error) {
        set({ isLoading: false, error: err.message || 'Error de conexión' });
      }
      throw err;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('auth_user');

      if (token && userData) {
        const result = await getMe();
        if (result.success && result.user) {
          await AsyncStorage.setItem('auth_user', JSON.stringify(result.user));
          set({
            user: result.user,
            token,
            isAuthenticated: true,
            isLoading: false,
            initialized: true,
          });
          const { prewarmBienesCache } = await import('../services/bienesService');
          prewarmBienesCache();
          return;
        }
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('auth_user');
      }
      set({ isLoading: false, initialized: true });
    } catch {
      set({ isLoading: false, initialized: true });
    }
  },

  clearError: () => set({ error: null }),
}));

export const useAuth = () => {
  const store = useAuthStore();
  return {
    ...store,
    isAdmin: store.user?.fk_role === 1,
    isTechnician: store.user?.fk_role === 2,
    isRequester: store.user?.fk_role === 3,
  };
};
