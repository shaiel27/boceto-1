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
  Dimensions,
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

const { width: SCREEN_W } = Dimensions.get('window');

export default function TechnicianDashboard() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('Todos');
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [perf, setPerf] = useState<Performance | null>(null);
  const { user } = useAuth();
  const { tickets, isLoading, refreshTickets } = useTickets();
  const { unreadCount } = useNotifications();
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
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

  const renderHeader = () => (
    <View>
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Buenos días,</Text>
            <Text style={styles.name}>{firstName}</Text>
          </View>
          <View style={styles.headerRight}>
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
              <Ionicons name="person-outline" size={20} color={Colors.surface} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{perf?.resolved_today ?? '--'}</Text>
            <Text style={styles.statLabel}>Hoy</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{perf?.resolved_week ?? '--'}</Text>
            <Text style={styles.statLabel}>Semana</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{perf?.resolved_month ?? '--'}</Text>
            <Text style={styles.statLabel}>Mes</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.statValueGold]}>{counts['En Proceso']}</Text>
            <Text style={[styles.statLabel, styles.statLabelGold]}>Activos</Text>
          </View>
        </View>

        <View style={styles.avgRow}>
          <Ionicons name="timer-outline" size={12} color={Colors.gold} />
          <Text style={styles.avgText}>
            Tiempo promedio: <Text style={styles.avgValue}>{perf?.avg_resolution_time ?? '--'}</Text>
          </Text>
        </View>

        <View style={styles.headerAccent} />
      </Animated.View>

      {inProgress.length > 0 && (
        <View style={styles.inProgSection}>
          <View style={styles.inProgHead}>
            <View style={styles.inProgHeadL}>
              <View style={styles.inProgPulse} />
              <Text style={styles.inProgTitle}>En curso</Text>
            </View>
            <Text style={styles.inProgCount}>{inProgress.length}</Text>
          </View>
          <View style={styles.inProgList}>
            {inProgress.slice(0, 5).map((t) => (
              <TouchableOpacity
                key={t.id}
                style={styles.inProgChip}
                onPress={() => router.push(`/(tabs)/technician/${t.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.inProgChipAccent} />
                <Text style={styles.inProgChipCode}>{t.ticket_code}</Text>
                <Text style={styles.inProgChipSubject} numberOfLines={1}>{t.subject}</Text>
              </TouchableOpacity>
            ))}
            {inProgress.length > 5 && (
              <TouchableOpacity
                style={styles.inProgMore}
                onPress={() => setActiveFilter('En Proceso')}
              >
                <Text style={styles.inProgMoreText}>+{inProgress.length - 5}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.historyBtn}
        onPress={() => router.push('/(tabs)/technician/history')}
        activeOpacity={0.7}
      >
        <Ionicons name="time-outline" size={16} color={Colors.gold} />
        <Text style={styles.historyText}>Historial de tickets resueltos</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.textLight} />
      </TouchableOpacity>

      <View style={styles.filtersSection}>
        <ScrollableFilters
          filters={FILTERS}
          active={activeFilter}
          onSelect={setActiveFilter}
          counts={counts}
        />
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={15} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por código, asunto, oficina..."
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

      {filtered.length > 0 && (
        <View style={styles.resultBar}>
          <Text style={styles.resultBarText}>
            {filtered.length} {activeFilter === 'Todos' ? 'ticket' : activeFilter.toLowerCase()}
            {filtered.length !== 1 ? 's' : ''}
          </Text>
          <View style={styles.resultBarLine} />
        </View>
      )}
    </View>
  );

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
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name={search ? 'search' : 'document-text-outline'}
                  size={28}
                  color={Colors.textLight}
                />
              </View>
              <Text style={styles.emptyTitle}>{search ? 'Sin resultados' : 'Sin tickets'}</Text>
              <Text style={styles.emptySub}>
                {search
                  ? `Nada coincide con "${search}"`
                  : activeFilter === 'Todos'
                    ? 'No tienes tickets asignados aún'
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
              isActive && { backgroundColor: f.color + '14', borderColor: f.color + '50' },
            ]}
            onPress={() => onSelect(f.key)}
            activeOpacity={0.7}
          >
            {isActive && <View style={[sf.chipDot, { backgroundColor: f.color }]} />}
            <Text style={[sf.chipLabel, isActive && { color: f.color, fontWeight: '700' }]}>
              {f.label}
            </Text>
            {counts[f.key] > 0 && (
              <View style={[sf.chipCount, isActive && { backgroundColor: f.color + '20' }]}>
                <Text style={[sf.chipCountText, isActive && { color: f.color }]}>
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
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  chipLabel: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  chipCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    backgroundColor: Colors.border,
    marginLeft: 5,
  },
  chipCountText: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary },
});

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: 32 },

  header: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {},
  greeting: { fontSize: 12, color: Colors.gold, fontWeight: '600', letterSpacing: 0.8, opacity: 0.85, textTransform: 'uppercase' },
  name: { fontSize: 26, fontWeight: '800', color: Colors.surface, marginTop: 1, letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row', gap: 8, marginTop: 4 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 1,
    right: 1,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },

  statsRow: {
    flexDirection: 'row',
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.surface },
  statValueGold: { color: Colors.gold },
  statLabel: { fontSize: 10, fontWeight: '500', color: 'rgba(255,255,255,0.6)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  statLabelGold: { color: Colors.gold + 'CC' },
  statSep: { width: 1, backgroundColor: 'rgba(255,255,255,0.12)' },

  avgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  avgText: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  avgValue: { color: Colors.gold, fontWeight: '700' },

  headerAccent: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: Colors.gold,
    opacity: 0.3,
  },

  inProgSection: {
    paddingHorizontal: 12,
    paddingTop: 14,
  },
  inProgHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  inProgHeadL: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inProgPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.statusEnProceso },
  inProgTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  inProgCount: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, backgroundColor: Colors.border, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  inProgList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  inProgChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingLeft: 0,
    paddingRight: 8,
    height: 32,
    overflow: 'hidden',
    maxWidth: SCREEN_W * 0.45,
  },
  inProgChipAccent: { width: 3, backgroundColor: Colors.statusEnProceso, alignSelf: 'stretch', marginRight: 6 },
  inProgChipCode: { fontSize: 9, fontWeight: '700', color: Colors.textLight, fontFamily: 'monospace', marginRight: 4 },
  inProgChipSubject: { fontSize: 11, fontWeight: '500', color: Colors.text, flexShrink: 1 },
  inProgMore: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inProgMoreText: { fontSize: 11, fontWeight: '700', color: Colors.statusEnProceso },

  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  historyText: { flex: 1, fontSize: 12, fontWeight: '600', color: Colors.text },

  filtersSection: { paddingTop: 12, paddingBottom: 4 },
  searchWrap: { paddingHorizontal: 12, paddingVertical: 6 },
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
  resultBarText: { fontSize: 10, fontWeight: '700', color: Colors.textLight, letterSpacing: 0.6, textTransform: 'uppercase' },
  resultBarLine: { flex: 1, height: 1, backgroundColor: Colors.border, marginLeft: 8 },

  empty: { paddingVertical: 50, alignItems: 'center' },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  emptySub: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 40, marginTop: 4, lineHeight: 17 },
});
