import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { requestAssistance } from '../../../src/services/ticketService';
import { useToast } from '../../../src/contexts/ToastContext';

const REASONS = [
  { key: 'help', label: 'Necesito ayuda con este ticket', icon: 'construct-outline' as const },
  { key: 'auth', label: 'Requiero autorización', icon: 'shield-checkmark-outline' as const },
  { key: 'other', label: 'Otro', icon: 'ellipsis-horizontal-outline' as const },
];

export default function AssistanceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const toast = useToast();
  const [sending, setSending] = useState(false);

  const handleSend = async (reason: string) => {
    setSending(true);
    const result = await requestAssistance(Number(id), reason, '');
    setSending(false);
    if (result.success) {
      toast.showToast({ title: 'Asistencia solicitada', message: 'Administrador notificado', type: 'success' });
      router.back();
    } else {
      toast.showToast({ title: 'Error', message: result.message || 'No se pudo enviar', type: 'error' });
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.sheet}>
        <View style={styles.head}>
          <View style={styles.headIcon}>
            <Ionicons name="hand-left-outline" size={20} color={Colors.coral} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headTitle}>Solicitar Asistencia</Text>
            <Text style={styles.headSub}>Un administrador recibirá tu solicitud</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={22} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.reasonList}>
          {REASONS.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={styles.btn}
              onPress={() => handleSend(r.label)}
              disabled={sending}
              activeOpacity={0.65}
            >
              <View style={styles.btnIcon}>
                <Ionicons name={r.icon} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.btnText}>{r.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {sending && (
          <View style={styles.sendingRow}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.sendingText}>Enviando...</Text>
          </View>
        )}

        <TouchableOpacity style={styles.cancel} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background, padding: 16, justifyContent: 'center' },
  sheet: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 22 },
  headIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.coralLight, justifyContent: 'center', alignItems: 'center' },
  headTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  headSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  reasonList: { gap: 8 },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.border,
  },
  btnIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primary + '0C', justifyContent: 'center', alignItems: 'center' },
  btnText: { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.text },
  sendingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  sendingText: { fontSize: 13, color: Colors.textSecondary },
  cancel: { marginTop: 16, padding: 12, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
});
