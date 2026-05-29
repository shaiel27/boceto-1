import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { Technician } from '../../../src/types/user';
import { useAuth } from '../../../src/hooks/useAuth';
import { useToast } from '../../../src/contexts/ToastContext';
import { getTechnicianProfile, toggleTechnicianAvailability, changePassword as changePw } from '../../../src/services/technicianService';
import { Button } from '../../../src/components/ui/Button';

export default function TechnicianProfileScreen() {
  const { logout } = useAuth();
  const toast = useToast();
  const [tech, setTech] = useState<Technician | null>(null);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [currPw, setCurrPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confPw, setConfPw] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await getTechnicianProfile();
      if (r.success && r.technician) { setTech(r.technician); setAvailable(r.technician.technician_status === 'Disponible'); }
      setLoading(false);
    })();
  }, []);

  const toggleAvail = async (v: boolean) => {
    setAvailable(v);
    if (!tech) return;
    const r = await toggleTechnicianAvailability(tech.technician_id, v);
    if (r.success) {
      setTech((p) => p ? { ...p, technician_status: v ? 'Disponible' : 'Ocupado' } : p);
      toast.showToast({ message: v ? 'Disponible para tickets' : 'No disponible', type: v ? 'success' : 'warning' });
    } else {
      setAvailable(!v);
      toast.showToast({ title: 'Error', message: r.message || '', type: 'error' });
    }
  };

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

      {/* Availability toggle */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.rowLabel}>Disponibilidad</Text>
            <Text style={styles.rowHint}>{available ? 'Puedes recibir nuevos tickets' : 'No recibirás nuevos tickets'}</Text>
          </View>
          <Switch value={available} onValueChange={toggleAvail} trackColor={{ false: Colors.border, true: Colors.statusResueltoBg }} thumbColor={available ? Colors.statusResuelto : Colors.textLight} />
        </View>
      </View>

      {/* Services + Schedule */}
      <View style={styles.card}>
        <Text style={styles.sLabel}>Servicios</Text>
        <View style={styles.tags}>{tech.services.map((s) => <View key={s} style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>)}</View>
        <View style={styles.divider} />
        <Text style={styles.sLabel}>Horario Semanal</Text>
        {tech.schedule.map((s, i) => (
          <View key={i} style={styles.schedRow}>
            <Text style={styles.schedDay}>{s.day_of_week}</Text>
            <View style={styles.schedBar}><View style={[styles.schedFill, { width: s.work_end_time.includes('15:00') ? '65%' : '80%' }]} /></View>
            <Text style={styles.schedTime}>{s.work_start_time} — {s.work_end_time}</Text>
          </View>
        ))}
        {tech.lunch_block ? <Text style={styles.lunch}>Almuerzo: {tech.lunch_block}</Text> : null}
      </View>

      {/* Metrics */}
      <View style={styles.card}>
        <Text style={styles.sLabel}>Rendimiento</Text>
        <View style={styles.metricsGrid}>
          <Metric v={tech.metrics.resolved_today} label="Hoy" />
          <Metric v={tech.metrics.resolved_week} label="Semana" />
          <Metric v={tech.metrics.resolved_month} label="Mes" />
        </View>
      </View>

      {/* Password */}
      {showPw ? (
        <View style={styles.card}>
          <Text style={styles.sLabel}>Cambiar Contraseña</Text>
          <TextInput style={styles.pwInput} placeholder="Contraseña actual" placeholderTextColor={Colors.textLight} secureTextEntry value={currPw} onChangeText={setCurrPw} />
          <TextInput style={styles.pwInput} placeholder="Nueva (mín. 6 caracteres)" placeholderTextColor={Colors.textLight} secureTextEntry value={newPw} onChangeText={setNewPw} />
          <TextInput style={styles.pwInput} placeholder="Confirmar nueva" placeholderTextColor={Colors.textLight} secureTextEntry value={confPw} onChangeText={setConfPw} />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
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

function Metric({ v, label }: { v: number; label: string }) {
  return (
    <View style={ms.card}>
      <Text style={ms.value}>{v}</Text>
      <Text style={ms.label}>{label}</Text>
    </View>
  );
}
const ms = StyleSheet.create({
  card: { flex: 1, backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: 16, alignItems: 'center' },
  value: { fontSize: 22, fontWeight: '700', color: Colors.text },
  label: { fontSize: 11, color: Colors.textSecondary, textTransform: 'uppercase', marginTop: 4 },
});

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 14 },
  ctr: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, gap: 12, padding: 24 },
  ctrText: { fontSize: 14, color: Colors.textSecondary },
  ctrTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  headCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: 24, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  avatar: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 24, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: Colors.text },
  role: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingHorizontal: 12, paddingVertical: 5, borderRadius: BorderRadius.full },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { fontSize: 12, fontWeight: '600' },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: 18, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
  rowHint: { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
  sLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: BorderRadius.sm, backgroundColor: Colors.navyPrimary + '08', borderWidth: 1, borderColor: Colors.navyPrimary + '15' },
  tagText: { fontSize: 12, fontWeight: '500', color: Colors.navyPrimary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 14 },
  schedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  schedDay: { fontSize: 12, color: Colors.text, width: 65 },
  schedBar: { flex: 1, height: 6, backgroundColor: Colors.background, borderRadius: 3, overflow: 'hidden' },
  schedFill: { height: '100%', backgroundColor: Colors.navyPrimary + '20', borderRadius: 3 },
  schedTime: { fontSize: 11, color: Colors.textSecondary, width: 100, textAlign: 'right' },
  lunch: { fontSize: 12, color: Colors.textSecondary, marginTop: 10 },
  metricsGrid: { flexDirection: 'row', gap: 10 },
  pwInput: { backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: 12, fontSize: 13, color: Colors.text, borderWidth: 1, borderColor: Colors.border, marginTop: 10 },
});
