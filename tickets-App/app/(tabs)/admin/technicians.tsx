import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { getTechniciansGrouped, deleteTechnician } from '../../../src/services/adminService';
import { useToast } from '../../../src/contexts/ToastContext';

export default function AdminTechniciansScreen() {
  const [grouped, setGrouped] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => { setLoading(true); const r = await getTechniciansGrouped(); if (r.success && r.data) setGrouped(r.data); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  const del = (id: number, name: string) => Alert.alert('Eliminar', `¿Eliminar a ${name}?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: async () => { const r = await deleteTechnician(id); toast.showToast({ title: r.success ? 'Eliminado' : 'Error', message: r.message || '', type: r.success ? 'success' : 'error' }); if (r.success) load(); } }]);
  const sc = (s: string) => s === 'Disponible' ? Colors.statusResuelto : s === 'Ocupado' ? Colors.statusPendiente : Colors.textLight;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.navyPrimary} colors={[Colors.navyPrimary]} />}>
      {loading ? <View style={styles.ctr}><Text style={styles.ctrText}>Cargando...</Text></View> :
        grouped.length === 0 ? <View style={styles.ctr}><Ionicons name="people" size={36} color={Colors.textLight} /><Text style={styles.ctrText}>Sin técnicos</Text></View> :
        grouped.map((g: any) => (
          <View key={g.service_id} style={styles.group}>
            <View style={styles.gHead}>
              <View style={styles.gIcon}><Ionicons name="construct" size={14} color={Colors.navyPrimary} /></View>
              <Text style={styles.gName}>{g.service_name}</Text>
              <View style={styles.gCount}><Text style={styles.gCountText}>{g.count}</Text></View>
            </View>
            {(g.technicians || []).map((t: any) => {
              const st = t.Status || 'Inactivo';
              return (
                <View key={t.ID_Technicians} style={styles.tCard}>
                  <View style={styles.tRow}>
                    <View style={[styles.tDot, { backgroundColor: sc(st) }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tName}>{t.First_Name} {t.Last_Name}</Text>
                      <Text style={styles.tEmail}>{t.Email}</Text>
                    </View>
                    <View style={[styles.tStatus, { backgroundColor: sc(st) + '18' }]}>
                      <Text style={[styles.tStatusText, { color: sc(st) }]}>{st}</Text>
                    </View>
                  </View>
                  <View style={styles.tFoot}>
                    <View style={styles.tStat}><Text style={styles.tSn}>{t.Active_Tickets ?? 0}</Text><Text style={styles.tSl}>Activos</Text></View>
                    <View style={styles.tStat}><Text style={styles.tSn}>{t.Tickets_Resolved ?? 0}</Text><Text style={styles.tSl}>Resueltos</Text></View>
                    <TouchableOpacity onPress={() => del(t.ID_Technicians, `${t.First_Name} ${t.Last_Name}`)} style={{ padding: 6 }}>
                      <Ionicons name="trash-outline" size={15} color={Colors.priorityAlta} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 14, paddingTop: 10 },
  ctr: { paddingVertical: 50, alignItems: 'center', gap: 10 },
  ctrText: { fontSize: 14, color: Colors.textSecondary },
  group: { marginBottom: 18 },
  gHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, paddingHorizontal: 2 },
  gIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.navyPrimary + '12', justifyContent: 'center', alignItems: 'center' },
  gName: { fontSize: 14, fontWeight: '600', color: Colors.navyPrimary, flex: 1 },
  gCount: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: BorderRadius.full, backgroundColor: Colors.navyPrimary + '12' },
  gCountText: { fontSize: 11, fontWeight: '600', color: Colors.navyPrimary },
  tCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: 16, marginBottom: 6, borderWidth: 1, borderColor: Colors.border },
  tRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tDot: { width: 8, height: 8, borderRadius: 4 },
  tName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  tEmail: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  tStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  tStatusText: { fontSize: 11, fontWeight: '600' },
  tFoot: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.divider, gap: 4 },
  tStat: { flex: 1, alignItems: 'center' },
  tSn: { fontSize: 16, fontWeight: '700', color: Colors.text },
  tSl: { fontSize: 10, color: Colors.textSecondary, textTransform: 'uppercase', marginTop: 1 },
});
