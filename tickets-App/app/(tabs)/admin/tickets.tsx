import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { getAllTickets, getServices } from '../../../src/services/adminService';
import { BackendTicket } from '../../../src/types/api';

const STATUS_FILTERS = [
  { key: '', label: 'Todos', icon: 'layers-outline' as const },
  { key: 'Pendiente', label: 'Pendientes', color: Colors.statusPendiente },
  { key: 'En Proceso', label: 'En curso', color: Colors.statusEnProceso },
  { key: 'Cerrado', label: 'Cerrados', color: Colors.statusResuelto },
];

const PAGE_SIZE = 20;

export default function AdminTicketsScreen() {
  const [tickets, setTickets] = useState<BackendTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState<number>(0);
  const [services, setServices] = useState<{ ID_TI_Service: number; Type_Service: string }[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    getServices().then((r) => { if (r.success && r.data) setServices(r.data); });
  }, []);

  const load = useCallback(async (reset = false) => {
    const o = reset ? 0 : offset;
    if (reset) setLoading(true); else setLoadingMore(true);

    const r = await getAllTickets({
      limit: PAGE_SIZE, offset: o,
      status: statusFilter || undefined,
      service_id: serviceFilter || undefined,
    });

    if (r.success && r.tickets) {
      if (reset) { setTickets(r.tickets); setOffset(PAGE_SIZE); }
      else { setTickets((prev) => [...prev, ...r.tickets!]); setOffset(o + PAGE_SIZE); }
      setHasMore(r.tickets.length >= PAGE_SIZE);
    }
    setLoading(false); setLoadingMore(false);
  }, [statusFilter, serviceFilter, offset]);

  useEffect(() => { setOffset(0); setHasMore(true); load(true); }, [statusFilter, serviceFilter]);

  useFocusEffect(useCallback(() => { setOffset(0); setHasMore(true); load(true); }, [statusFilter, serviceFilter]));

  const onRefresh = async () => {
    setRefreshing(true); setOffset(0); setHasMore(true);
    const r = await getAllTickets({ limit: PAGE_SIZE, offset: 0, status: statusFilter || undefined, service_id: serviceFilter || undefined });
    if (r.success && r.tickets) { setTickets(r.tickets); setOffset(PAGE_SIZE); setHasMore(r.tickets.length >= PAGE_SIZE); }
    setRefreshing(false);
  };

  const onEndReached = () => { if (!loadingMore && hasMore && !loading) load(false); };

  return (
    <View style={styles.page}>
      {/* Filters */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.key;
            const color = 'color' in f ? f.color : Colors.text;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.fChip, active && { backgroundColor: color + '16', borderColor: color + '35' }]}
                onPress={() => setStatusFilter(f.key)}
                activeOpacity={0.7}
              >
                {active && <View style={[styles.fDot, { backgroundColor: color }]} />}
                <Text style={[styles.fText, active && { color, fontWeight: '700' }]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {services.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serviceBar} contentContainerStyle={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.sChip, serviceFilter === 0 && styles.sChipActive]}
              onPress={() => setServiceFilter(0)}
              activeOpacity={0.7}
            >
              <Ionicons name="layers-outline" size={13} color={serviceFilter === 0 ? Colors.primary : Colors.textLight} />
              <Text style={[styles.sText, serviceFilter === 0 && styles.sTextActive]}>Todos</Text>
            </TouchableOpacity>
            {services.map((s) => {
              const active = serviceFilter === s.ID_TI_Service;
              return (
                <TouchableOpacity
                  key={s.ID_TI_Service}
                  style={[styles.sChip, active && styles.sChipActive]}
                  onPress={() => setServiceFilter(s.ID_TI_Service)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.sText, active && styles.sTextActive]}>{s.Type_Service}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Ticket List */}
      <FlatList
        data={tickets}
        keyExtractor={(item, index) => String(item.ID_Service_Request ?? `ticket-${index}`)}
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
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ padding: 20 }} color={Colors.primary} /> : null}
        renderItem={({ item }) => {
          const prio = item.System_Priority || 'Media';
          const status = item.Status || 'Pendiente';
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.55}
              onPress={() => router.push(`/(tabs)/admin/tickets/${item.ID_Service_Request}` as any)}
            >
              <View style={[styles.cardLeft, { backgroundColor: pColor(prio) }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardCode} selectable={false}>
                    {item.Ticket_Code || `#${item.ID_Service_Request}`}
                  </Text>
                  <View style={styles.cardBadges}>
                    <View style={[styles.badge, { backgroundColor: pBg(prio) }]}>
                      <Text style={[styles.badgeText, { color: pTxt(prio) }]}>{prio}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: sBg(status) }]}>
                      <View style={[styles.sDot, { backgroundColor: sColor(status) }]} />
                      <Text style={[styles.badgeText, { color: sTxt(status) }]}>
                        {status === 'En Proceso' ? 'En curso' : status}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.cardSubject} numberOfLines={2}>
                  {item.Subject}
                </Text>

                {item.Property_Number ? (
                  <View style={styles.cardProp}>
                    <Ionicons name="hardware-chip-outline" size={11} color={Colors.navyPrimary} />
                    <Text style={styles.cardPropText} numberOfLines={1}>Bien {item.Property_Number}</Text>
                  </View>
                ) : null}

                <View style={styles.cardFooter}>
                  <View style={styles.cardFooterItem}>
                    <Ionicons name="business-outline" size={11} color={Colors.textLight} />
                    <Text style={styles.cardFooterText} numberOfLines={1}>
                      {item.office_name || 'Sin oficina'}
                    </Text>
                  </View>
                  <View style={styles.cardFooterItem}>
                    <Ionicons name="construct-outline" size={11} color={Colors.textLight} />
                    <Text style={styles.cardFooterText} numberOfLines={1}>
                      {item.service_type_name || '—'}
                    </Text>
                  </View>
                  {item.technicians && item.technicians.length > 0 && (
                    <View style={styles.cardFooterItem}>
                      <Ionicons name="person-outline" size={11} color={Colors.textLight} />
                      <Text style={styles.cardFooterText} numberOfLines={1}>
                        {item.technicians.map((t: any) => t.name).filter(Boolean).join(', ') || 'Asignado'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="documents-outline" size={36} color={Colors.textLight} />
              </View>
              <Text style={styles.emptyTitle}>Sin tickets</Text>
              <Text style={styles.emptySub}>
                {statusFilter
                  ? `No hay tickets en estado "${statusFilter}"`
                  : serviceFilter > 0
                    ? `Sin tickets para el servicio seleccionado`
                    : 'No se encontraron tickets'}
              </Text>
            </View>
          )
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/admin/tickets/create' as any)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={26} color={Colors.gold} />
      </TouchableOpacity>
    </View>
  );
}

function pColor(p: string) {
  return p === 'Alta' ? Colors.priorityAlta : p === 'Media' ? Colors.priorityMedia : p === 'Critica' ? Colors.coral : Colors.textLight;
}
function pBg(p: string) {
  return p === 'Alta' ? Colors.priorityAltaBg : p === 'Critica' ? Colors.coralLight : Colors.priorityMediaBg;
}
function pTxt(p: string) {
  return p === 'Alta' ? Colors.badgeHighText : p === 'Critica' ? Colors.coralDark : Colors.badgeMedText;
}
function sColor(s: string) {
  return s === 'Pendiente' ? Colors.statusPendiente : s === 'En Proceso' ? Colors.statusEnProceso : Colors.statusResuelto;
}
function sBg(s: string) {
  return s === 'Pendiente' ? Colors.statusPendienteBg : s === 'En Proceso' ? Colors.statusEnProcesoBg : Colors.statusResueltoBg;
}
function sTxt(s: string) {
  return s === 'Pendiente' ? Colors.badgeMedText : s === 'En Proceso' ? Colors.badgeBlueText : Colors.badgeLowText;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },

  filterBar: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: 8,
  },
  filterScroll: { paddingHorizontal: 14, paddingBottom: 10, gap: 8, flexDirection: 'row' },
  fChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fDot: { width: 6, height: 6, borderRadius: 3 },
  fText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  serviceBar: {},
  sChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sChipActive: { backgroundColor: Colors.primary + '0C', borderColor: Colors.primary + '35' },
  sText: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary },
  sTextActive: { color: Colors.primary, fontWeight: '700' },

  list: { padding: 12, paddingBottom: 88 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  cardLeft: { width: 4 },
  cardBody: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardCode: { fontSize: 11, fontWeight: '700', color: Colors.textLight, fontFamily: 'monospace', letterSpacing: 0.4, textTransform: 'uppercase' },
  cardBadges: { flexDirection: 'row', gap: 6 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  sDot: { width: 5, height: 5, borderRadius: 3 },
  cardSubject: { fontSize: 15, fontWeight: '600', color: Colors.text, lineHeight: 21 },
  cardProp: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, backgroundColor: Colors.navyPrimary + '0D', paddingHorizontal: 9, paddingVertical: 4, borderRadius: BorderRadius.sm, alignSelf: 'flex-start' },
  cardPropText: { fontSize: 11, fontWeight: '600', color: Colors.navyPrimary },
  cardFooter: { flexDirection: 'row', marginTop: 12, gap: 14 },
  cardFooterItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  cardFooterText: { fontSize: 11, color: Colors.textSecondary, flex: 1 },

  empty: { paddingVertical: 80, alignItems: 'center' },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 40, lineHeight: 18 },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
});
