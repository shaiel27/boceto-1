import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  title?: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  showToast: (params: { title?: string; message: string; type?: ToastType }) => void;
  dismissToast: (id: number) => void;
}

let nextId = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  showToast: ({ title, message, type = 'info' }) => {
    const id = ++nextId;
    set((s) => ({ toasts: [...s.toasts, { id, title, message, type }] }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 3500);
  },

  dismissToast: (id: number) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
