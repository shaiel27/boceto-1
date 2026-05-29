import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { getReportsList, getReport, ReportItem, ReportData } from '../../../src/services/adminService';

function fmtDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export default function AdminReportsScreen() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [data, setData] = useState<ReportData | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [startDate, setStartDate] = useState(fmtDate(new Date(Date.now() - 30 * 86400000)));
  const [endDate, setEndDate] = useState(fmtDate(new Date()));

  const loadList = useCallback(async () => {
    const r = await getReportsList();
    if (r.success && r.reports) setReports(r.reports);
    setLoading(false);
  }, []);

  useEffect(() => { loadList(); }, [loadList]);

  const onRefresh = async () => { setRefreshing(true); await loadList(); setRefreshing(false); };

  const loadReport = async (action: string) => {
    setSelected(action);
    setLoadingReport(true);
    const r = await getReport(action, startDate, endDate);
    if (r.success && r.data) setData(r.data);
    setLoadingReport(false);
  };

  const quickDates = [
    { label: '7d', days: 7 },
    { label: '15d', days: 15 },
    { label: '30d', days: 30 },
    { label: '60d', days: 60 },
  ];

  const setQuick = (days: number) => {
    setStartDate(fmtDate(new Date(Date.now() - days * 86400000)));
    setEndDate(fmtDate(new Date()));
  };

  const iconFor = (action: string): keyof typeof Ionicons.glyphMap => {
    switch (action) {
      case 'general': return 'analytics-outline';
      case 'response-times': return 'timer-outline';
      case 'office': return 'business-outline';
      case 'priority': return 'flag-outline';
      case 'technician-workload': return 'people-outline';
      case 'service': return 'construct-outline';
      case 'weekly': return 'calendar-outline';
      default: return 'document-text-outline';
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.navyPrimary} />}>

      {/* Date range */}
      <View style={styles.card}>
        <Text style={styles.sLabel}>Período</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.dateBtn} onPress={() => {}}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.dateText}>{startDate}</Text>
          </TouchableOpacity>
          <Text style={styles.dateSep}>—</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => {}}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.dateText}>{endDate}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.quickRow}>
          {quickDates.map((q) => (
            <TouchableOpacity key={q.days} style={styles.quickChip} onPress={() => setQuick(q.days)}>
              <Text style={styles.quickText}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Report list */}
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={Colors.navyPrimary} /><Text style={styles.loadingText}>Cargando reportes...</Text></View>
      ) : (
        reports.map((r) => {
          const isActive = selected === r.action;
          return (
            <View key={r.action}>
              <TouchableOpacity style={[styles.rCard, isActive && styles.rCardActive]} onPress={() => loadReport(r.action)} activeOpacity={0.7}>
                <View style={[styles.rIcon, isActive && styles.rIconActive]}>
                  <Ionicons name={iconFor(r.action)} size={20} color={isActive ? '#fff' : Colors.navyPrimary} />
                </View>
                <View style={styles.rInfo}>
                  <Text style={styles.rLabel}>{r.label}</Text>
                  <Text style={styles.rDesc}>{r.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
              </TouchableOpacity>

              {/* Report data */}
              {isActive && (
                <View style={styles.reportContent}>
                  {loadingReport ? (
                    <ActivityIndicator style={{ padding: 20 }} color={Colors.navyPrimary} />
                  ) : data ? (
                    <>
                      {data.summary && (
                        <View style={styles.summaryCard}>
                          <Text style={styles.summaryTitle}>Resumen</Text>
                          <View style={styles.summaryGrid}>
                            <StatBox label="Total" value={data.summary.total ?? 0} color={Colors.navyPrimary} />
                            <StatBox label="Pendientes" value={data.summary.pending ?? 0} color={Colors.statusPendiente} />
                            <StatBox label="En Proceso" value={data.summary.in_progress ?? 0} color={Colors.statusEnProceso} />
                            <StatBox label="Resueltos" value={data.summary.resolved ?? 0} color={Colors.statusResuelto} />
                          </View>
                          {data.summary.resolution_rate !== undefined && (
                            <View style={styles.summaryExtra}>
                              <ExtraRow label="Tasa resolución" value={`${data.summary.resolution_rate}%`} />
                              <ExtraRow label="Tiempo promedio" value={`${data.summary.avg_hours ?? 'N/A'}h`} />
                              <ExtraRow label="Alta prioridad" value={data.summary.alta_count ?? 0} />
                            </View>
                          )}
                        </View>
                      )}

                      {data.monthly && (
                        <View style={styles.tableCard}>
                          <Text style={styles.summaryTitle}>Mensual</Text>
                          <View style={styles.tableHeader}>
                            <Text style={[styles.th, { flex: 2 }]}>Mes</Text>
                            <Text style={styles.th}>Tot</Text>
                            <Text style={styles.th}>Pen</Text>
                            <Text style={styles.th}>Proc</Text>
                            <Text style={styles.th}>Res</Text>
                          </View>
                          {data.monthly.slice(0, 6).map((row: any, i: number) => (
                            <View key={i} style={[styles.tr, i % 2 === 0 && styles.trAlt]}>
                              <Text style={[styles.td, { flex: 2 }]}>{row.month}</Text>
                              <Text style={styles.td}>{row.total}</Text>
                              <Text style={styles.td}>{row.pending}</Text>
                              <Text style={styles.td}>{row.in_progress}</Text>
                              <Text style={styles.td}>{row.resolved}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Flat data tables */}
                      {!data.summary && !data.monthly && !data.daily && Array.isArray(data) && data.length > 0 && (
                        <View style={styles.tableCard}>
                          <View style={styles.tableHeader}>
                            {Object.keys(data[0]).slice(0, 6).map((k) => (
                              <Text key={k} style={[styles.th, { flex: 1 }]} numberOfLines={1}>{k.replace(/_/g, ' ')}</Text>
                            ))}
                          </View>
                          {data.slice(0, 10).map((row: any, i: number) => (
                            <View key={i} style={[styles.tr, i % 2 === 0 && styles.trAlt]}>
                              {Object.values(row).slice(0, 6).map((v: any, j: number) => (
                                <Text key={j} style={styles.td} numberOfLines={1}>{typeof v === 'number' ? Math.round(v * 10) / 10 : String(v)}</Text>
                              ))}
                            </View>
                          ))}
                        </View>
                      )}
                    </>
                  ) : (
                    <Text style={styles.noData}>Sin datos para este período</Text>
                  )}
                </View>
              )}
            </View>
          );
        })
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[sb.card, { borderLeftColor: color }]}>
      <Text style={[sb.value, { color }]}>{value}</Text>
      <Text style={sb.label}>{label}</Text>
    </View>
  );
}
const sb = StyleSheet.create({
  card: { flex: 1, backgroundColor: Colors.background, borderRadius: BorderRadius.sm, padding: 12, borderLeftWidth: 3, alignItems: 'center' },
  value: { fontSize: 18, fontWeight: '700' },
  label: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
});

function ExtraRow({ label, value }: { label: string; value: any }) {
  return (
    <View style={er.row}>
      <Text style={er.label}>{label}</Text>
      <Text style={er.value}>{value}</Text>
    </View>
  );
}
const er = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  label: { fontSize: 12, color: Colors.textSecondary },
  value: { fontSize: 12, fontWeight: '600', color: Colors.text },
});

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 14 },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  sLabel: { fontSize: 12, fontWeight: '600', color: Colors.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.background, borderRadius: BorderRadius.sm, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border },
  dateText: { fontSize: 13, color: Colors.text, fontFamily: 'monospace' },
  dateSep: { fontSize: 14, color: Colors.textLight },
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  quickChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.full, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  quickText: { fontSize: 12, fontWeight: '500', color: Colors.navyPrimary },
  loading: { padding: 30, alignItems: 'center', gap: 10 },
  loadingText: { fontSize: 13, color: Colors.textSecondary },
  rCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.border },
  rCardActive: { borderColor: Colors.navyPrimary, borderWidth: 2 },
  rIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.navyPrimary + '10', justifyContent: 'center', alignItems: 'center' },
  rIconActive: { backgroundColor: Colors.navyPrimary },
  rInfo: { flex: 1 },
  rLabel: { fontSize: 14, fontWeight: '600', color: Colors.text },
  rDesc: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  reportContent: { paddingLeft: 54, paddingRight: 4, paddingBottom: 12 },
  summaryCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: 14, borderWidth: 1, borderColor: Colors.border },
  summaryTitle: { fontSize: 12, fontWeight: '600', color: Colors.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  summaryGrid: { flexDirection: 'row', gap: 8 },
  summaryExtra: { marginTop: 10 },
  tableCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: 10, borderWidth: 1, borderColor: Colors.border, marginTop: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: Colors.navyPrimary, borderRadius: BorderRadius.sm, paddingVertical: 6, paddingHorizontal: 4 },
  th: { flex: 1, fontSize: 9, fontWeight: '600', color: '#fff', textAlign: 'center', textTransform: 'uppercase' },
  tr: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 4 },
  trAlt: { backgroundColor: Colors.background },
  td: { flex: 1, fontSize: 10, color: Colors.text, textAlign: 'center' },
  noData: { fontSize: 12, color: Colors.textLight, fontStyle: 'italic', padding: 16 },
});
