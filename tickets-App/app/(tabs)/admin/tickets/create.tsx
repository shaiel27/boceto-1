import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { createTicket, getOffices, getServices, getProblems, getSystems } from '../../../src/services/adminService';

type Priority = 'Baja' | 'Media' | 'Alta' | 'Critica';

const PRIORITIES: { key: Priority; color: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'Baja', color: Colors.priorityBaja, icon: 'arrow-down' },
  { key: 'Media', color: Colors.priorityMedia, icon: 'remove' },
  { key: 'Alta', color: Colors.priorityAlta, icon: 'arrow-up' },
  { key: 'Critica', color: Colors.coral, icon: 'flame' },
];

const SERVICES_STATIC = [
  { id: 1, name: 'Redes' },
  { id: 2, name: 'Soporte' },
  { id: 3, name: 'Programación' },
];

export default function CreateTicketScreen() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [propertyNumber, setPropertyNumber] = useState('');
  const [officeId, setOfficeId] = useState<number | null>(null);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [problemId, setProblemId] = useState<number | null>(null);
  const [systemId, setSystemId] = useState<number | null>(null);
  const [priority, setPriority] = useState<Priority>('Media');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [offices, setOffices] = useState<{ id: number; name: string; type: string }[]>([]);
  const [services] = useState(SERVICES_STATIC);
  const [problems, setProblems] = useState<{ id: number; name: string; severity: string }[]>([]);
  const [systems, setSystems] = useState<{ id: number; name: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    getOffices().then((r) => {
      if (r.success && r.data) {
        setOffices(r.data.map((o) => ({ id: o.ID_Office, name: o.Name_Office, type: o.Office_Type })));
      }
    });
    getSystems().then((r) => {
      if (r.success && r.data) {
        setSystems(r.data.map((s) => ({ id: s.ID_System, name: s.System_Name })));
      }
    });
  }, []);

  useEffect(() => {
    if (!serviceId) { setProblems([]); setSystemId(null); return; }
    setLoadingOptions(true);
    getProblems(serviceId).then((r) => {
      if (r.success && r.data) {
        setProblems(r.data.map((p) => ({ id: p.ID_Problem_Catalog, name: p.Problem_Name, severity: p.Estimated_Severity })));
      }
      setLoadingOptions(false);
    });
    if (serviceId !== 3) setSystemId(null);
  }, [serviceId]);

  const isValid = subject.trim().length >= 3 && officeId !== null && serviceId !== null && description.trim().length >= 5;

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    const result = await createTicket({
      Fk_Office: officeId!,
      Fk_TI_Service: serviceId!,
      Fk_Problem_Catalog: problemId ?? undefined,
      Fk_Software_System: serviceId === 3 && systemId ? systemId : null,
      Subject: subject.trim(),
      Description: description.trim(),
      Property_Number: propertyNumber.trim() || undefined,
      System_Priority: priority,
    });
    setSubmitting(false);
    if (result.success) {
      setDone(true);
      setTimeout(() => router.back(), 1800);
    }
  };

  if (done) {
    return (
      <View style={styles.doneWrap}>
        <Ionicons name="checkmark-circle" size={64} color={Colors.statusResuelto} />
        <Text style={styles.doneTitle}>Ticket Creado</Text>
        <Text style={styles.doneSub}>
          {priority === 'Critica' ? 'Crítico' : priority} · {services.find((s) => s.id === serviceId)?.name}
        </Text>
        <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Priority selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Prioridad</Text>
          <View style={styles.prioRow}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p.key}
                style={[styles.prioChip, priority === p.key && { backgroundColor: p.color + '16', borderColor: p.color }]}
                onPress={() => setPriority(p.key)}
                activeOpacity={0.6}
              >
                <Ionicons name={p.icon} size={14} color={priority === p.key ? p.color : Colors.textLight} />
                <Text style={[styles.prioText, priority === p.key && { color: p.color, fontWeight: '700' }]}>{p.key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Subject */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Asunto *</Text>
          <TextInput
            style={styles.input}
            placeholder="Describe brevemente el problema"
            placeholderTextColor={Colors.textLight}
            value={subject}
            onChangeText={setSubject}
            maxLength={100}
          />
        </View>

        {/* Office + Service side by side */}
        <View style={styles.row}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.sectionLabel}>Oficina *</Text>
            <View style={styles.pickWrap}>
              {offices.length === 0 ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 12 }} />
              ) : (
                offices.map((o, i) => (
                  <TouchableOpacity
                    key={o.id ?? `office-${i}`}
                    style={[styles.pickChip, officeId === o.id && styles.pickChipActive]}
                    onPress={() => setOfficeId(o.id)}
                    activeOpacity={0.6}
                  >
                    <Text style={[styles.pickText, officeId === o.id && styles.pickTextActive]}>{o.name}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.sectionLabel}>Servicio *</Text>
            <View style={styles.pickWrap}>
              {services.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.pickChip, serviceId === s.id && styles.pickChipActive]}
                  onPress={() => setServiceId(s.id)}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.pickText, serviceId === s.id && styles.pickTextActive]}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Problem Catalog (only when service selected) */}
        {serviceId && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Problema específico</Text>
            {loadingOptions ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 8 }} />
            ) : problems.length > 0 ? (
              <View style={styles.pickWrap}>
                {problems.map((p, i) => (
                  <TouchableOpacity
                    key={p.id ?? `problem-${i}`}
                    style={[styles.pickChip, problemId === p.id && styles.pickChipActive]}
                    onPress={() => setProblemId(p.id)}
                    activeOpacity={0.6}
                  >
                    <Text style={[styles.pickText, problemId === p.id && styles.pickTextActive]}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.altText}>Sin problemas en el catálogo para este servicio</Text>
            )}
          </View>
        )}

        {/* Software System (only for Programación) */}
        {serviceId === 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Sistema afectado</Text>
            {systems.length > 0 ? (
              <View style={styles.pickWrap}>
                {systems.map((s, i) => (
                  <TouchableOpacity
                    key={s.id ?? `system-${i}`}
                    style={[styles.pickChip, systemId === s.id && styles.pickChipActive]}
                    onPress={() => setSystemId(s.id)}
                    activeOpacity={0.6}
                  >
                    <Text style={[styles.pickText, systemId === s.id && styles.pickTextActive]}>{s.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.altText}>Sin sistemas registrados</Text>
            )}
          </View>
        )}

        {/* Property Number */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Número de Bien (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="PC-001, EQ-002..."
            placeholderTextColor={Colors.textLight}
            value={propertyNumber}
            onChangeText={setPropertyNumber}
            maxLength={10}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Describe el problema, cuándo ocurrió, qué intentaste..."
            placeholderTextColor={Colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Submit button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, (!isValid || submitting) && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={Colors.gold} />
          ) : (
            <Ionicons name="send" size={18} color={Colors.gold} />
          )}
          <Text style={styles.submitText}>
            {submitting ? 'Creando...' : 'Enviar Ticket'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingTop: 8 },
  section: { marginBottom: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 12 },

  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
  },
  textarea: { minHeight: 100 },
  charCount: { fontSize: 10, color: Colors.textLight, marginTop: 4, textAlign: 'right' },

  prioRow: { flexDirection: 'row', gap: 8 },
  prioChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  prioText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },

  pickWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pickChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickChipActive: { backgroundColor: Colors.primary + '10', borderColor: Colors.primary },
  pickText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  pickTextActive: { color: Colors.primary, fontWeight: '700' },
  altText: { fontSize: 12, color: Colors.textLight, fontStyle: 'italic', marginTop: 4 },

  footer: {
    padding: 16,
    paddingBottom: 28,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitDisabled: { opacity: 0.4 },
  submitText: { fontSize: 15, fontWeight: '700', color: Colors.gold },

  doneWrap: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', padding: 32 },
  doneTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 16 },
  doneSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  doneBtn: { marginTop: 24, paddingHorizontal: 32, paddingVertical: 12, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary },
  doneBtnText: { fontSize: 14, fontWeight: '700', color: Colors.gold },
});
