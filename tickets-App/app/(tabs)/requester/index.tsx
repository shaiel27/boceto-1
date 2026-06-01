import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { useTickets } from '../../../src/contexts/TicketContext';
import { useAuth } from '../../../src/hooks/useAuth';

export default function RequesterDashboard() {
  const { user, logout } = useAuth();
  const { tickets, isLoading, refreshTickets } = useTickets();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');

  const activeTickets = useMemo(() => tickets.filter((t) => t.status !== 'Resuelto'), [tickets]);
  const resolvedTickets = useMemo(() => tickets.filter((t) => t.status === 'Resuelto'), [tickets]);
  const displayed = activeTab === 'active' ? activeTickets : tickets;

  const onRefresh = async () => { setRefreshing(true); await refreshTickets(); setRefreshing(false); };

  const office = user?.office_name || '';

  return (
    <View style={styles.page}>
      <FlatList
        data={displayed}
        keyExtractor={(item, idx) => String(item.id ?? idx)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} progressBackgroundColor={Colors.surface} />
        }
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.greeting}>Mis Solicitudes</Text>
                  <Text style={styles.name}>{user?.full_name || 'Solicitante'}</Text>
                  {office ? (
                    <View style={styles.officeRow}>
                      <Ionicons name="business-outline" size={12} color={Colors.gold} />
                      <Text style={styles.officeText}>{office}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.headerActions}>
                  <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/(tabs)/requester/create' as any)} activeOpacity={0.7}>
                    <Ionicons name="add" size={22} color={Colors.gold} />
                    <Text style={styles.newBtnText}>Nueva</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.logoutBtn} onPress={() => logout()} activeOpacity={0.7}>
                    <Ionicons name="log-out-outline" size={20} color={Colors.surface} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="sync-outline" size={18} color={Colors.statusEnProceso} />
                <Text style={[styles.statValue, { color: Colors.statusEnProceso }]}>{activeTickets.filter((t) => t.status === 'En Proceso').length}</Text>
                <Text style={styles.statLabel}>En Proceso</Text>
              </View>
              <View style={styles.statDiv} />
              <View style={styles.statCard}>
                <Ionicons name="checkmark-done-outline" size={18} color={Colors.statusResuelto} />
                <Text style={[styles.statValue, { color: Colors.statusResuelto }]}>{resolvedTickets.length}</Text>
                <Text style={styles.statLabel}>Completados</Text>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
              <TouchableOpacity style={[styles.tab, activeTab === 'active' && styles.tabActive]} onPress={() => setActiveTab('active')} activeOpacity={0.7}>
                <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>Activos</Text>
                <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{activeTickets.length}</Text></View>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, activeTab === 'all' && styles.tabActive]} onPress={() => setActiveTab('all')} activeOpacity={0.7}>
                <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>Todos</Text>
              </TouchableOpacity>
            </View>

            {/* History link */}
            {resolvedTickets.length > 0 && (
              <TouchableOpacity style={styles.historyLink} onPress={() => router.push('/(tabs)/requester/history' as any)} activeOpacity={0.6}>
                <Ionicons name="time-outline" size={16} color={Colors.primary} />
                <Text style={styles.historyText}>Ver historial</Text>
                <Text style={styles.historyCount}>{resolvedTickets.length} resueltos</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.55} onPress={() => router.push(`/(tabs)/requester/${item.id}` as any)}>
            <View style={[styles.cardLeft, { backgroundColor: pColor(item.system_priority) }]} />
            <View style={styles.cardBody}>
              <View style={styles.cardHead}>
                <Text style={styles.cardCode}>{item.ticket_code}</Text>
                <View style={[styles.badge, { backgroundColor: sBg(item.status) }]}>
                  <View style={[styles.sDot, { backgroundColor: sColor(item.status) }]} />
                  <Text style={[styles.badgeText, { color: sTxt(item.status) }]}>{item.status === 'En Proceso' ? 'En curso' : item.status}</Text>
                </View>
              </View>
              <Text style={styles.cardSubject} numberOfLines={2}>{item.subject}</Text>
              <View style={styles.cardMeta}>
                <Ionicons name="construct-outline" size={11} color={Colors.textLight} />
                <Text style={styles.cardMetaText}>{item.service_name}</Text>
                {item.technician_names.length > 0 && (
                  <>
                    <Ionicons name="person-outline" size={11} color={Colors.textLight} style={{ marginLeft: 10 }} />
                    <Text style={styles.cardMetaText}>{item.technician_names[0]}</Text>
                  </>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={isLoading ? null : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="documents-outline" size={36} color={Colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>{activeTab === 'active' ? 'Sin tickets activos' : 'Sin tickets'}</Text>
            <Text style={styles.emptySub}>Crea un nuevo ticket para comenzar</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/requester/create' as any)}>
              <Ionicons name="add" size={18} color={Colors.gold} />
              <Text style={styles.emptyBtnText}>Nuevo Ticket</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

function pColor(p: string) { return p === 'Alta' ? Colors.priorityAlta : p === 'Media' ? Colors.priorityMedia : p === 'Critica' ? Colors.coral : Colors.textLight; }
function sColor(s: string) { return s === 'Pendiente' ? Colors.statusPendiente : s === 'En Proceso' ? Colors.statusEnProceso : Colors.statusResuelto; }
function sBg(s: string) { return s === 'Pendiente' ? Colors.statusPendienteBg : s === 'En Proceso' ? Colors.statusEnProcesoBg : Colors.statusResueltoBg; }
function sTxt(s: string) { return s === 'Pendiente' ? Colors.badgeMedText : s === 'En Proceso' ? Colors.badgeBlueText : Colors.badgeLowText; }

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: 32 },
  header: { backgroundColor: Colors.primary, paddingTop: 52, paddingBottom: 28, paddingHorizontal: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greeting: { fontSize: 11, color: Colors.gold, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: '600', opacity: 0.8 },
  name: { fontSize: 24, fontWeight: '800', color: Colors.surface, marginTop: 2, letterSpacing: -0.3 },
  officeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  officeText: { fontSize: 12, fontWeight: '500', color: Colors.gold, opacity: 0.85 },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: BorderRadius.md },
  newBtnText: { fontSize: 13, fontWeight: '600', color: Colors.gold },
  logoutBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },

  statsRow: { flexDirection: 'row', margin: 16, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: 16, borderWidth: 1, borderColor: Colors.border },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  statDiv: { width: 1, backgroundColor: Colors.border, marginHorizontal: 4 },

  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, gap: 8 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: BorderRadius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  tabActive: { backgroundColor: Colors.primary + '0A', borderColor: Colors.primary + '30' },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },
  tabBadge: { paddingHorizontal: 7, paddingVertical: 1, borderRadius: BorderRadius.full, backgroundColor: Colors.border },
  tabBadgeText: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary },

  historyLink: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, gap: 6 },
  historyText: { fontSize: 13, fontWeight: '600', color: Colors.primary, flex: 1 },
  historyCount: { fontSize: 11, color: Colors.textLight },

  card: { backgroundColor: Colors.surface, marginHorizontal: 16, marginBottom: 6, borderRadius: BorderRadius.lg, flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  cardLeft: { width: 4 },
  cardBody: { flex: 1, padding: 14 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardCode: { fontSize: 11, fontWeight: '700', color: Colors.textLight, fontFamily: 'monospace', textTransform: 'uppercase' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  sDot: { width: 5, height: 5, borderRadius: 3 },
  cardSubject: { fontSize: 14, fontWeight: '600', color: Colors.text, lineHeight: 20 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 4 },
  cardMetaText: { fontSize: 11, color: Colors.textSecondary },

  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.border, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  emptySub: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: Colors.gold },
});
