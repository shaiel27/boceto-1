import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { getAllTickets, getServices } from '../../../src/services/adminService';
import { BackendTicket } from '../../../src/types/api';

const STATUS_FILTERS = [
  { key: '', label: 'Todos' },
  { key: 'Pendiente', label: 'Pendientes' },
  { key: 'En Proceso', label: 'En curso' },
  { key: 'Cerrado', label: 'Cerrados' },
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

  const onRefresh = async () => {
    setRefreshing(true); setOffset(0); setHasMore(true);
    const r = await getAllTickets({ limit: PAGE_SIZE, offset: 0, status: statusFilter || undefined, service_id: serviceFilter || undefined });
    if (r.success && r.tickets) { setTickets(r.tickets); setOffset(PAGE_SIZE); setHasMore(r.tickets.length >= PAGE_SIZE); }
    setRefreshing(false);
  };

  const onEndReached = () => { if (!loadingMore && hasMore && !loading) load(false); };

  return (
    <View style={styles.page}>
      {/* Status filter row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.key;
          return (
            <TouchableOpacity key={f.key} style={[styles.fTab, active && styles.fTabActive]} onPress={() => setStatusFilter(f.key)} activeOpacity={0.7}>
              <Text style={[styles.fText, active && styles.fTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Service filter row */}
      {services.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serviceRow} contentContainerStyle={styles.serviceInner}>
          <TouchableOpacity style={[styles.sTab, serviceFilter === 0 && styles.sTabActive]} onPress={() => setServiceFilter(0)} activeOpacity={0.7}>
            <Ionicons name="layers" size={13} color={serviceFilter === 0 ? Colors.navyPrimary : Colors.textLight} />
            <Text style={[styles.sText, serviceFilter === 0 && styles.sTextActive]}>Todos</Text>
          </TouchableOpacity>
          {services.map((s) => {
            const active = serviceFilter === s.ID_TI_Service;
            return (
              <TouchableOpacity key={s.ID_TI_Service} style={[styles.sTab, active && styles.sTabActive]} onPress={() => setServiceFilter(s.ID_TI_Service)} activeOpacity={0.7}>
                <Text style={[styles.sText, active && styles.sTextActive]}>{s.Type_Service}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <FlatList
        data={tickets}
        keyExtractor={(item, index) => String(item.ID_Service_Request ?? `ticket-${index}`)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.navyPrimary} colors={[Colors.navyPrimary]} progressBackgroundColor={Colors.surface} />}
        contentContainerStyle={styles.list}
        onEndReached={onEndReached} onEndReachedThreshold={0.3}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ padding: 20 }} color={Colors.navyPrimary} /> : null}
        renderItem={({ item }) => {
          const prio = item.System_Priority || 'Media';
          const status = item.Status || 'Pendiente';
          return (
            <TouchableOpacity style={styles.card} activeOpacity={0.6}
              onPress={() => router.push(`/(tabs)/admin/tickets/${item.ID_Service_Request}` as any)}>
              <View style={[styles.cardBar, { backgroundColor: barC(prio) }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardCode}>{item.Ticket_Code || `#${item.ID_Service_Request}`}</Text>
                  <View style={styles.badges}>
                    <View style={[styles.badge, { backgroundColor: prioBg(prio) }]}>
                      <Text style={[styles.badgeText, { color: prioTxt(prio) }]}>{prio}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: statBg(status) }]}>
                      <Text style={[styles.badgeText, { color: statTxt(status) }]}>{status === 'En Proceso' ? 'En curso' : status}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.cardSubj} numberOfLines={2}>{item.Subject}</Text>
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="business-outline" size={11} color={Colors.textLight} />
                    <Text style={styles.metaText} numberOfLines={1}>{item.office_name || 'Sin oficina'}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="construct-outline" size={11} color={Colors.textLight} />
                    <Text style={styles.metaText} numberOfLines={1}>{item.service_type_name || '—'}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={loading ? null :
          <View style={styles.empty}>
            <Ionicons name="documents-outline" size={40} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptySub}>{statusFilter ? `No hay tickets "${statusFilter}"` : 'No se encontraron tickets'}</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(tabs)/admin/tickets/create' as any)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={Colors.gold} />
      </TouchableOpacity>
    </View>
  );
}

function barC(p: string) { return p === 'Alta' ? Colors.priorityAlta : p === 'Media' ? Colors.priorityMedia : Colors.textLight; }
function prioBg(p: string) { return p === 'Alta' ? Colors.priorityAltaBg : Colors.priorityMediaBg; }
function prioTxt(p: string) { return p === 'Alta' ? Colors.badgeHighText : Colors.badgeMedText; }
function statBg(s: string) { return s === 'Pendiente' ? Colors.statusPendienteBg : s === 'En Proceso' ? Colors.statusEnProcesoBg : Colors.statusResueltoBg; }
function statTxt(s: string) { return s === 'Pendiente' ? Colors.badgeMedText : s === 'En Proceso' ? Colors.badgeBlueText : Colors.badgeLowText; }

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  filterScroll: { maxHeight: 50 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 6 },
  fTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: BorderRadius.sm, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  fTabActive: { backgroundColor: Colors.navyPrimary, borderColor: Colors.navyPrimary },
  fText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  fTextActive: { color: '#fff' },
  serviceRow: { maxHeight: 44 },
  serviceInner: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 10, gap: 6 },
  sTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.sm, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, gap: 5 },
  sTabActive: { backgroundColor: Colors.navyPrimary + '10', borderColor: Colors.navyPrimary + '40' },
  sText: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary },
  sTextActive: { color: Colors.navyPrimary, fontWeight: '600' },
  list: { paddingBottom: 24 },
  card: { backgroundColor: Colors.surface, marginHorizontal: 12, marginVertical: 3, borderRadius: BorderRadius.md, flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  cardBar: { width: 3 },
  cardBody: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardCode: { fontSize: 11, fontWeight: '600', color: Colors.textLight, fontFamily: 'monospace' },
  badges: { flexDirection: 'row', gap: 5 },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: BorderRadius.sm },
  badgeText: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  cardSubj: { fontSize: 14, fontWeight: '600', color: Colors.text, marginTop: 8, lineHeight: 20 },
  cardMeta: { flexDirection: 'row', marginTop: 10, gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  metaText: { fontSize: 11, color: Colors.textSecondary, flex: 1 },
  empty: { paddingVertical: 60, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 30 },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
});
