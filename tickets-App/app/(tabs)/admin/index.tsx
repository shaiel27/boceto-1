import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Head from 'expo-router/head';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { useAuth } from '../../../src/hooks/useAuth';
import { getDashboardStats, getRecentTickets, DashboardStats, AdminRecentTicket } from '../../../src/services/adminService';

export default function AdminDashboardScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<AdminRecentTicket[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const [s, t] = await Promise.all([getDashboardStats(), getRecentTickets(10)]);
    if (s.success && s.stats) setStats(s.stats);
    if (t.success && t.tickets) setRecent(t.tickets);
    setIsLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const pct = (n: number) => Math.round((n / (stats?.total_tickets || 1)) * 100);

  return (
    <>
      <Head><title>Dashboard — Sistema de Tickets</title></Head>
    <ScrollView style={styles.page} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.navyPrimary} colors={[Colors.navyPrimary]} />}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSub}>{user?.full_name || 'Administrador'}</Text>
        </View>
        <TouchableOpacity onPress={() => logout()} style={styles.logout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loading}><Text style={styles.loadingText}>Cargando métricas...</Text></View>
      ) : (
        <>
          {/* KPI Grid — same 6 cards as web */}
          <View style={styles.kpiGrid}>
            <Kpi icon="documents" value={stats?.total_tickets ?? 0} label="Total Tickets" sub="Últimos 30 días" color={Colors.navyPrimary} />
            <Kpi icon="time" value={stats?.pending_count ?? 0} label="Pendientes" sub={`${pct(stats?.pending_count ?? 0)}% del total`} color={Colors.statusPendiente} />
            <Kpi icon="sync" value={stats?.in_progress_count ?? 0} label="En Proceso" sub={`${pct(stats?.in_progress_count ?? 0)}% del total`} color={Colors.statusEnProceso} />
            <Kpi icon="checkmark-done" value={stats?.resolved_count ?? 0} label="Completados" sub={`${(stats?.resolution_rate ?? 0).toFixed(1)}% tasa`} color={Colors.statusResuelto} />
            <Kpi icon="warning" value={stats?.critical_count ?? 0} label="Críticos" sub="Requieren atención" color={Colors.priorityAlta} />
            <Kpi icon="people" value={stats?.active_technicians ?? 0} label="Técnicos Activos" sub={stats?.avg_resolution_hours ? `${stats.avg_resolution_hours.toFixed(1)}h prom.` : 'Disponibles'} color={Colors.institutionGold} />
          </View>

          {/* Activity Grid — 4 quick stats row */}
          <View style={styles.activityGrid}>
            <ActivityItem icon="time" value={stats?.today_count ?? 0} label="Hoy" />
            <ActivityItem icon="trending-up" value={stats?.week_count ?? 0} label="Esta semana" />
            <ActivityItem icon="business" value={stats?.active_offices ?? 0} label="Oficinas activas" />
            <ActivityItem icon="hourglass" value={stats?.avg_resolution_hours ? `${stats.avg_resolution_hours.toFixed(1)}h` : 'N/A'} label="Tiempo promedio" />
          </View>

          {/* Status Distribution Bars */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Ionicons name="bar-chart" size={16} color={Colors.navyPrimary} />
              <Text style={styles.cardTitle}>Distribución por Estado</Text>
            </View>
            <BarRow label="Pendientes" value={stats?.pending_count ?? 0} pct={pct(stats?.pending_count ?? 0)} color={Colors.statusPendiente} />
            <BarRow label="En Proceso" value={stats?.in_progress_count ?? 0} pct={pct(stats?.in_progress_count ?? 0)} color={Colors.statusEnProceso} />
            <BarRow label="Completados" value={stats?.resolved_count ?? 0} pct={pct(stats?.resolved_count ?? 0)} color={Colors.statusResuelto} />
          </View>

          {/* Navigation modules */}
          <View style={[styles.card, { paddingHorizontal: 0, paddingBottom: 0 }]}>
            <View style={[styles.cardHead, { paddingHorizontal: 16 }]}>
              <Ionicons name="grid" size={16} color={Colors.navyPrimary} />
              <Text style={styles.cardTitle}>Módulos</Text>
            </View>
            <View style={styles.navRow}>
              <NavItem icon="add-circle" label="Nuevo Ticket" onPress={() => router.push('/(tabs)/admin/tickets/create' as any)} accent />
              <NavItem icon="documents" label="Tickets" onPress={() => router.push('/(tabs)/admin/tickets' as any)} />
              <NavItem icon="people" label="Técnicos" onPress={() => router.push('/(tabs)/admin/technicians' as any)} />
              <NavItem icon="person-add" label="Usuarios" onPress={() => router.push('/(tabs)/admin/users' as any)} />
            </View>
          </View>

          {/* Recent Tickets */}
          <View style={[styles.card, { paddingHorizontal: 0, paddingBottom: 0 }]}>
            <View style={[styles.cardHead, { paddingHorizontal: 16 }]}>
              <Ionicons name="documents" size={16} color={Colors.navyPrimary} />
              <Text style={styles.cardTitle}>Tickets Recientes</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/admin/tickets' as any)}>
                <Text style={styles.seeAll}>Ver todos ›</Text>
              </TouchableOpacity>
            </View>
            {recent.length === 0 ? (
              <View style={styles.emptyBox}><Text style={styles.emptyText}>Sin actividad reciente</Text></View>
            ) : recent.slice(0, 8).map((t, i) => (
              <TouchableOpacity key={t.ID_Service_Request} style={[styles.tRow, i < recent.slice(0, 8).length - 1 && styles.tRowBorder]}
                onPress={() => router.push(`/(tabs)/admin/tickets/${t.ID_Service_Request}` as any)} activeOpacity={0.5}>
                <View style={[styles.tPrio, { backgroundColor: t.System_Priority === 'Alta' ? Colors.priorityAlta : t.System_Priority === 'Media' ? Colors.statusPendiente : Colors.textLight }]} />
                <View style={styles.tBody}>
                  <View style={styles.tTop}>
                    <Text style={styles.tCode}>{t.Ticket_Code || `#${t.ID_Service_Request}`}</Text>
                    <View style={[styles.tStatus, { backgroundColor: statusBg(t.Status) }]}>
                      <Text style={[styles.tStatusText, { color: statusFg(t.Status) }]}>{t.Status === 'En Proceso' ? 'En curso' : t.Status}</Text>
                    </View>
                  </View>
                  <Text style={styles.tSubject} numberOfLines={1}>{t.Subject}</Text>
                  <View style={styles.tMeta}>
                    <Text style={styles.tMetaText}>{t.Service_Name}</Text>
                    <Text style={styles.tMetaDot}>·</Text>
                    <Text style={styles.tMetaText}>{t.Office_Name}</Text>
                    <Text style={styles.tMetaDot}>·</Text>
                    <Text style={styles.tTime}>{t.Time_Ago}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: 32 }} />
        </>
      )}
    </ScrollView></>
  );
}

function Kpi({ icon, value, label, sub, color }: any) {
  return (
    <View style={kpi.card}>
      <View style={[kpi.topBar, { backgroundColor: color }]} />
      <View style={kpi.inner}>
        <View style={kpi.iconRow}>
          <View style={[kpi.iconBg, { backgroundColor: color }]}>
            <Ionicons name={icon} size={20} color="#fff" />
          </View>
          <Text style={kpi.value}>{value}</Text>
        </View>
        <Text style={kpi.label}>{label}</Text>
        <Text style={kpi.sub}>{sub}</Text>
      </View>
    </View>
  );
}
function ActivityItem({ icon, value, label }: any) {
  return (
    <View style={ai.card}>
      <Ionicons name={icon} size={18} color={Colors.navyPrimary} />
      <View>
        <Text style={ai.val}>{value}</Text>
        <Text style={ai.lbl}>{label}</Text>
      </View>
    </View>
  );
}
function BarRow({ label, value, pct, color }: any) {
  return (
    <View style={br.wrap}>
      <View style={br.top}>
        <Text style={br.name}>{label}</Text>
        <Text style={br.num}>{value} ({pct}%)</Text>
      </View>
      <View style={br.track}>
        <View style={[br.fill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}
function NavItem({ icon, label, onPress, accent }: any) {
  return (
    <TouchableOpacity style={ni.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[ni.icon, accent && ni.iconAccent]}>
        <Ionicons name={icon} size={22} color={accent ? Colors.surface : Colors.navyPrimary} />
      </View>
      <Text style={[ni.label, accent && ni.labelAccent]}>{label}</Text>
    </TouchableOpacity>
  );
}
function statusBg(s: string) {
  if (s === 'Pendiente') return Colors.statusPendienteBg;
  if (s === 'En Proceso') return Colors.statusEnProcesoBg;
  return Colors.statusResueltoBg;
}
function statusFg(s: string) {
  if (s === 'Pendiente') return Colors.badgeMedText;
  if (s === 'En Proceso') return Colors.badgeBlueText;
  return Colors.badgeLowText;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  logout: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  loading: { paddingVertical: 80, alignItems: 'center' },
  loadingText: { fontSize: 14, color: Colors.textSecondary },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, paddingTop: 16, gap: 10 },
  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, paddingTop: 12, gap: 10 },
  card: { backgroundColor: Colors.surface, marginHorizontal: 10, marginTop: 14, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  cardTitle: { fontSize: 14, fontWeight: '600', color: Colors.text, flex: 1 },
  seeAll: { fontSize: 12, fontWeight: '600', color: Colors.navyPrimary },
  navRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  emptyBox: { padding: 28, alignItems: 'center', paddingHorizontal: 16 },
  emptyText: { fontSize: 13, color: Colors.textLight },
  tRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, alignItems: 'flex-start' },
  tRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  tPrio: { width: 3, height: '100%', borderRadius: 2, marginRight: 12, marginTop: 2 },
  tBody: { flex: 1 },
  tTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tCode: { fontSize: 11, fontWeight: '600', color: Colors.textLight, fontFamily: 'monospace' },
  tStatus: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.sm },
  tStatusText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  tSubject: { fontSize: 13, fontWeight: '600', color: Colors.text, marginTop: 4 },
  tMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  tMetaText: { fontSize: 11, color: Colors.textSecondary },
  tMetaDot: { fontSize: 10, color: Colors.textLight },
  tTime: { fontSize: 11, color: Colors.textLight, fontStyle: 'italic' },
});

const kpi = StyleSheet.create({
  card: { width: '30%', flexGrow: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  topBar: { height: 3 },
  inner: { padding: 14, gap: 2 },
  iconRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBg: { width: 34, height: 34, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
  value: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  label: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  sub: { fontSize: 10, color: Colors.textLight, marginTop: 2 },
});

const ai = StyleSheet.create({
  card: { width: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: 14 },
  val: { fontSize: 17, fontWeight: '700', color: Colors.text },
  lbl: { fontSize: 11, color: Colors.textLight },
});

const br = StyleSheet.create({
  wrap: { marginBottom: 12 },
  top: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  name: { fontSize: 12, fontWeight: '600', color: Colors.text },
  num: { fontSize: 11, color: Colors.textLight },
  track: { height: 6, backgroundColor: Colors.background, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});

const ni = StyleSheet.create({
  card: { flex: 1, alignItems: 'center', paddingVertical: 14, backgroundColor: Colors.background, borderRadius: BorderRadius.md },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  iconAccent: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  label: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  labelAccent: { color: Colors.primary, fontWeight: '700' },
});
