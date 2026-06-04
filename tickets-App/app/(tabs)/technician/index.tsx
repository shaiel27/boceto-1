import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { useTickets } from '../../../src/contexts/TicketContext';
import { useAuth } from '../../../src/hooks/useAuth';
import { useNotifications } from '../../../src/contexts/NotificationContext';
import { TicketCard } from '../../../src/components/technician/TicketCard';
import { getTechnicianPerformance } from '../../../src/services/technicianService';

type FilterTab = 'Todos' | 'Pendiente' | 'En Proceso' | 'Resuelto';

interface Performance {
  resolved_today: number;
  resolved_week: number;
  resolved_month: number;
  avg_resolution_time: string;
}

const FILTERS: { key: FilterTab; label: string; color: string }[] = [
  { key: 'Todos', label: 'Todos', color: Colors.text },
  { key: 'Pendiente', label: 'Pendientes', color: Colors.statusPendiente },
  { key: 'En Proceso', label: 'En curso', color: Colors.statusEnProceso },
  { key: 'Resuelto', label: 'Resueltos', color: Colors.statusResuelto },
];

export default function TechnicianDashboard() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('Todos');
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [perf, setPerf] = useState<Performance | null>(null);
  const { user } = useAuth();
  const { tickets, isLoading, refreshTickets } = useTickets();
  const { unreadCount } = useNotifications();

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

  const filtered = useMemo(() => {
    let r = tickets;
    if (activeFilter !== 'Todos') r = r.filter((t) => t.status === activeFilter);
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
    return r;
  }, [tickets, activeFilter, search]);

  const counts = useMemo(() => {
    const c: Record<FilterTab, number> = { Todos: tickets.length, Pendiente: 0, 'En Proceso': 0, Resuelto: 0 };
    tickets.forEach((t) => { if (t.status in c) c[t.status as FilterTab]++; });
    return c;
  }, [tickets]);

  const inProgress = useMemo(() => tickets.filter((t) => t.status === 'En Proceso'), [tickets]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTickets();
    const r = await getTechnicianPerformance();
    if (r.success && r.data) setPerf(r.data);
    setRefreshing(false);
  };

  const firstName = user?.full_name?.split(' ')[0] || 'Técnico';

  return (
    <View style={styles.page}>
      <FlatList
        data={filtered}
        keyExtractor={(item, index) => String(item.id ?? index)}
        renderItem={({ item, index }) => (
          <TicketCard ticket={item} onPress={(t) => router.push(`/(tabs)/technician/${t.id}`)} index={index} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
            progressBackgroundColor={Colors.surface}
          />
        }
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* ====== HEADER ====== */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.greeting}>Panel de Control</Text>
                  <Text style={styles.name}>{firstName}</Text>
                </View>
                <View style={styles.headerActions}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => {}}>
                    <Ionicons name="notifications-outline" size={20} color={Colors.surface} />
                    {unreadCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => router.push('/(tabs)/technician/profile')}
                  >
                    <Ionicons name="settings-outline" size={20} color={Colors.surface} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* ====== PERFORMANCE CARDS ====== */}
            <View style={styles.perfSection}>
              <View style={styles.perfRow}>
                <View style={styles.perfCard}>
                  <Ionicons name="today-outline" size={18} color={Colors.primary} />
                  <Text style={styles.perfCardValue}>{perf?.resolved_today ?? '--'}</Text>
                  <Text style={styles.perfCardLabel}>Hoy</Text>
                </View>
                <View style={styles.perfCard}>
                  <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                  <Text style={styles.perfCardValue}>{perf?.resolved_week ?? '--'}</Text>
                  <Text style={styles.perfCardLabel}>Semana</Text>
                </View>
                <View style={styles.perfCard}>
                  <Ionicons name="layers-outline" size={18} color={Colors.primary} />
                  <Text style={styles.perfCardValue}>{perf?.resolved_month ?? '--'}</Text>
                  <Text style={styles.perfCardLabel}>Mes</Text>
                </View>
                <View style={[styles.perfCard, styles.perfCardAccent]}>
                  <Ionicons name="flame-outline" size={18} color={Colors.surface} />
                  <Text style={styles.perfCardValueAccent}>{counts['En Proceso']}</Text>
                  <Text style={styles.perfCardLabelAccent}>Activos</Text>
                </View>
              </View>

              <View style={styles.perfWideCard}>
                <Ionicons name="timer-outline" size={22} color={Colors.gold} />
                <View>
                  <Text style={styles.perfWideLabel}>Tiempo promedio de resolución</Text>
                  <Text style={styles.perfWideValue}>{perf?.avg_resolution_time ?? '--'}</Text>
                </View>
              </View>
            </View>

            {/* ====== IN PROGRESS SECTION ====== */}
            {inProgress.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHead}>
                  <View style={styles.sectionHeadL}>
                    <View style={styles.sectionDot} />
                    <Text style={styles.sectionTitle}>En Proceso</Text>
                  </View>
                  <Text style={styles.sectionCount}>{inProgress.length}</Text>
                </View>
                {inProgress.slice(0, 3).map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={styles.inProgCard}
                    onPress={() => router.push(`/(tabs)/technician/${t.id}`)}
                    activeOpacity={0.6}
                  >
                    <View style={styles.ipLeftBar} />
                    <View style={styles.ipBody}>
                      <Text style={styles.ipCode}>{t.ticket_code}</Text>
                      <Text style={styles.ipSubject} numberOfLines={1}>
                        {t.subject}
                      </Text>
                      <Text style={styles.ipMeta}>{t.office_name}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textLight} style={{ marginRight: 12 }} />
                  </TouchableOpacity>
                ))}
                {inProgress.length > 3 && (
                  <TouchableOpacity
                    style={styles.seeMore}
                    onPress={() => setActiveFilter('En Proceso')}
                  >
                    <Text style={styles.seeMoreText}>Ver {inProgress.length - 3} más</Text>
                    <Ionicons name="arrow-forward" size={14} color={Colors.statusEnProceso} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* ====== HISTORY BUTTON ====== */}
            <TouchableOpacity
              style={styles.historyBtn}
              onPress={() => router.push('/(tabs)/technician/history')}
              activeOpacity={0.7}
            >
              <View style={styles.historyIcon}>
                <Ionicons name="time-outline" size={22} color={Colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyTitle}>Historial de Tickets</Text>
                <Text style={styles.historySub}>Revisa todos los tickets resueltos</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
            </TouchableOpacity>

            {/* ====== FILTERS ====== */}
            <View style={styles.filters}>
              <Text style={styles.filterLabel}>Bandeja</Text>
              <ScrollableFilters
                filters={FILTERS}
                active={activeFilter}
                onSelect={setActiveFilter}
                counts={counts}
              />
            </View>

            {/* ====== SEARCH ====== */}
            <View style={styles.searchWrap}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={16} color={Colors.textLight} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar tickets..."
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
          </View>
        }
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.empty}>
              <Ionicons
                name={search ? 'search' : 'document-text-outline'}
                size={40}
                color={Colors.textLight}
              />
              <Text style={styles.emptyTitle}>{search ? 'Sin resultados' : 'Sin tickets'}</Text>
              <Text style={styles.emptySub}>
                {search
                  ? `Nada coincide con "${search}"`
                  : activeFilter === 'Todos'
                    ? 'No tienes tickets asignados'
                    : `No hay tickets ${activeFilter.toLowerCase()}`}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

function ScrollableFilters({ filters, active, onSelect, counts }: any) {
  return (
    <View style={sf.wrap}>
      {filters.map((f: any) => {
        const isActive = active === f.key;
        return (
          <TouchableOpacity
            key={f.key}
            style={[
              sf.chip,
              isActive && { backgroundColor: f.color + '14', borderColor: f.color + '40' },
            ]}
            onPress={() => onSelect(f.key)}
            activeOpacity={0.7}
          >
            {isActive && <View style={[sf.dot, { backgroundColor: f.color }]} />}
            <Text style={[sf.label, isActive && { color: f.color, fontWeight: '600' }]}>
              {f.label}
            </Text>
            {counts[f.key] > 0 && (
              <View style={[sf.count, isActive && { backgroundColor: f.color + '20' }]}>
                <Text style={[sf.countText, isActive && { color: f.color }]}>
                  {counts[f.key]}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const sf = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingBottom: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 6,
    marginBottom: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  count: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    backgroundColor: Colors.border,
    marginLeft: 4,
  },
  countText: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary },
});

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: 32 },

  header: {
    backgroundColor: Colors.primary,
    paddingTop: 52,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 11, color: Colors.gold, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: '600', opacity: 0.8 },
  name: { fontSize: 24, fontWeight: '800', color: Colors.surface, marginTop: 2, letterSpacing: -0.3 },
  headerActions: { flexDirection: 'row', marginTop: 4 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  perfSection: { paddingHorizontal: 16, paddingTop: 16 },
  perfRow: { flexDirection: 'row', marginBottom: 10 },
  perfCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginRight: 8,
  },
  perfCardAccent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
    marginRight: 0,
  },
  perfCardValue: { fontSize: 20, fontWeight: '800', color: Colors.text, marginTop: 6 },
  perfCardValueAccent: { fontSize: 20, fontWeight: '800', color: Colors.surface, marginTop: 6 },
  perfCardLabel: { fontSize: 10, fontWeight: '500', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  perfCardLabelAccent: { fontSize: 10, fontWeight: '500', color: Colors.gold, textTransform: 'uppercase', letterSpacing: 0.5 },
  perfWideCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  perfWideLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500', marginLeft: 12 },
  perfWideValue: { fontSize: 20, fontWeight: '700', color: Colors.text, marginLeft: 12, marginTop: 2 },

  section: { paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionHeadL: { flexDirection: 'row', alignItems: 'center' },
  sectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.statusEnProceso, marginRight: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  sectionCount: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, backgroundColor: Colors.border, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  inProgCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  ipLeftBar: { width: 3, backgroundColor: Colors.statusEnProceso, alignSelf: 'stretch' },
  ipBody: { flex: 1, paddingVertical: 12, paddingLeft: 12 },
  ipCode: { fontSize: 10, fontWeight: '700', color: Colors.textLight, fontFamily: 'monospace', letterSpacing: 0.3, marginBottom: 2 },
  ipSubject: { fontSize: 14, fontWeight: '600', color: Colors.text },
  ipMeta: { fontSize: 11, color: Colors.textSecondary, marginTop: 3 },
  seeMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  seeMoreText: { fontSize: 12, fontWeight: '600', color: Colors.statusEnProceso, marginRight: 4 },

  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 14,
    marginTop: 8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary + '08',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  historySub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  filters: { paddingTop: 8 },
  filterLabel: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 8, paddingHorizontal: 16 },

  searchWrap: { paddingHorizontal: 16, paddingVertical: 8 },
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

  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginTop: 8 },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 30, marginTop: 4 },
});
