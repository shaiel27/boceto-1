import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, BorderRadius } from '../../../../src/constants/colors';
import { createTicket, getOffices, getProblems, getSystems } from '../../../../src/services/adminService';
import { findBienByCode, Bien } from '../../../../src/services/bienesService';
import { useToast } from '../../../../src/contexts/ToastContext';

const PRIO_COLORS: Record<string, string> = {
  Baja: Colors.priorityBaja, Media: Colors.priorityMedia, Alta: Colors.priorityAlta, Critica: Colors.coral,
};

const SERVICES_STATIC = [
  { id: 1, name: 'Redes', icon: 'wifi' as const },
  { id: 2, name: 'Soporte', icon: 'hardware-chip' as const },
  { id: 3, name: 'Programación', icon: 'code-slash' as const },
];

export default function CreateTicketScreen() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [propertyNumber, setPropertyNumber] = useState('');
  const [officeId, setOfficeId] = useState<number | null>(null);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [problemId, setProblemId] = useState<number | null>(null);
  const [systemId, setSystemId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [officeModal, setOfficeModal] = useState(false);
  const [officeSearch, setOfficeSearch] = useState('');
  const toast = useToast();

  const [offices, setOffices] = useState<{ id: number; name: string; type: string }[]>([]);
  const [problems, setProblems] = useState<{ id: number; name: string; severity: string }[]>([]);
  const [systems, setSystems] = useState<{ id: number; name: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [matchedBien, setMatchedBien] = useState<Bien | null>(null);
  const [bienLookupState, setBienLookupState] = useState<'idle' | 'loading' | 'match' | 'nomatch' | 'otheroffice'>('idle');
  const bienDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getOffices().then((r) => { if (r.success && r.data) setOffices(r.data.map((o) => ({ id: o.ID_Office, name: o.Name_Office, type: (o as any).Office_Type || '' }))); });
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
  const selectedOffice = offices.find((o) => o.id === officeId);

  useEffect(() => {
    if (bienDebounceRef.current) clearTimeout(bienDebounceRef.current);
    const trimmed = propertyNumber.trim();
    if (!trimmed) { setMatchedBien(null); setBienLookupState('idle'); return; }
    setBienLookupState('loading');
    bienDebounceRef.current = setTimeout(async () => {
      const bien = await findBienByCode(trimmed);
      if (!bien) { setMatchedBien(null); setBienLookupState('nomatch'); return; }
      const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
      const bienOffice = String(bien.denuniadm || '').trim();
      const matchedOffice = offices.find((o) => normalize(o.name) === normalize(bienOffice));
      if (!selectedOffice && matchedOffice) {
        setOfficeId(matchedOffice.id);
      }
      if (selectedOffice && bienOffice && normalize(bienOffice) === normalize(selectedOffice.name)) {
        setMatchedBien(bien);
        setBienLookupState('match');
      } else if (selectedOffice) {
        setMatchedBien(null);
        setBienLookupState('otheroffice');
      }
    }, 450);
    return () => { if (bienDebounceRef.current) clearTimeout(bienDebounceRef.current); };
  }, [propertyNumber, selectedOffice, offices]);

  const filteredOffices = useMemo(() => {
    if (!officeSearch.trim()) return offices;
    const q = officeSearch.toLowerCase();
    return offices.filter((o) => o.name.toLowerCase().includes(q) || (o.type || '').toLowerCase().includes(q));
  }, [offices, officeSearch]);

  const isValid = subject.trim().length >= 3 && officeId !== null && serviceId !== null && description.trim().length >= 5;

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      const result = await createTicket({
        Fk_Office: officeId!,
        Fk_TI_Service: serviceId!,
        Fk_Problem_Catalog: problemId ?? undefined,
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
      toast.showToast({ title: 'Error', message: 'Error de conexión', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <SafeAreaView style={styles.doneRoot}>
        <View style={styles.doneWrap}>
          <View style={styles.doneBadge}><Ionicons name="checkmark" size={44} color={Colors.surface} /></View>
          <Text style={styles.doneTitle}>Ticket Creado</Text>
          <View style={[styles.donePrio, { backgroundColor: priorityColor + '16', borderColor: priorityColor + '30' }]}>
            <Text style={[styles.donePrioText, { color: priorityColor }]}>{derivedPriority}</Text>
          </View>
          <Text style={styles.doneSub}>{selectedOffice?.name || ''}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <Field label="Asunto" icon="create-outline" required>
          <TextInput
            style={styles.input}
            placeholder="Describe el problema..."
            placeholderTextColor={Colors.textLight}
            value={subject}
            onChangeText={setSubject}
            maxLength={100}
            returnKeyType="next"
          />
        </Field>

        <Field label="Oficina" icon="business-outline" required>
          <TouchableOpacity
            style={[styles.picker, selectedOffice && styles.pickerFilled]}
            onPress={() => setOfficeModal(true)}
            activeOpacity={0.6}
          >
            {selectedOffice ? (
              <>
                <Text style={styles.pickerValue}>{selectedOffice.name}</Text>
                <TouchableOpacity onPress={() => setOfficeId(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={20} color={Colors.textLight} />
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.pickerPlaceholder}>Seleccionar oficina...</Text>
            )}
          </TouchableOpacity>
        </Field>

        <Field label="Servicio" icon="construct-outline" required>
          <View style={styles.chipRow}>
            {SERVICES_STATIC.map((s) => {
              const active = serviceId === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setServiceId(s.id)}
                  activeOpacity={0.6}
                >
                  <Ionicons name={s.icon} size={15} color={active ? Colors.primary : Colors.textLight} />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{s.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Field>

        <Field label="Prioridad" icon="flag-outline" dim>
          <View style={[styles.prioBadge, { backgroundColor: priorityColor + '10', borderColor: priorityColor + '25' }]}>
            <View style={[styles.prioDot, { backgroundColor: priorityColor }]} />
            <Text style={[styles.prioBadgeText, { color: priorityColor }]}>{derivedPriority}</Text>
          </View>
          <Text style={styles.hint}>
            {selectedProblem ? `Según: ${selectedProblem.name}` : 'Selecciona un problema para derivarla'}
          </Text>
        </Field>

        {serviceId && (
          <Field label="Problema" icon="alert-circle-outline">
            {loadingOptions ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ paddingVertical: 12 }} />
            ) : problems.length > 0 ? (
              problems.map((p, i) => {
                const active = problemId === p.id;
                const sev = PRIO_COLORS[p.severity] || Colors.textLight;
                return (
                  <TouchableOpacity
                    key={p.id ?? `p-${i}`}
                    style={[styles.optChip, active && styles.optChipActive]}
                    onPress={() => setProblemId(p.id)}
                    activeOpacity={0.6}
                  >
                    <View style={[styles.optDot, { backgroundColor: sev }]} />
                    <Text style={[styles.optText, active && styles.optTextActive]} numberOfLines={1}>{p.name}</Text>
                    {active && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />}
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.altText}>Sin problemas en el catálogo</Text>
            )}
          </Field>
        )}

        {serviceId === 3 && (
          <Field label="Sistema" icon="laptop-outline">
            {systems.length > 0 ? systems.map((s, i) => {
              const active = systemId === s.id;
              return (
                <TouchableOpacity
                  key={s.id ?? `sys-${i}`}
                  style={[styles.optChip, active && styles.optChipActive]}
                  onPress={() => setSystemId(s.id)}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.optText, active && styles.optTextActive]} numberOfLines={1}>{s.name}</Text>
                  {active && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              );
            }) : <Text style={styles.altText}>Sin sistemas registrados</Text>}
          </Field>
        )}

        <Field label="N° de Bien" icon="hardware-chip-outline" optional>
          <TextInput
            style={styles.input}
            placeholder="PC-001, EQ-002..."
            placeholderTextColor={Colors.textLight}
            value={propertyNumber}
            onChangeText={setPropertyNumber}
            maxLength={10}
            returnKeyType="next"
          />
          {bienLookupState === 'loading' && propertyNumber.trim() && (
            <View style={styles.bienRow}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.bienText}>Buscando bien...</Text>
            </View>
          )}
          {bienLookupState === 'match' && matchedBien && (
            <View style={[styles.bienRow, styles.bienRowOk]}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.statusResuelto} />
              <Text style={styles.bienTextOk} numberOfLines={3}>
                {matchedBien.denact}
              </Text>
            </View>
          )}
          {bienLookupState === 'otheroffice' && matchedBien && (
            <View style={styles.bienRowWarn}>
              <Ionicons name="warning-outline" size={13} color={Colors.priorityAlta} />
              <Text style={styles.bienTextWarn}>Este bien no pertenece a la oficina seleccionada.</Text>
            </View>
          )}
          {bienLookupState === 'nomatch' && (
            <View style={styles.bienRow}>
              <Ionicons name="help-circle-outline" size={16} color={Colors.textLight} />
              <Text style={styles.bienTextDim}>Sin coincidencias en el inventario.</Text>
            </View>
          )}
        </Field>

        <Field label="Descripción" icon="document-text-outline" required>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Describe el problema, cuándo ocurrió, qué intentaste..."
            placeholderTextColor={Colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.hint}>{description.length}/500</Text>
        </Field>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submit, (!isValid || submitting) && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={Colors.gold} />
          ) : (
            <Ionicons name="send" size={18} color={Colors.gold} />
          )}
          <Text style={styles.submitText}>Enviar Ticket</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={officeModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalRoot}>
          <View style={styles.modalHead}>
            <Text style={styles.modalTitle}>Oficina</Text>
            <TouchableOpacity onPress={() => { setOfficeModal(false); setOfficeSearch(''); }}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalSearch}>
            <Ionicons name="search" size={16} color={Colors.textLight} />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Buscar..."
              placeholderTextColor={Colors.textLight}
              value={officeSearch}
              onChangeText={setOfficeSearch}
              autoFocus
            />
            {officeSearch.length > 0 && (
              <TouchableOpacity onPress={() => setOfficeSearch('')}>
                <Ionicons name="close-circle" size={16} color={Colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={filteredOffices}
            keyExtractor={(item, index) => String(item.id ?? index)}
            contentContainerStyle={styles.modalList}
            renderItem={({ item }) => {
              const active = officeId === item.id;
              return (
                <TouchableOpacity
                  style={[styles.modalItem, active && styles.modalItemActive]}
                  onPress={() => { setOfficeId(item.id); setOfficeModal(false); setOfficeSearch(''); }}
                  activeOpacity={0.6}
                >
                  <View style={[styles.modalItemIcon, active && styles.modalItemIconActive]}>
                    <Ionicons name="business" size={18} color={active ? Colors.surface : Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemName}>{item.name}</Text>
                    <Text style={styles.modalItemType}>{item.type}</Text>
                  </View>
                  {active && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function Field({ label, icon, children, required, optional, dim }: any) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHead}>
        <View style={[styles.fieldIcon, dim && { opacity: 0.5 }]}>
          <Ionicons name={icon} size={16} color={dim ? Colors.textLight : Colors.primary} />
        </View>
        <Text style={styles.fieldLabel}>{label}</Text>
        {required && <Text style={styles.reqBadge}>REQ</Text>}
        {optional && <Text style={styles.optBadge}>OPC</Text>}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, paddingTop: 12 },

  field: { marginBottom: 8 },
  fieldHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingLeft: 2 },
  fieldIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.primary + '0A', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: Colors.text, flex: 1 },
  reqBadge: { fontSize: 9, fontWeight: '700', color: Colors.coral, backgroundColor: Colors.coralLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, letterSpacing: 0.3, overflow: 'hidden' },
  optBadge: { fontSize: 9, fontWeight: '600', color: Colors.textLight, backgroundColor: Colors.border, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, letterSpacing: 0.3, overflow: 'hidden' },

  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textarea: { minHeight: 120, paddingTop: 14 },
  hint: { fontSize: 11, color: Colors.textLight, marginTop: 4 },
  altText: { fontSize: 13, color: Colors.textLight, fontStyle: 'italic', paddingVertical: 8 },

  picker: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: 16,
    borderWidth: 1, borderColor: Colors.border, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  pickerFilled: { borderColor: Colors.primary + '30', backgroundColor: Colors.primary + '04' },
  pickerValue: { fontSize: 15, fontWeight: '500', color: Colors.text },
  pickerPlaceholder: { fontSize: 15, color: Colors.textLight },

  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: BorderRadius.md, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary + '0A', borderColor: Colors.primary + '30' },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary },

  prioBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.md, borderWidth: 1, alignSelf: 'flex-start' },
  prioDot: { width: 8, height: 8, borderRadius: 4 },
  prioBadgeText: { fontSize: 13, fontWeight: '700' },

  optChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: BorderRadius.md, backgroundColor: Colors.surface, borderWidth: 1,
    borderColor: Colors.border, marginBottom: 6,
  },
  optChipActive: { backgroundColor: Colors.primary + '06', borderColor: Colors.primary + '30' },
  optDot: { width: 8, height: 8, borderRadius: 4 },
  optText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary, flex: 1 },
  optTextActive: { color: Colors.text, fontWeight: '600' },

  bienRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, paddingHorizontal: 4 },
  bienRowOk: { backgroundColor: Colors.statusResueltoBg, paddingVertical: 8, paddingHorizontal: 12, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.statusResuelto + '40' },
  bienRowWarn: { backgroundColor: Colors.priorityAltaBg, paddingVertical: 8, paddingHorizontal: 12, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.priorityAlta + '40' },
  bienText: { fontSize: 12, color: Colors.textSecondary },
  bienTextOk: { fontSize: 12, color: Colors.text, fontWeight: '500', flex: 1 },
  bienTextWarn: { fontSize: 12, color: Colors.priorityAlta, fontWeight: '500', flex: 1 },
  bienTextDim: { fontSize: 11, color: Colors.textLight, fontStyle: 'italic' },

  footer: {
    padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  submit: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingVertical: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    elevation: 2, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 6,
  },
  submitDisabled: { opacity: 0.45, elevation: 0, shadowOpacity: 0 },
  submitText: { fontSize: 16, fontWeight: '700', color: Colors.gold, letterSpacing: 0.3 },

  doneRoot: { flex: 1, backgroundColor: Colors.background },
  doneWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  doneBadge: { width: 84, height: 84, borderRadius: 42, backgroundColor: Colors.statusResuelto, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 4, shadowColor: Colors.statusResuelto, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  doneTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  donePrio: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.sm, borderWidth: 1, marginTop: 10 },
  donePrioText: { fontSize: 12, fontWeight: '700' },
  doneSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 8, fontWeight: '500' },

  modalRoot: { flex: 1, backgroundColor: Colors.background },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  modalSearch: { flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, paddingHorizontal: 14, height: 46, borderWidth: 1, borderColor: Colors.border, gap: 8 },
  modalSearchInput: { flex: 1, fontSize: 15, color: Colors.text },
  modalList: { paddingHorizontal: 16, paddingBottom: 32 },
  modalItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalItemActive: { backgroundColor: Colors.primary + '08', borderRadius: BorderRadius.md, paddingHorizontal: 10 },
  modalItemIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.primary + '0C', justifyContent: 'center', alignItems: 'center' },
  modalItemIconActive: { backgroundColor: Colors.primary },
  modalItemName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  modalItemType: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
});
