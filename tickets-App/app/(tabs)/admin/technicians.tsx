import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { getTechniciansGrouped, deleteTechnician } from '../../../src/services/adminService';
import { useToast } from '../../../src/contexts/ToastContext';

const SERVICE_META: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }> = {
  '1': { icon: 'wifi', color: '#3b82f6', label: 'Redes' },
  '2': { icon: 'hardware-chip', color: '#f59e0b', label: 'Soporte' },
  '3': { icon: 'code-slash', color: '#8b5cf6', label: 'Programación' },
};

export default function AdminTechniciansScreen() {
  const [grouped, setGrouped] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const tabAnim = useRef(new Animated.Value(0)).current;
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const r = await getTechniciansGrouped();
    if (r.success && r.data) setGrouped(r.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const del = (id: number, name: string) =>
    Alert.alert('Marcar fuera de servicio', `¿Marcar a ${name} como fuera de servicio?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Desactivar', style: 'destructive', onPress: async () => {
        const r = await deleteTechnician(id);
        toast.showToast({ title: r.success ? 'Desactivado' : 'Error', message: r.message || '', type: r.success ? 'success' : 'error' });
        if (r.success) load();
      }},
    ]);

  const statusColor = (s: string) =>
    s === 'Disponible' ? Colors.statusResuelto : s === 'Ocupado' ? Colors.statusPendiente : s === 'Fuera de Servicio' ? '#ef4444' : Colors.textLight;

  const handleTabChange = (index: number) => {
    Animated.spring(tabAnim, { toValue: index, useNativeDriver: true, tension: 80, friction: 10 }).start();
    setActiveTab(index);
  };

  if (loading) {
    return (
      <View style={styles.stateWrap}>
        <Ionicons name="people-outline" size={48} color={Colors.textLight} />
        <Text style={styles.stateTitle}>Cargando técnicos...</Text>
      </View>
    );
  }

  if (!loading && grouped.length === 0) {
    return (
      <View style={styles.stateWrap}>
        <Ionicons name="people-outline" size={48} color={Colors.textLight} />
        <Text style={styles.stateTitle}>Sin técnicos registrados</Text>
        <Text style={styles.stateSub}>Los técnicos aparecerán agrupados por área</Text>
      </View>
    );
  }

  const activeGroup = grouped[activeTab];
  const techs = activeGroup?.technicians || [];
  const activeMeta = SERVICE_META[String(activeGroup?.service_id)];
  const activeAccent = activeMeta?.color ?? Colors.primary;
  const totalCount = grouped.reduce((s: number, g: any) => s + (g.count || 0), 0);

  return (
    <View style={styles.page}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        {grouped.map((g: any, index: number) => {
          const meta = SERVICE_META[String(g.service_id)];
          const active = activeTab === index;
          return (
            <TouchableOpacity
              key={g.service_id}
              style={[styles.tab, active && { backgroundColor: meta?.color + '14' }]}
              onPress={() => handleTabChange(index)}
              activeOpacity={0.7}
            >
              <Ionicons name={meta?.icon ?? 'construct'} size={18} color={active ? meta?.color : Colors.textLight} />
              <Text style={[styles.tabText, active && { color: meta?.color, fontWeight: '700' }]}>
                {g.service_name}
              </Text>
              <View style={[styles.tabCount, active && { backgroundColor: meta?.color + '22' }]}>
                <Text style={[styles.tabCountText, active && { color: meta?.color }]}>{g.count}</Text>
              </View>
              {active && <View style={[styles.tabIndicator, { backgroundColor: meta?.color }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {techs.length === 0 ? (
        <View style={styles.emptyTab}>
          <Ionicons name="person-outline" size={40} color={Colors.textLight} />
          <Text style={styles.emptyTabTitle}>Sin técnicos</Text>
          <Text style={styles.emptyTabSub}>
            No hay técnicos asignados a {activeGroup?.service_name}
          </Text>
        </View>
      ) : (
        <FlatList
          data={techs}
          keyExtractor={(item: any) => String(item.ID_Technicians)}
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
          renderItem={({ item: t }: { item: any }) => {
            const st = t.Status || 'Inactivo';
            const sc = statusColor(st);
            const meta = SERVICE_META[String(activeGroup?.service_id)];
            const accent = meta?.color ?? Colors.primary;
            return (
              <View style={styles.tCard}>
                <View style={styles.tRow}>
                  <View style={[styles.tAvatar, { backgroundColor: accent + '14' }]}>
                    <Text style={[styles.tAvatarText, { color: accent }]}>
                      {String(t.First_Name || '').charAt(0)}{String(t.Last_Name || '').charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tName}>{t.First_Name} {t.Last_Name}</Text>
                    <Text style={styles.tEmail} numberOfLines={1}>{t.Email || 'Sin email'}</Text>
                  </View>
                  <View style={[styles.tStatus, { backgroundColor: sc + '16' }]}>
                    <View style={[styles.tStatusDot, { backgroundColor: sc }]} />
                    <Text style={[styles.tStatusText, { color: sc }]}>{st}</Text>
                  </View>
                </View>

                <View style={styles.tFooter}>
                  <View style={styles.tStat}>
                    <Text style={[styles.tStatValue, { color: Colors.statusEnProceso }]}>{t.Active_Tickets ?? 0}</Text>
                    <Text style={styles.tStatLabel}>Activos</Text>
                  </View>
                  <View style={styles.tStatDiv} />
                  <View style={styles.tStat}>
                    <Text style={[styles.tStatValue, { color: Colors.statusResuelto }]}>{t.Tickets_Resolved ?? 0}</Text>
                    <Text style={styles.tStatLabel}>Resueltos</Text>
                  </View>
                  <View style={styles.tStatDiv} />
                  <TouchableOpacity
                    style={styles.tDelBtn}
                    onPress={() => del(t.ID_Technicians, `${t.First_Name} ${t.Last_Name}`)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.coral} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListHeaderComponent={
            <View style={styles.sectionHead}>
              <Ionicons name={activeMeta?.icon ?? 'construct'} size={22} color={activeAccent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>{activeGroup?.service_name}</Text>
                {activeGroup?.service_details ? (
                  <Text style={styles.sectionDesc}>{activeGroup.service_details}</Text>
                ) : null}
              </View>
              <Text style={styles.sectionTotal}>{techs.length} técnicos</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },

  stateWrap: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  stateTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  stateSub: { fontSize: 13, color: Colors.textSecondary },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 3,
    position: 'relative',
  },
  tabText: { fontSize: 11, fontWeight: '500', color: Colors.textSecondary },
  tabCount: { paddingHorizontal: 7, paddingVertical: 1, borderRadius: BorderRadius.full, backgroundColor: Colors.border },
  tabCountText: { fontSize: 10, fontWeight: '600', color: Colors.textLight },
  tabIndicator: { position: 'absolute', bottom: 0, height: 3, left: '20%', right: '20%', borderTopLeftRadius: 2, borderTopRightRadius: 2 },

  emptyTab: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 8 },
  emptyTabTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginTop: 8 },
  emptyTabSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },

  list: { padding: 16, paddingBottom: 32 },

  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, letterSpacing: -0.3 },
  sectionDesc: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  sectionTotal: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },

  tCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tAvatar: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  tAvatarText: { fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  tName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  tEmail: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  tStatus: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full },
  tStatusDot: { width: 6, height: 6, borderRadius: 3 },
  tStatusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },

  tFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  tStat: { flex: 1, alignItems: 'center' },
  tStatValue: { fontSize: 18, fontWeight: '800' },
  tStatLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  tStatDiv: { width: 1, height: 28, backgroundColor: Colors.border },
  tDelBtn: { padding: 8, paddingLeft: 16 },
});
