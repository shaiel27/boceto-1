import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { createTicket, getProblems, getSystems } from '../../../src/services/adminService';
import { useAuth } from '../../../src/hooks/useAuth';
import { useToast } from '../../../src/contexts/ToastContext';

const PRIO_COLORS: Record<string, string> = {
  Baja: Colors.priorityBaja, Media: Colors.priorityMedia, Alta: Colors.priorityAlta, Critica: Colors.coral,
};
const PRIO_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Baja: 'arrow-down', Media: 'remove-outline', Alta: 'arrow-up', Critica: 'flame-outline',
};

const SERVICES_STATIC = [
  { id: 1, name: 'Redes', icon: 'wifi' as const },
  { id: 2, name: 'Soporte', icon: 'hardware-chip' as const },
  { id: 3, name: 'Programación', icon: 'code-slash' as const },
];

export default function RequesterCreateTicket() {
  const { user } = useAuth();
  const officeId = user?.office_id ?? null;
  const officeName = user?.office_name || 'Sin oficina';

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [propertyNumber, setPropertyNumber] = useState('');
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [problemId, setProblemId] = useState<number | null>(null);
  const [otherProblemName, setOtherProblemName] = useState('');
  const OTHER_FLAG = -1;
  const [systemId, setSystemId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const toast = useToast();

  const [problems, setProblems] = useState<{ id: number; name: string; severity: string }[]>([]);
  const [systems, setSystems] = useState<{ id: number; name: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    getSystems().then((r) => { if (r.success && r.data) setSystems(r.data.map((s) => ({ id: s.ID_System, name: s.System_Name }))); });
  }, []);

  useEffect(() => {
    if (!serviceId) { setProblems([]); setSystemId(null); setProblemId(null); return; }
    setLoadingOptions(true);
    getProblems(serviceId).then((r) => {
      if (r.success && r.data) setProblems(r.data.map((p) => ({ id: p.ID_Problem_Catalog, name: p.Problem_Name, severity: p.Estimated_Severity })));
      setLoadingOptions(false);
    });
    if (serviceId !== 3) setSystemId(null);
  }, [serviceId]);

  const selectedProblem = problems.find((p) => p.id === problemId);
  const derivedPriority = selectedProblem?.severity ?? 'Media';
  const priorityColor = PRIO_COLORS[derivedPriority] || Colors.priorityMedia;
  const priorityIcon = PRIO_ICONS[derivedPriority] || 'remove-outline';

  const otherProblemValid = problemId !== OTHER_FLAG || otherProblemName.trim().length >= 3;
  const isValid = subject.trim().length >= 3 && serviceId !== null && description.trim().length >= 5 && otherProblemValid;

  const handleSubmit = async () => {
    if (!isValid || submitting || !officeId) return;
    if (problemId === OTHER_FLAG && !otherProblemName.trim()) return;
    setSubmitting(true);
    try {
      const isOther = problemId === OTHER_FLAG;
      const result = await createTicket({
        Fk_Office: officeId,
        Fk_TI_Service: serviceId!,
        ...(isOther ? { New_Problem_Name: otherProblemName.trim() } : { Fk_Problem_Catalog: problemId ?? undefined }),
        Fk_Software_System: serviceId === 3 && systemId ? systemId : null,
        Subject: subject.trim(), Description: description.trim(),
        Property_Number: propertyNumber.trim() || undefined,
        System_Priority: derivedPriority,
      });
      if (result.success) {
        setDone(true);
        setTimeout(() => router.back(), 2000);
      } else {
        toast.showToast({ title: 'Error', message: result.message || 'No se pudo crear el ticket', type: 'error' });
      }
    } catch {
      toast.showToast({ title: 'Error', message: 'Error de conexión con el servidor', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <View style={[styles.page, styles.doneWrap]}>
        <View style={styles.doneBadge}><Ionicons name="checkmark" size={40} color={Colors.surface} /></View>
        <Text style={styles.doneTitle}>Ticket Creado</Text>
        <View style={styles.doneMeta}>
          <View style={[styles.donePrio, { backgroundColor: priorityColor + '16', borderColor: priorityColor + '30' }]}>
            <Ionicons name={priorityIcon} size={12} color={priorityColor} />
            <Text style={[styles.donePrioText, { color: priorityColor }]}>{derivedPriority}</Text>
          </View>
          <Text style={styles.doneSub}>{officeName}</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Office info (locked) */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.cardIcon}><Ionicons name="business-outline" size={16} color={Colors.primary} /></View>
            <Text style={styles.cardTitle}>Oficina</Text>
            <View style={styles.lockedBadge}><Ionicons name="lock-closed" size={10} color={Colors.textLight} /><Text style={styles.lockedText}>Automático</Text></View>
          </View>
          <View style={styles.officeDisplay}>
            <Ionicons name="business" size={18} color={Colors.primary} />
            <Text style={styles.officeName}>{officeName}</Text>
          </View>
        </View>

        {/* Subject */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.cardIcon}><Ionicons name="create-outline" size={16} color={Colors.primary} /></View>
            <Text style={styles.cardTitle}>Asunto</Text>
          </View>
          <TextInput style={styles.textInput} placeholder="Describe brevemente el problema..." placeholderTextColor={Colors.textLight} value={subject} onChangeText={setSubject} maxLength={100} />
        </View>

        {/* Service */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.cardIcon}><Ionicons name="construct-outline" size={16} color={Colors.primary} /></View>
            <Text style={styles.cardTitle}>Servicio</Text>
          </View>
          <View style={styles.chipsRow}>
            {SERVICES_STATIC.map((s) => {
              const active = serviceId === s.id;
              return (
                <TouchableOpacity key={s.id} style={[styles.chip, active && styles.chipActive]} onPress={() => setServiceId(s.id)} activeOpacity={0.6}>
                  <Ionicons name={s.icon} size={16} color={active ? Colors.primary : Colors.textLight} />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{s.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Priority (read-only) */}
        <View style={[styles.card, styles.cardDim]}>
          <View style={styles.cardHead}>
            <View style={[styles.cardIcon, { backgroundColor: priorityColor + '14' }]}>
              <Ionicons name="flag-outline" size={16} color={priorityColor} />
            </View>
            <Text style={styles.cardTitle}>Prioridad</Text>
          </View>
          <View style={styles.prioRow}>
            <View style={[styles.prioBadge, { backgroundColor: priorityColor + '12', borderColor: priorityColor + '25' }]}>
              <Ionicons name={priorityIcon} size={14} color={priorityColor} />
              <Text style={[styles.prioBadgeText, { color: priorityColor }]}>{derivedPriority}</Text>
            </View>
            <Text style={styles.prioDerived}>{selectedProblem ? `Según "${selectedProblem.name}"` : 'Por defecto'}</Text>
          </View>
        </View>

        {/* Problems */}
        {serviceId && (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.cardIcon}><Ionicons name="alert-circle-outline" size={16} color={Colors.primary} /></View>
              <Text style={styles.cardTitle}>Problema específico</Text>
            </View>
            {loadingOptions ? <ActivityIndicator size="small" color={Colors.primary} style={{ paddingVertical: 16 }} /> : (
              <View style={styles.chipsWrap}>
                {problems.map((p, i) => {
                  const active = problemId === p.id;
                  return (
                    <TouchableOpacity key={p.id ?? `p-${i}`} style={[styles.problemChip, active && styles.problemChipActive]} onPress={() => { setProblemId(p.id); setOtherProblemName(''); }} activeOpacity={0.6}>
                      <View style={[styles.problemDot, { backgroundColor: PRIO_COLORS[p.severity] || Colors.textLight }]} />
                      <Text style={[styles.problemName, active && styles.problemNameActive]} numberOfLines={1}>{p.name}</Text>
                      {active && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />}
                    </TouchableOpacity>
                  );
                })}
                {/* Otro */}
                <TouchableOpacity
                  style={[styles.problemChip, styles.problemOtherChip, problemId === OTHER_FLAG && styles.problemChipActive]}
                  onPress={() => setProblemId(OTHER_FLAG)}
                  activeOpacity={0.6}
                >
                  <View style={[styles.problemDot, { backgroundColor: Colors.textLight }]} />
                  <Text style={[styles.problemName, problemId === OTHER_FLAG && styles.problemNameActive]} numberOfLines={1}>Otro</Text>
                  {problemId === OTHER_FLAG && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />}
                </TouchableOpacity>
                {problemId === OTHER_FLAG && (
                  <TextInput
                    style={[styles.textInput, { marginTop: 4 }]}
                    placeholder="Describe el problema..."
                    placeholderTextColor={Colors.textLight}
                    value={otherProblemName}
                    onChangeText={setOtherProblemName}
                    maxLength={200}
                    autoFocus
                  />
                )}
              </View>
            )}
          </View>
        )}

        {/* System (only Programación) */}
        {serviceId === 3 && (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.cardIcon}><Ionicons name="laptop-outline" size={16} color={Colors.primary} /></View>
              <Text style={styles.cardTitle}>Sistema afectado</Text>
            </View>
            {systems.length > 0 ? (
              <View style={styles.chipsWrap}>
                {systems.map((s, i) => {
                  const active = systemId === s.id;
                  return (
                    <TouchableOpacity key={s.id ?? `sys-${i}`} style={[styles.problemChip, active && styles.problemChipActive]} onPress={() => setSystemId(s.id)} activeOpacity={0.6}>
                      <Text style={[styles.problemName, active && styles.problemNameActive, { flex: 1 }]} numberOfLines={1}>{s.name}</Text>
                      {active && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : <Text style={styles.altText}>Sin sistemas registrados</Text>}
          </View>
        )}

        {/* Property */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.cardIcon}><Ionicons name="hardware-chip-outline" size={16} color={Colors.primary} /></View>
            <Text style={styles.cardTitle}>Número de Bien</Text>
            <Text style={styles.optBadge}>Opcional</Text>
          </View>
          <TextInput style={styles.textInput} placeholder="PC-001, EQ-002..." placeholderTextColor={Colors.textLight} value={propertyNumber} onChangeText={setPropertyNumber} maxLength={10} />
        </View>

        {/* Description */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.cardIcon}><Ionicons name="document-text-outline" size={16} color={Colors.primary} /></View>
            <Text style={styles.cardTitle}>Descripción</Text>
          </View>
          <TextInput style={[styles.textInput, styles.textarea]} placeholder="Describe el problema detalladamente..." placeholderTextColor={Colors.textLight} value={description} onChangeText={setDescription} multiline textAlignVertical="top" maxLength={500} />
          <Text style={styles.charHint}>{description.length}/500</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.submitBtn, (!isValid || submitting) && styles.submitDisabled]} onPress={handleSubmit} disabled={!isValid || submitting} activeOpacity={0.85}>
          {submitting ? <ActivityIndicator size="small" color={Colors.gold} /> : <><Ionicons name="send" size={18} color={Colors.gold} /><Text style={styles.submitText}>Enviar Ticket</Text></>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingTop: 12 },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  cardDim: { opacity: 0.85 },
  cardHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.primary + '0E', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, flex: 1 },
  lockedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.sm, backgroundColor: Colors.border },
  lockedText: { fontSize: 10, fontWeight: '600', color: Colors.textLight, textTransform: 'uppercase' },
  optBadge: { fontSize: 10, fontWeight: '600', color: Colors.textLight, backgroundColor: Colors.border, paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.sm, textTransform: 'uppercase' },
  officeDisplay: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: 14, borderWidth: 1, borderColor: Colors.border },
  officeName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  textInput: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.text },
  textarea: { minHeight: 120 },
  charHint: { fontSize: 10, color: Colors.textLight, textAlign: 'right', marginTop: 4 },
  chipsRow: { flexDirection: 'row', gap: 8 },
  chipsWrap: { gap: 6 },
  chip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: BorderRadius.md, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary + '0E', borderColor: Colors.primary + '30' },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary },
  problemChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 11, borderRadius: BorderRadius.md, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, marginBottom: 6 },
  problemChipActive: { backgroundColor: Colors.primary + '0A', borderColor: Colors.primary + '35' },
  problemDot: { width: 8, height: 8, borderRadius: 4 },
  problemName: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary, flex: 1 },
  problemNameActive: { color: Colors.text, fontWeight: '600' },
  altText: { fontSize: 13, color: Colors.textLight, fontStyle: 'italic', paddingVertical: 8 },
  problemOtherChip: { borderStyle: 'dashed', opacity: 0.8 },
  prioRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  prioBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.sm, borderWidth: 1 },
  prioBadgeText: { fontSize: 13, fontWeight: '700' },
  prioDerived: { fontSize: 11, color: Colors.textSecondary, flex: 1 },
  footer: { padding: 16, paddingBottom: 28, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 2, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6 },
  submitDisabled: { opacity: 0.45, elevation: 0, shadowOpacity: 0 },
  submitText: { fontSize: 16, fontWeight: '700', color: Colors.gold, letterSpacing: 0.3 },
  doneWrap: { justifyContent: 'center', alignItems: 'center', padding: 32 },
  doneBadge: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.statusResuelto, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 4, shadowColor: Colors.statusResuelto, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  doneTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  doneMeta: { alignItems: 'center', gap: 8 },
  donePrio: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.sm, borderWidth: 1 },
  donePrioText: { fontSize: 12, fontWeight: '700' },
  doneSub: { fontSize: 15, color: Colors.textSecondary, fontWeight: '500' },
});
