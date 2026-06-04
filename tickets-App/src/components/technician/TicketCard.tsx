import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../../constants/colors';
import { Ticket, TicketPriority } from '../../types/ticket';

interface TicketCardProps {
  ticket: Ticket;
  onPress: (ticket: Ticket) => void;
  index?: number;
}

const PRIORITY_BAR: Record<TicketPriority, string> = {
  Alta: Colors.priorityAlta,
  Media: Colors.priorityMedia,
  Baja: Colors.textLight,
};

function timeAgo(dateStr: string): string {
  const diffMins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diffMins < 60) return `${diffMins}m`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
  return `${Math.floor(diffMins / 1440)}d`;
}

export function TicketCard({ ticket, onPress, index = 0 }: TicketCardProps) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 350, delay: index * 60, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 350, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const bar = PRIORITY_BAR[ticket.system_priority];

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
      <TouchableOpacity style={styles.card} onPress={() => onPress(ticket)} activeOpacity={0.6}>
        <View style={[styles.leftBar, { backgroundColor: bar }]} />
        <View style={styles.body}>
          <View style={styles.top}>
            <Text style={styles.code}>{ticket.ticket_code}</Text>
            <StatusDot status={ticket.status} />
          </View>
          <Text style={styles.subject} numberOfLines={2}>{ticket.subject}</Text>
          {ticket.property_number ? (
            <View style={styles.propRow}>
              <Ionicons name="hardware-chip-outline" size={10} color={Colors.navyPrimary} />
              <Text style={styles.propText} numberOfLines={1}>Bien {ticket.property_number}</Text>
            </View>
          ) : null}
          <View style={styles.meta}>
            <Meta icon="business-outline" text={ticket.office_name} />
            <Meta icon="construct-outline" text={ticket.service_name} />
            <Text style={styles.time}>{timeAgo(ticket.created_at)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={11} color={Colors.textLight} />
      <Text style={styles.metaText} numberOfLines={1}>{text}</Text>
    </View>
  );
}

function StatusDot({ status }: { status: string }) {
  const m: Record<string, string> = {
    Pendiente: Colors.statusPendiente,
    'En Proceso': Colors.statusEnProceso,
    Resuelto: Colors.statusResuelto,
  };
  const c = m[status] || Colors.textLight;
  return (
    <View style={styles.dotWrap}>
      <View style={[styles.dot, { backgroundColor: c }]} />
      <Text style={[styles.dotText, { color: c }]}>{status === 'En Proceso' ? 'En curso' : status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leftBar: { width: 3 },
  body: { flex: 1, padding: 16 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  code: { fontSize: 12, fontWeight: '700', color: Colors.textLight, fontFamily: 'monospace', letterSpacing: 0.3 },
  dotWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  dotText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  subject: { fontSize: 15, fontWeight: '600', color: Colors.text, lineHeight: 21 },
  propRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, backgroundColor: Colors.navyPrimary + '0D', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm, alignSelf: 'flex-start' },
  propText: { fontSize: 10, fontWeight: '600', color: Colors.navyPrimary },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  metaText: { fontSize: 11, color: Colors.textSecondary, flex: 1 },
  time: { fontSize: 11, color: Colors.textLight },
});
