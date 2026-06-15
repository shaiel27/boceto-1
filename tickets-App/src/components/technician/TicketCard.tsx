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

const PRIORITY_ACCENT: Record<TicketPriority, { bar: string; dot: string; bg: string }> = {
  Alta: { bar: Colors.priorityAlta, dot: Colors.priorityAlta, bg: Colors.priorityAlta + '0C' },
  Media: { bar: Colors.priorityMedia, dot: Colors.priorityMedia, bg: Colors.priorityMedia + '0C' },
  Baja: { bar: Colors.textLight, dot: Colors.textLight, bg: Colors.border },
};

function timeAgo(dateStr: string): string {
  const diffMins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
  return `${Math.floor(diffMins / 1440)}d`;
}

function TicketCardInner({ ticket, onPress, index = 0 }: TicketCardProps) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 400, delay: index * 50, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 400, delay: index * 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const accent = PRIORITY_ACCENT[ticket.system_priority];
  const resolved = ticket.status === 'Resuelto';

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
      <TouchableOpacity
        style={[styles.card, resolved && styles.cardResolved]}
        onPress={() => onPress(ticket)}
        activeOpacity={0.65}
      >
        <View style={[styles.accentBar, { backgroundColor: accent.bar }]} />
        <View style={[styles.accentCap, { backgroundColor: accent.bar }]} />
        <View style={styles.body}>
          <View style={styles.top}>
            <View style={styles.codeRow}>
              <View style={[styles.signalDot, { backgroundColor: accent.dot }]} />
              <Text style={styles.code}>{ticket.ticket_code}</Text>
            </View>
            <StatusSignal status={ticket.status} />
          </View>
          <Text style={styles.subject} numberOfLines={1}>{ticket.subject}</Text>
          <View style={styles.metaRow}>
            <MetaChip icon="business-outline" text={ticket.office_name} />
            <MetaChip icon="construct-outline" text={ticket.service_name} />
            <Text style={styles.time}>{timeAgo(ticket.created_at)}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={14} color={Colors.textLight} style={styles.chevron} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export const TicketCard = React.memo(TicketCardInner);

function MetaChip({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.metaChip}>
      <Ionicons name={icon} size={9} color={Colors.textLight} />
      <Text style={styles.metaChipText} numberOfLines={1}>{text}</Text>
    </View>
  );
}

const STATUS_SIGNAL_MAP: Record<string, { label: string; color: string; bg: string }> = {
  Pendiente: { label: 'PEND', color: Colors.statusPendiente, bg: Colors.statusPendienteBg },
  'En Proceso': { label: 'EN CURSO', color: Colors.statusEnProceso, bg: Colors.statusEnProcesoBg },
  Resuelto: { label: 'RESUELTO', color: Colors.statusResuelto, bg: Colors.statusResueltoBg },
};

function StatusSignal({ status }: { status: string }) {
  const cfg = STATUS_SIGNAL_MAP[status] || STATUS_SIGNAL_MAP.Pendiente;
  return (
    <View style={[styles.signalBadge, { backgroundColor: cfg.bg }]}>
      <View style={[styles.signalBadgeDot, { backgroundColor: cfg.color }]} />
      <Text style={[styles.signalBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: 12,
    marginVertical: 3,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardResolved: { opacity: 0.75 },
  accentBar: { width: 3, borderTopLeftRadius: BorderRadius.md, borderBottomLeftRadius: BorderRadius.md },
  accentCap: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 1 },
  body: { flex: 1, paddingVertical: 10, paddingLeft: 10, paddingRight: 4 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  signalDot: { width: 5, height: 5, borderRadius: 2.5 },
  code: { fontSize: 10, fontWeight: '700', color: Colors.textLight, fontFamily: 'monospace', letterSpacing: 0.4 },
  subject: { fontSize: 14, fontWeight: '600', color: Colors.text, lineHeight: 18, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.background, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  metaChipText: { fontSize: 10, color: Colors.textSecondary, fontWeight: '500' },
  time: { fontSize: 10, color: Colors.textLight, marginLeft: 'auto' },
  chevron: { alignSelf: 'center', marginRight: 8 },
  signalBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: BorderRadius.sm,
  },
  signalBadgeDot: { width: 5, height: 5, borderRadius: 2.5 },
  signalBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
});
