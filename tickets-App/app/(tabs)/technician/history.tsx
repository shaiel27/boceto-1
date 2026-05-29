import React, { useState, useMemo, useEffect } from 'react';
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
import { router } from 'expo-router';
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

  const resolved = useMemo(() => {
    let r = tickets.filter((t) => t.status === 'Resuelto');
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
            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                <Text style={styles.statLabel}>Semana</Text>
                <Text style={styles.statValue}>{perf?.resolved_week ?? '--'}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCard}>
                <Ionicons name="layers-outline" size={16} color={Colors.primary} />
                <Text style={styles.statLabel}>Mes</Text>
                <Text style={styles.statValue}>{perf?.resolved_month ?? '--'}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCard}>
                <Ionicons name="timer-outline" size={16} color={Colors.primary} />
                <Text style={styles.statLabel}>Promedio</Text>
                <Text style={[styles.statValue, { fontSize: 16 }]}>{perf?.avg_resolution_time ?? '--'}</Text>
              </View>
            </View>

            {/* Search */}
            <View style={styles.searchWrap}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={16} color={Colors.textLight} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar en historial..."
                  placeholderTextColor={Colors.textLight}
                  value={search}
                  onChangeText={setSearch}
                  autoCapitalize="none"
                  clearButtonMode="while-editing"
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={16} color={Colors.textLight} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Section label */}
            <View style={styles.sectionLabel}>
              <Text style={styles.sectionLabelText}>
                {resolved.length} TICKET{resolved.length !== 1 ? 'S' : ''} RESUELTO{resolved.length !== 1 ? 'S' : ''}
              </Text>
              <View style={styles.sectionLine} />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="hourglass-outline" size={48} color={Colors.textLight} />
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
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '500', textTransform: 'uppercase', marginTop: 4 },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.text, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },

  searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text, marginLeft: 8 },

  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionLabelText: { fontSize: 11, fontWeight: '700', color: Colors.textLight, letterSpacing: 0.8 },
  sectionLine: { flex: 1, height: 1, backgroundColor: Colors.border, marginLeft: 10 },

  empty: { paddingVertical: 80, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginTop: 10 },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 30, marginTop: 4 },
});
