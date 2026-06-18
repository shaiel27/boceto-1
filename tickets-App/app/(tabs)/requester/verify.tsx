import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { useTickets } from '../../../src/contexts/TicketContext';
import { useToast } from '../../../src/contexts/ToastContext';
import { Ticket } from '../../../src/types/ticket';

type Step = 'list' | 'inconforme';

export default function VerifyScreen() {
  const { tickets, verifyTicket, refreshTickets } = useTickets();
  const toast = useToast();

  const [verificationTickets, setVerificationTickets] = useState<Ticket[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState<Step>('list');
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const pending = tickets.filter((t) => t.status === 'Pendiente de Verificación');
    setVerificationTickets(pending);
    setCurrentIndex((prev) => Math.min(prev, Math.max(0, pending.length - 1)));
    setLoading(false);

    if (mounted && pending.length === 0) {
      router.replace('/(tabs)/requester');
    }
  }, [tickets, mounted]);

  const current = verificationTickets[currentIndex];
  const total = verificationTickets.length;
  const remaining = total - currentIndex;

  const handleConforme = async () => {
    if (!current || sending) return;
    setSending(true);
    try {
      const r = await verifyTicket(current.id, 'conforme');
      if (r.success) {
        toast.showToast({ title: 'Verificado', message: 'Ticket cerrado exitosamente', type: 'success' });
        const next = currentIndex + 1;
        if (next < total) {
          setCurrentIndex(next);
          setStep('list');
          setComment('');
        } else {
          await refreshTickets();
          router.replace('/(tabs)/requester');
        }
      } else {
        toast.showToast({ title: 'Error', message: r.message || 'No se pudo verificar', type: 'error' });
      }
    } catch {
      toast.showToast({ title: 'Error', message: 'Error de conexión', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleInconforme = async () => {
    if (!current || sending || !comment.trim()) return;
    setSending(true);
    try {
      const r = await verifyTicket(current.id, 'inconforme', comment.trim());
      if (r.success) {
        toast.showToast({
          title: 'Inconformidad enviada',
          message: r.message || 'Ticket reasignado',
          type: 'warning',
        });
        const next = currentIndex + 1;
        if (next < total) {
          setCurrentIndex(next);
          setStep('list');
          setComment('');
        } else {
          await refreshTickets();
          router.replace('/(tabs)/requester');
        }
      } else {
        toast.showToast({ title: 'Error', message: r.message || 'No se pudo procesar', type: 'error' });
      }
    } catch {
      toast.showToast({ title: 'Error', message: 'Error de conexión', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!current) {
    return (
      <View style={styles.center}>
        <Ionicons name="checkmark-circle" size={48} color={Colors.statusResuelto} />
        <Text style={styles.doneText}>Sin tickets pendientes de verificación</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace('/(tabs)/requester')}
        >
          <Text style={styles.backBtnText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="shield-checkmark" size={28} color="#fff" />
        </View>
        <Text style={styles.title}>Verificación de Ticket</Text>
        <Text style={styles.subtitle}>
          {remaining} {remaining === 1 ? 'ticket pendiente' : 'tickets pendientes'} de verificación
        </Text>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>{currentIndex + 1} / {total}</Text>
        </View>
      </View>

      <View style={styles.ticketCard}>
        <Text style={styles.ticketCode}>{current.ticket_code}</Text>
        <Text style={styles.ticketSubject}>{current.subject}</Text>
        <View style={styles.ticketMeta}>
          {current.technician_names ? (
            <View style={styles.metaRow}>
              <Ionicons name="person" size={12} color={Colors.textLight} />
              <Text style={styles.metaText}>Resuelto por: {current.technician_names}</Text>
            </View>
          ) : null}
          {current.resolved_at ? (
            <View style={styles.metaRow}>
              <Ionicons name="calendar" size={12} color={Colors.textLight} />
              <Text style={styles.metaText}>{current.resolved_at}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {step === 'list' ? (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnConforme]}
            onPress={handleConforme}
            disabled={sending}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.actionBtnText}>Sí, está resuelto</Text>
            {sending && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnInconforme]}
            onPress={() => setStep('inconforme')}
            disabled={sending}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={22} color={Colors.coral} />
            <Text style={[styles.actionBtnText, { color: Colors.coral }]}>No, sigue el problema</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inconformeSection}>
          <Text style={styles.inconformeLabel}>Explica qué sucedió para que el ticket sea reasignado:</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Describe el problema que persiste..."
            placeholderTextColor={Colors.textLight}
            value={comment}
            onChangeText={setComment}
            maxLength={500}
            multiline
            textAlignVertical="top"
            autoFocus
          />
          <View style={styles.inconformeActions}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => { setStep('list'); setComment(''); }}
              disabled={sending}
            >
              <Text style={styles.backBtnText}>Volver</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendBtn, (!comment.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleInconforme}
              disabled={!comment.trim() || sending}
              activeOpacity={0.7}
            >
              <Ionicons name="send" size={16} color="#fff" />
              <Text style={styles.sendBtnText}>Enviar y reasignar</Text>
              {sending && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingTop: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: Colors.background, gap: 16 },

  header: { alignItems: 'center', marginBottom: 24 },
  headerIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.priorityAlta,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  counterBadge: {
    marginTop: 10, paddingHorizontal: 12, paddingVertical: 4,
    backgroundColor: Colors.priorityAltaBg, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.priorityAlta + '30',
  },
  counterText: { fontSize: 12, fontWeight: '600', color: Colors.priorityAlta },

  ticketCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: 16, borderWidth: 1, borderColor: Colors.border,
    marginBottom: 20,
  },
  ticketCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13, fontWeight: '700', color: Colors.primary, marginBottom: 6,
  },
  ticketSubject: { fontSize: 16, fontWeight: '600', color: Colors.text, lineHeight: 22, marginBottom: 10 },
  ticketMeta: { gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 11, color: Colors.textLight },

  actions: { gap: 10 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: BorderRadius.lg,
  },
  actionBtnConforme: { backgroundColor: Colors.statusResuelto },
  actionBtnInconforme: {
    backgroundColor: Colors.surface,
    borderWidth: 2, borderColor: Colors.coral + '40',
  },
  actionBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  inconformeSection: { gap: 12 },
  inconformeLabel: { fontSize: 14, fontWeight: '600', color: Colors.text },
  textarea: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: Colors.text,
    minHeight: 100,
  },
  inconformeActions: { flexDirection: 'row', gap: 10 },
  backBtn: {
    paddingHorizontal: 20, paddingVertical: 14,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.border,
    alignItems: 'center',
  },
  backBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  sendBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.coral,
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  doneText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
});
