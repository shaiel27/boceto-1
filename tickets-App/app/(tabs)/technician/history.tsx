import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { useTickets } from '../../../src/contexts/TicketContext';
import { TicketCard } from '../../../src/components/technician/TicketCard';
import { getTechnicianPerformance } from '../../../src/services/technicianService';

export default function HistoryScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [perf, setPerf] = useState<{ resolved_week: number; resolved_month: number; avg_resolution_time: string } | null>(null);
  const { tickets, refreshTickets } = useTickets();

  useEffect(() => {
    getTechnicianPerformance().then((r) => {
      if (r.success && r.data) setPerf(r.data);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshTickets();
      getTechnicianPerformance().then((r) => {
        if (r.success && r.data) setPerf(r.data);
      });
    }, [refreshTickets])
  );

  const resolved = useMemo(() => {
    let r = tickets.filter((t) => t.status === 'Resuelto' || t.status === 'Cerrado');
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (t) =>
          t.ticket_code.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.office_name.toLowerCase().includes(q) ||
          t.service_name.toLowerCase().includes(q),
      );
    }
    return r.sort((a, b) => new Date(b.resolved_at || b.created_at).getTime() - new Date(a.resolved_at || a.created_at).getTime());
  }, [tickets, search]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTickets();
    const r = await getTechnicianPerformance();
    if (r.success && r.data) setPerf(r.data);
    setRefreshing(false);
  };

  return (
    <View style={styles.page}>
      <FlatList
        data={resolved}
        keyExtractor={(item, index) => String(item.id ?? index)}
        renderItem={({ item, index }) => (
          <TicketCard ticket={item} onPress={(t) => router.push(`/(tabs)/technician/${t.id}`)} index={index} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} progressBackgroundColor={Colors.surface} />
        }
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.navyPrimary} />
                </Text>
                <Text style={styles.statValue}>{perf?.resolved_week ?? '--'}</Text>
                <Text style={styles.statLabel}>Semana</Text>
              </View>
              <View style={styles.statSep} />
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>
                  <Ionicons name="layers-outline" size={14} color={Colors.navyPrimary} />
                </Text>
                <Text style={styles.statValue}>{perf?.resolved_month ?? '--'}</Text>
                <Text style={styles.statLabel}>Mes</Text>
              </View>
              <View style={styles.statSep} />
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>
                  <Ionicons name="timer-outline" size={14} color={Colors.navyPrimary} />
                </Text>
                <Text style={[styles.statValue, { fontSize: 16 }]}>{perf?.avg_resolution_time ?? '--'}</Text>
                <Text style={styles.statLabel}>Promedio</Text>
              </View>
            </View>

            <View style={styles.searchWrap}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={15} color={Colors.textLight} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar en historial..."
                  placeholderTextColor={Colors.textLight}
                  value={search}
                  onChangeText={setSearch}
                  autoCapitalize="none"
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={16} color={Colors.textLight} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.resultBar}>
              <Text style={styles.resultBarText}>
                {resolved.length} TICKET{resolved.length !== 1 ? 'S' : ''} RESUELTO{resolved.length !== 1 ? 'S' : ''}
              </Text>
              <View style={styles.resultBarLine} />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="hourglass-outline" size={32} color={Colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>
              {search ? 'Sin resultados' : 'Sin tickets resueltos'}
            </Text>
            <Text style={styles.emptySub}>
              {search
                ? `Ningún ticket coincide con "${search}"`
                : 'Los tickets que resuelvas aparecerán aquí'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: 32 },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginTop: 14,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statCard: { flex: 1, alignItems: 'center', gap: 4 },
  statIcon: { marginBottom: 2 },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  statSep: { width: 1, backgroundColor: Colors.border },

  searchWrap: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.text },

  resultBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
    marginTop: 2,
  },
  resultBarText: { fontSize: 10, fontWeight: '700', color: Colors.textLight, letterSpacing: 0.6 },
  resultBarLine: { flex: 1, height: 1, backgroundColor: Colors.border, marginLeft: 8 },

  empty: { paddingVertical: 70, alignItems: 'center' },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginTop: 6 },
  emptySub: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 30, marginTop: 4 },
});
