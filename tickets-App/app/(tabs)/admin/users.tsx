import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { getUsersWithOffice, AdminUser, ROLE_COLORS } from '../../../src/services/adminService';

const RF = [0, 1, 2, 3, 4];
const RL: Record<number, string> = { 0: 'Todos', 1: 'Admin', 2: 'Técnicos', 3: 'Jefes', 4: 'Auditor' };

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [role, setRole] = useState(0);

  const load = useCallback(async () => { setLoading(true); const r = await getUsersWithOffice(); if (r.success && r.users) setUsers(r.users); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  const filtered = role === 0 ? users : users.filter((u) => u.Fk_Role === role);

  return (
    <View style={styles.page}>
      <View style={styles.fRow}>{RF.map((f) => (
        <TouchableOpacity key={f} style={[styles.fTab, role === f && styles.fTabActive]} onPress={() => setRole(f)}>
          <Text style={[styles.fText, role === f && styles.fTextActive]}>{RL[f]}</Text>
        </TouchableOpacity>
      ))}</View>
      <FlatList data={filtered} keyExtractor={(item) => String(item.ID_Users)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.navyPrimary} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const c = ROLE_COLORS[item.role_name || ''] || Colors.textSecondary;
          return (
            <View style={styles.card}>
              <View style={[styles.av, { backgroundColor: c + '15' }]}>
                <Text style={[styles.avText, { color: c }]}>{(item.Full_Name || '?')[0]}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.Full_Name}</Text>
                <Text style={styles.email}>{item.Email}</Text>
                {item.office_name ? <View style={styles.off}><Ionicons name="business" size={11} color={Colors.textLight} /><Text style={styles.offText} numberOfLines={1}>{item.office_name}</Text></View> : null}
              </View>
              <View style={[styles.roleBadge, { backgroundColor: c + '12', borderColor: c + '25' }]}>
                <Text style={[styles.roleText, { color: c }]}>{item.role_name}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="people" size={36} color={Colors.textLight} /><Text style={styles.emptyText}>Sin usuarios</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  fRow: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12, gap: 6 },
  fTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.sm, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  fTabActive: { backgroundColor: Colors.navyPrimary, borderColor: Colors.navyPrimary },
  fText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  fTextActive: { color: '#fff' },
  list: { paddingBottom: 24 },
  card: { backgroundColor: Colors.surface, marginHorizontal: 14, marginVertical: 3, borderRadius: BorderRadius.md, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.border },
  av: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avText: { fontSize: 16, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: Colors.text },
  email: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  off: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  offText: { fontSize: 11, color: Colors.textSecondary, flex: 1 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: BorderRadius.full, borderWidth: 1 },
  roleText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  empty: { paddingVertical: 60, alignItems: 'center', gap: 10 },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
});
