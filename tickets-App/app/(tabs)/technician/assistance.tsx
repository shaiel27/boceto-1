import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { requestAssistance } from '../../../src/services/ticketService';
import { useToast } from '../../../src/contexts/ToastContext';

const REASONS = [
  'Necesito ayuda con este ticket',
  'Requiero autorización',
  'Otro',
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
      toast.showToast({ title: 'Asistencia solicitada', message: reason, type: 'warning' });
      router.back();
    } else {
      toast.showToast({ title: 'Error', message: result.message || 'No se pudo enviar', type: 'error' });
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.head}>
        <View style={styles.headIcon}>
          <Ionicons name="hand-left-outline" size={20} color={Colors.coral} />
        </View>
        <Text style={styles.headTitle}>Solicitar Asistencia</Text>
      </View>

      {REASONS.map((r) => (
        <TouchableOpacity
          key={r}
          style={styles.btn}
          onPress={() => handleSend(r)}
          disabled={sending}
          activeOpacity={0.6}
        >
          <Ionicons name="send-outline" size={18} color={Colors.textLight} />
          <Text style={styles.btnText}>{r}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.cancel} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, marginTop: 8 },
  headIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.coralLight, justifyContent: 'center', alignItems: 'center' },
  headTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
    borderRadius: BorderRadius.md, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 8,
  },
  btnText: { fontSize: 14, fontWeight: '500', color: Colors.text },
  cancel: { marginTop: 12, padding: 16, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
});
