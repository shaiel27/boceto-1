import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { useTickets } from '../../../src/contexts/TicketContext';

function pColor(p: string) { return p === 'Alta' ? Colors.priorityAlta : p === 'Media' ? Colors.priorityMedia : p === 'Critica' ? Colors.coral : Colors.textLight; }

export default function RequesterHistory() {
  const { tickets, refreshTickets } = useTickets();

  useFocusEffect(
    useCallback(() => {
      refreshTickets();
    }, [refreshTickets])
  );

  const resolved = useMemo(
    () => tickets.filter((t) => t.status === 'Resuelto').sort((a, b) => new Date(b.resolved_at || b.created_at).getTime() - new Date(a.resolved_at || a.created_at).getTime()),
    [tickets],
  );

  return (
    <View style={styles.page}>
      <FlatList
        data={resolved}
        keyExtractor={(item, idx) => String(item.id ?? idx)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.head}>
            <Ionicons name="checkmark-done-circle" size={24} color={Colors.statusResuelto} />
            <View style={{ flex: 1 }}>
              <Text style={styles.headTitle}>Tickets Resueltos</Text>
              <Text style={styles.headSub}>{resolved.length} finalizados</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.55} onPress={() => router.push(`/(tabs)/requester/${item.id}` as any)}>
            <View style={[styles.cardLeft, { backgroundColor: pColor(item.system_priority) }]} />
            <View style={styles.cardBody}>
              <Text style={styles.cardCode}>{item.ticket_code}</Text>
              <Text style={styles.cardSubject} numberOfLines={2}>{item.subject}</Text>
              <Text style={styles.cardDate}>
                Resuelto: {new Date(item.resolved_at || item.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="hourglass-outline" size={40} color={Colors.textLight} />
            <Text style={styles.emptyText}>Sin tickets resueltos aún</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  headTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  headSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, marginBottom: 6, flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  cardLeft: { width: 4 },
  cardBody: { flex: 1, padding: 14 },
  cardCode: { fontSize: 11, fontWeight: '700', color: Colors.textLight, fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 4 },
  cardSubject: { fontSize: 14, fontWeight: '600', color: Colors.text, lineHeight: 20 },
  cardDate: { fontSize: 11, color: Colors.textLight, marginTop: 8 },
  empty: { paddingVertical: 60, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
});
