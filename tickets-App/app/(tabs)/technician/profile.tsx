import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { Technician } from '../../../src/types/user';
import { useAuth } from '../../../src/hooks/useAuth';
import { useToast } from '../../../src/contexts/ToastContext';
import { getTechnicianProfile, changePassword as changePw } from '../../../src/services/technicianService';
import { Button } from '../../../src/components/ui/Button';

export default function TechnicianProfileScreen() {
  const { logout } = useAuth();
  const toast = useToast();
  const [tech, setTech] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [currPw, setCurrPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confPw, setConfPw] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await getTechnicianProfile();
      if (r.success && r.technician) { setTech(r.technician); }
      setLoading(false);
    })();
  }, []);

  const handlePw = async () => {
    if (!currPw || !newPw || !confPw) return toast.showToast({ title: 'Error', message: 'Completa todos los campos', type: 'error' });
    if (newPw !== confPw) return toast.showToast({ title: 'Error', message: 'No coinciden', type: 'error' });
    if (newPw.length < 6) return toast.showToast({ title: 'Error', message: 'Mínimo 6 caracteres', type: 'error' });
    setSavingPw(true);
    const r = await changePw(currPw, newPw);
    setSavingPw(false);
    if (r.success) { toast.showToast({ title: 'Actualizada', message: 'Contraseña cambiada', type: 'success' }); setShowPw(false); setCurrPw(''); setNewPw(''); setConfPw(''); }
    else toast.showToast({ title: 'Error', message: r.message || '', type: 'error' });
  };

  if (loading) return <View style={styles.ctr}><Text style={styles.ctrText}>Cargando...</Text></View>;
  if (!tech) return <View style={styles.ctr}><Text style={styles.ctrTitle}>No se pudo cargar el perfil</Text><Button title="Salir" onPress={() => logout()} variant="danger" /></View>;

  const statusColor = tech.technician_status === 'Disponible' ? Colors.statusResuelto : tech.technician_status === 'Ocupado' ? Colors.statusPendiente : Colors.textLight;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.scroll}>
      {/* Profile header */}
      <View style={styles.headCard}>
        <View style={[styles.avatar, { backgroundColor: statusColor + '15' }]}>
          <Text style={[styles.avatarText, { color: statusColor }]}>{(tech.first_name || tech.full_name || '?')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{tech.full_name}</Text>
        <Text style={styles.role}>{tech.role_name} · @{tech.username}</Text>
        <View style={[styles.statusPill, { backgroundColor: statusColor + '15' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{tech.technician_status}</Text>
        </View>
      </View>

      {/* Services */}
      <View style={styles.card}>
        <ProfileSectionHead icon="construct-outline" label="Servicios" />
        <View style={styles.tags}>
          {tech.services.map((s) => (
            <View key={s} style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>
          ))}
        </View>
      </View>

      {/* Schedule */}
      <View style={styles.card}>
        <ProfileSectionHead icon="calendar-outline" label="Horario Semanal" />
        {tech.schedule.map((s, i) => (
          <View key={i} style={styles.schedRow}>
            <Text style={styles.schedDay}>{s.day_of_week}</Text>
            <View style={styles.schedBar}>
              <View style={[styles.schedFill, { width: s.work_end_time.includes('15:00') ? '65%' : '80%' }]} />
            </View>
            <Text style={styles.schedTime}>{s.work_start_time} — {s.work_end_time}</Text>
          </View>
        ))}
        {tech.lunch_block ? (
          <View style={styles.lunchRow}>
            <Ionicons name="cafe-outline" size={13} color={Colors.textLight} />
            <Text style={styles.lunchText}>Almuerzo: {tech.lunch_block}</Text>
          </View>
        ) : null}
      </View>

      {/* Metrics */}
      <View style={styles.card}>
        <ProfileSectionHead icon="stats-chart-outline" label="Rendimiento" />
        <View style={styles.metricsGrid}>
          <Metric v={tech.metrics.resolved_today} label="Hoy" icon="today-outline" />
          <Metric v={tech.metrics.resolved_week} label="Semana" icon="calendar-outline" />
          <Metric v={tech.metrics.resolved_month} label="Mes" icon="layers-outline" />
        </View>
      </View>

      {/* Password / Logout */}
      {showPw ? (
        <View style={styles.card}>
          <ProfileSectionHead icon="lock-closed-outline" label="Cambiar Contraseña" />
          <TextInput style={styles.pwInput} placeholder="Contraseña actual" placeholderTextColor={Colors.textLight} secureTextEntry value={currPw} onChangeText={setCurrPw} />
          <TextInput style={styles.pwInput} placeholder="Nueva (mín. 6 caracteres)" placeholderTextColor={Colors.textLight} secureTextEntry value={newPw} onChangeText={setNewPw} />
          <TextInput style={styles.pwInput} placeholder="Confirmar nueva" placeholderTextColor={Colors.textLight} secureTextEntry value={confPw} onChangeText={setConfPw} />
          <View style={styles.pwActions}>
            <Button title="Cancelar" onPress={() => { setShowPw(false); setCurrPw(''); setNewPw(''); setConfPw(''); }} variant="outline" style={{ flex: 1 }} />
            <Button title="Guardar" onPress={handlePw} loading={savingPw} style={{ flex: 1 }} />
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Button title="Cambiar Contraseña" onPress={() => setShowPw(true)} variant="outline" />
          <View style={{ height: 10 }} />
          <Button title="Cerrar Sesión" onPress={() => logout()} variant="danger" />
        </View>
      )}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function ProfileSectionHead({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={psh.wrap}>
      <View style={psh.icon}><Ionicons name={icon} size={13} color={Colors.navyPrimary} /></View>
      <Text style={psh.label}>{label}</Text>
      <View style={psh.line} />
    </View>
  );
}
const psh = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  icon: { width: 26, height: 26, borderRadius: 7, backgroundColor: Colors.navyPrimary + '0C', justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 11, fontWeight: '700', color: Colors.text, textTransform: 'uppercase', letterSpacing: 0.6 },
  line: { flex: 1, height: 1, backgroundColor: Colors.border },
});

function Metric({ v, label, icon }: { v: number; label: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={ms.card}>
      <Ionicons name={icon} size={16} color={Colors.navyPrimary} />
      <Text style={ms.value}>{v}</Text>
      <Text style={ms.label}>{label}</Text>
    </View>
  );
}
const ms = StyleSheet.create({
  card: { flex: 1, backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: 14, alignItems: 'center', gap: 4 },
  value: { fontSize: 20, fontWeight: '800', color: Colors.text },
  label: { fontSize: 10, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
});

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 12 },
  ctr: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, gap: 12, padding: 24 },
  ctrText: { fontSize: 14, color: Colors.textSecondary },
  ctrTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },

  headCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 22,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontSize: 24, fontWeight: '700' },
  name: { fontSize: 19, fontWeight: '700', color: Colors.text },
  role: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 12, paddingVertical: 5, borderRadius: BorderRadius.full },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },

  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.sm, backgroundColor: Colors.navyPrimary + '08', borderWidth: 1, borderColor: Colors.navyPrimary + '15' },
  tagText: { fontSize: 11, fontWeight: '500', color: Colors.navyPrimary },

  schedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  schedDay: { fontSize: 11, color: Colors.text, width: 65, fontWeight: '600' },
  schedBar: { flex: 1, height: 5, backgroundColor: Colors.background, borderRadius: 3, overflow: 'hidden' },
  schedFill: { height: '100%', backgroundColor: Colors.navyPrimary + '20', borderRadius: 3 },
  schedTime: { fontSize: 10, color: Colors.textSecondary, width: 95, textAlign: 'right' },
  lunchRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  lunchText: { fontSize: 11, color: Colors.textSecondary },

  metricsGrid: { flexDirection: 'row', gap: 8 },

  pwInput: { backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: 12, fontSize: 13, color: Colors.text, borderWidth: 1, borderColor: Colors.border, marginTop: 10 },
  pwActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
});
