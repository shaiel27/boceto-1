import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, BorderRadius } from '../../constants/colors';
import { TicketStatus } from '../../types/ticket';

interface StatusBadgeProps {
  status: TicketStatus;
}

const STATUS_CONFIG: Record<TicketStatus, { label: string; bg: string; text: string }> = {
  Pendiente: { label: 'Pendiente', bg: Colors.statusPendienteBg, text: Colors.statusPendiente },
  'En Proceso': { label: 'En Proceso', bg: Colors.statusEnProcesoBg, text: Colors.statusEnProceso },
  Resuelto: { label: 'Resuelto', bg: Colors.statusResueltoBg, text: Colors.statusResuelto },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'En Proceso') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 1400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [status]);

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Animated.View style={[styles.dot, { backgroundColor: config.text, opacity: status === 'En Proceso' ? pulseAnim : 1 }]} />
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
});
