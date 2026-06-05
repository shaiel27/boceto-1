import { TextStyle, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from './colors';

export { Colors, BorderRadius, Spacing };

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
};

export const FontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extrabold: '800' as TextStyle['fontWeight'],
};

export const Shadows: Record<string, ViewStyle> = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
};

export function statusColor(status: string): string {
  switch (status) {
    case 'Pendiente': return Colors.statusPendiente;
    case 'En Proceso': return Colors.statusEnProceso;
    case 'Resuelto': return Colors.statusResuelto;
    default: return Colors.textLight;
  }
}

export function statusBg(status: string): string {
  switch (status) {
    case 'Pendiente': return Colors.statusPendienteBg;
    case 'En Proceso': return Colors.statusEnProcesoBg;
    case 'Resuelto': return Colors.statusResueltoBg;
    default: return Colors.border;
  }
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'En Proceso': return 'En curso';
    default: return status;
  }
}

export function priorityColor(p: string): string {
  switch (p) {
    case 'Alta': return Colors.priorityAlta;
    case 'Media': return Colors.priorityMedia;
    default: return Colors.priorityBaja;
  }
}
