import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../../constants/colors';
import { Ticket, TicketPriority } from '../../types/ticket';
import { StatusBadge } from './StatusBadge';

interface TicketCardProps {
  ticket: Ticket;
  onPress: (ticket: Ticket) => void;
  index?: number;
}

const PRIORITY_CONFIG: Record<TicketPriority, { color: string; bg: string; border: string; icon: keyof typeof Ionicons.glyphMap }> = {
  Alta: { color: Colors.priorityAlta, bg: Colors.priorityAltaBg, border: Colors.priorityAlta, icon: 'arrow-up-circle' },
  Media: { color: Colors.priorityMedia, bg: Colors.priorityMediaBg, border: Colors.priorityMedia, icon: 'remove-circle' },
  Baja: { color: Colors.priorityBaja, bg: Colors.priorityBajaBg, border: Colors.priorityBaja, icon: 'arrow-down-circle' },
};

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export function TicketCard({ ticket, onPress, index = 0 }: TicketCardProps) {
  const priorityConfig = PRIORITY_CONFIG[ticket.system_priority];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: priorityConfig.border }]}
        onPress={() => onPress(ticket)}
        activeOpacity={0.7}
      >
        <View style={styles.topRow}>
          <View style={styles.codeRow}>
            <View style={[styles.priorityStripe, { backgroundColor: priorityConfig.border }]} />
            <Text style={styles.code}>{ticket.ticket_code}</Text>
          </View>
          <StatusBadge status={ticket.status} />
        </View>

        <Text style={styles.subject} numberOfLines={2}>
          {ticket.subject}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="business-outline" size={12} color={Colors.textLight} />
            <Text style={styles.metaText} numberOfLines={1}>{ticket.office_name}</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Ionicons name="construct-outline" size={12} color={Colors.textLight} />
            <Text style={styles.metaText} numberOfLines={1}>{ticket.service_name}</Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.priorityBadge}>
            <Ionicons name={priorityConfig.icon} size={12} color={priorityConfig.color} />
            <Text style={[styles.priorityText, { color: priorityConfig.color }]}>
              {ticket.system_priority}
            </Text>
          </View>
          <View style={styles.bottomRight}>
            {ticket.has_attachments && (
              <Ionicons name="attach" size={14} color={Colors.textLight} />
            )}
            <Text style={styles.time}>{getTimeAgo(ticket.created_at)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 5,
    borderLeftWidth: 4,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border + '60',
    borderLeftColor: undefined,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityStripe: {
    width: 3,
    height: 16,
    borderRadius: 2,
  },
  code: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  subject: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    maxWidth: 130,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textLight,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  time: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },
});
