import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, Modal, SafeAreaView, KeyboardAvoidingView, Platform, FlatList, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { createTicket, getProblems, getSystems, getUserSystems, uploadTicketFiles } from '../../../src/services/adminService';
import { searchBienes, Bien, normalizePropertyCode as normalizeCode } from '../../../src/services/bienesService';
import { useAuth } from '../../../src/hooks/useAuth';
import { useToast } from '../../../src/contexts/ToastContext';

const PRIO_COLORS: Record<string, string> = {
  Baja: Colors.priorityBaja, Media: Colors.priorityMedia, Alta: Colors.priorityAlta, Critica: Colors.coral,
};

const SERVICES_STATIC = [
  { id: 1, name: 'Redes', icon: 'wifi' as const },
  { id: 2, name: 'Soporte', icon: 'hardware-chip' as const },
  { id: 3, name: 'Programación', icon: 'code-slash' as const },
];

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export default function RequesterCreateTicket() {
  const { user } = useAuth();
  const officeId = user?.office_id ?? null;
  const officeName = user?.office_name || 'Sin oficina';

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [propertyNumber, setPropertyNumber] = useState('');
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [problemId, setProblemId] = useState<number | null>(null);
  const [systemId, setSystemId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<DocumentPicker.DocumentPickerResult['assets']>([]);
  const toast = useToast();

  const [systemModal, setSystemModal] = useState(false);
  const [systemSearch, setSystemSearch] = useState('');

  const [problems, setProblems] = useState<{ id: number; name: string; severity: string }[]>([]);
  const [systems, setSystems] = useState<{ id: number; name: string }[]>([]);

  const filteredSystems = useMemo(() => {
    if (!systemSearch.trim()) return systems;
    const q = systemSearch.toLowerCase();
    return systems.filter((s) => s.name.toLowerCase().includes(q));
  }, [systems, systemSearch]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Bienes search with anti-flicker: keep previous results visible during debounce
  const [bienSearchResults, setBienSearchResults] = useState<Bien[]>([]);
  const [bienSearchState, setBienSearchState] = useState<'idle' | 'loading' | 'results' | 'selected' | 'nomatch'>('idle');
  const [selectedBien, setSelectedBien] = useState<Bien | null>(null);
  const bienDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestQueryRef = useRef('');

  useEffect(() => {
    getUserSystems().then((r) => {
      if (r.success && r.data && r.data.length > 0) {
        setSystems(r.data.map((s: any) => ({ id: s.id, name: s.name })));
      } else {
        getSystems().then((res) => { if (res.success && res.data) setSystems(res.data.map((s) => ({ id: s.ID_System, name: s.System_Name }))); });
      }
    });
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

  useEffect(() => {
    if (bienDebounceRef.current) clearTimeout(bienDebounceRef.current);
    const trimmed = propertyNumber.trim();
    latestQueryRef.current = trimmed;

    if (!trimmed) {
      setBienSearchResults([]);
      setBienSearchState('idle');
      setSelectedBien(null);
      return;
    }

    if (bienSearchResults.length === 0) {
      setBienSearchState('loading');
    }

    bienDebounceRef.current = setTimeout(async () => {
      const results = await searchBienes(trimmed, 8);
      if (trimmed !== latestQueryRef.current) return;

      setBienSearchResults(results);

      if (results.length === 0) {
        setSelectedBien(null);
        setBienSearchState('nomatch');
        return;
      }

      const norm = normalizeCode(trimmed);
      const exact = results.find(
        (b) => normalizeCode(String(b.codact || '')) === norm,
      );
      const first = results[0];

      if (exact || (results.length === 1 && normalizeCode(String(first.codact || '')) === norm)) {
        setSelectedBien(exact || first);
        setBienSearchState('selected');
      } else {
        setSelectedBien(null);
        setBienSearchState('results');
      }
    }, 450);

    return () => {
      if (bienDebounceRef.current) clearTimeout(bienDebounceRef.current);
    };
  }, [propertyNumber]);

  const handleSelectBien = (bien: Bien) => {
    const code = String(bien.codact || '').replace(/^-+$/, '');
    setPropertyNumber(code);
    setSelectedBien(bien);
    setBienSearchState('selected');
    setBienSearchResults([]);
  };

  const bienOfficeMatch = selectedBien
    ? normalize(String(selectedBien.denuniadm || '')) === normalize(officeName)
    : false;

  const selectedProblem = problems.find((p) => p.id === problemId);
  const derivedPriority = selectedProblem?.severity ?? 'Media';
  const priorityColor = PRIO_COLORS[derivedPriority] || Colors.priorityMedia;

  const isValid = subject.trim().length >= 3 && serviceId !== null && description.trim().length >= 5;

  const pickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: ['image/*', 'application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain', 'text/csv'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const MAX_SIZE = 10 * 1024 * 1024;
        const valid = result.assets.filter((f) => (f.size || 0) <= MAX_SIZE);
        if (valid.length < result.assets.length) {
          toast.showToast({ title: 'Archivo grande', message: 'Algunos archivos exceden 10MB', type: 'error' });
        }
        setSelectedFiles((prev) => {
          const combined = [...(prev || []), ...valid];
          return combined.slice(0, 5);
        });
      }
    } catch {}
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => (prev || []).filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!isValid || submitting || !officeId) return;
    setSubmitting(true);
    try {
      const result = await createTicket({
        Fk_Office: officeId,
        Fk_TI_Service: serviceId!,
        Fk_Problem_Catalog: problemId ?? undefined,
        Fk_Software_System: serviceId === 3 && systemId ? systemId : null,
        Subject: subject.trim(), Description: description.trim(),
        Property_Number: propertyNumber.trim() || undefined,
        System_Priority: derivedPriority,
      });
      if (result.success) {
        const ticketId = result.ticket_id;
        if (ticketId && selectedFiles && selectedFiles.length > 0) {
          const fileData = selectedFiles.map((f) => ({
            uri: f.uri,
            name: f.name,
            type: f.mimeType || 'application/octet-stream',
          }));
          const uploadRes = await uploadTicketFiles(ticketId, fileData);
          if (uploadRes.success) {
            toast.showToast({ title: 'Archivos subidos', message: `${fileData.length} archivo(s) adjuntado(s)`, type: 'info' });
          } else {
            toast.showToast({ title: 'Error al subir archivos', message: uploadRes.message || 'Intente subirlos después', type: 'error' });
          }
        }
        setDone(true);
        setTimeout(() => {
          router.replace(`/(tabs)/requester/${ticketId}`);
        }, 1500);
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
      <View style={styles.doneWrap}>
        <View style={styles.doneBadge}><Ionicons name="checkmark" size={44} color={Colors.surface} /></View>
        <Text style={styles.doneTitle}>Ticket Creado</Text>
        <View style={[styles.donePrio, { backgroundColor: priorityColor + '16', borderColor: priorityColor + '30' }]}>
          <Text style={[styles.donePrioText, { color: priorityColor }]}>{derivedPriority}</Text>
        </View>
        <Text style={styles.doneSub}>{officeName}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <Field label="Oficina" icon="business-outline" locked>
          <View style={styles.officeBox}>
            <Ionicons name="lock-closed" size={14} color={Colors.textLight} />
            <Text style={styles.officeText}>{officeName}</Text>
          </View>
        </Field>

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

        {serviceId === 3 && systems.length > 0 && (
          <Field label="Sistema" icon="laptop-outline">
            <TouchableOpacity
              style={[styles.picker, systemId !== null && styles.pickerFilled]}
              onPress={() => setSystemModal(true)}
              activeOpacity={0.6}
            >
              {systemId !== null ? (
                <>
                  <Text style={styles.pickerValue} numberOfLines={1}>{systems.find(s => s.id === systemId)?.name || 'Seleccionar sistema...'}</Text>
                  <TouchableOpacity onPress={() => setSystemId(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={20} color={Colors.textLight} />
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.pickerPlaceholder}>Seleccionar sistema...</Text>
              )}
            </TouchableOpacity>
          </Field>
        )}

        <Field label="N\u00b0 de Bien" icon="hardware-chip-outline" optional>
          <TextInput
            style={styles.input}
            placeholder="PC-001, EQ-002..."
            placeholderTextColor={Colors.textLight}
            value={propertyNumber}
            onChangeText={setPropertyNumber}
            maxLength={20}
            returnKeyType="next"
          />
          {bienSearchState === 'loading' && (
            <View style={styles.bienRow}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.bienText}>Buscando bien...</Text>
            </View>
          )}
          {bienSearchState === 'selected' && selectedBien && (
            <View style={[styles.bienRow, bienOfficeMatch ? styles.bienRowOk : styles.bienRowWarn]}>
              <Ionicons
                name={bienOfficeMatch ? 'checkmark-circle' : 'warning-outline'}
                size={bienOfficeMatch ? 16 : 13}
                color={bienOfficeMatch ? Colors.statusResuelto : Colors.priorityAlta}
              />
              <View style={styles.bienInfoCol}>
                {!bienOfficeMatch && (
                  <Text style={styles.bienTextWarnTitle}>Este bien no pertenece a tu oficina.</Text>
                )}
                <Text style={bienOfficeMatch ? styles.bienTextOk : styles.bienTextWarnInfo} numberOfLines={2}>
                  {selectedBien.denact}
                </Text>
                {selectedBien.denuniadm ? (
                  <Text style={styles.bienSub}>
                    {selectedBien.codact.replace(/^-+$/, '')} {'\u2014'} {selectedBien.denuniadm}
                  </Text>
                ) : null}
              </View>
            </View>
          )}
          {bienSearchState === 'nomatch' && (
            <View style={styles.bienRow}>
              <Ionicons name="help-circle-outline" size={16} color={Colors.textLight} />
              <Text style={styles.bienTextDim}>Sin coincidencias en el inventario.</Text>
            </View>
          )}
          {bienSearchState === 'results' && bienSearchResults.length > 0 && (
            <View style={styles.bienDropdown}>
              {bienSearchResults.map((bien, idx) => {
                const code = String(bien.codact || '').replace(/^-+$/, '');
                const office = String(bien.denuniadm || '').trim();
                const isMatch = office && normalize(office) === normalize(officeName);
                return (
                  <TouchableOpacity
                    key={code || `bien-${idx}`}
                    style={styles.bienDropdownItem}
                    onPress={() => handleSelectBien(bien)}
                    activeOpacity={0.6}
                  >
                    <View style={styles.bienDropdownLeft}>
                      <Text style={styles.bienDropdownCode} numberOfLines={1}>{code || '-'}</Text>
                      <Text style={styles.bienDropdownDesc} numberOfLines={2}>{bien.denact}</Text>
                      {office ? (
                        <View style={styles.bienDropdownOfficeRow}>
                          <Ionicons
                            name={isMatch ? 'checkmark-circle' : 'business-outline'}
                            size={11}
                            color={isMatch ? Colors.statusResuelto : Colors.textLight}
                          />
                          <Text style={[styles.bienDropdownOffice, isMatch && { color: Colors.statusResuelto }]}>
                            {office}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={Colors.textLight} />
                  </TouchableOpacity>
                );
              })}
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

        <Field label="Archivos adjuntos" icon="attach-outline" optional>
          <TouchableOpacity style={styles.filePicker} onPress={pickFiles} activeOpacity={0.6}>
            <Ionicons name="cloud-upload-outline" size={20} color={Colors.primary} />
            <Text style={styles.filePickerText}>Seleccionar archivos (PDF, imágenes...)</Text>
          </TouchableOpacity>
          {selectedFiles && selectedFiles.length > 0 && (
            <View style={styles.fileList}>
              {selectedFiles.map((file, i) => {
                const isImage = file.mimeType?.startsWith('image/');
                return (
                  <View key={i} style={styles.fileItem}>
                    <View style={styles.fileItemLeft}>
                      {isImage ? (
                        <Image source={{ uri: file.uri }} style={styles.fileThumb} />
                      ) : (
                        <Ionicons name="document-outline" size={20} color={Colors.primary} />
                      )}
                      <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeFile(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close-circle" size={20} color={Colors.coral} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
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
      <Modal visible={systemModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalRoot}>
          <View style={styles.modalHead}>
            <Text style={styles.modalTitle}>Sistema de Software</Text>
            <TouchableOpacity onPress={() => { setSystemModal(false); setSystemSearch(''); }}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalSearch}>
            <Ionicons name="search" size={16} color={Colors.textLight} />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Buscar sistema..."
              placeholderTextColor={Colors.textLight}
              value={systemSearch}
              onChangeText={setSystemSearch}
              autoFocus
            />
            {systemSearch.length > 0 && (
              <TouchableOpacity onPress={() => setSystemSearch('')}>
                <Ionicons name="close-circle" size={16} color={Colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={filteredSystems}
            keyExtractor={(item, index) => String(item.id ?? index)}
            contentContainerStyle={styles.modalList}
            renderItem={({ item }) => {
              const active = systemId === item.id;
              return (
                <TouchableOpacity
                  style={[styles.modalItem, active && styles.modalItemActive]}
                  onPress={() => { setSystemId(item.id); setSystemModal(false); setSystemSearch(''); }}
                  activeOpacity={0.6}
                >
                  <View style={[styles.modalItemIcon, active && styles.modalItemIconActive]}>
                    <Ionicons name="laptop" size={18} color={active ? Colors.surface : Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemName}>{item.name}</Text>
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

function Field({ label, icon, children, required, optional, dim, locked }: any) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHead}>
        <View style={[styles.fieldIcon, dim && { opacity: 0.5 }]}>
          <Ionicons name={icon} size={16} color={dim ? Colors.textLight : Colors.primary} />
        </View>
        <Text style={styles.fieldLabel}>{label}</Text>
        {required && <Text style={styles.reqBadge}>REQ</Text>}
        {optional && <Text style={styles.optBadge}>OPC</Text>}
        {locked && <Ionicons name="lock-closed" size={12} color={Colors.textLight} />}
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

  officeBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: 16, borderWidth: 1, borderColor: Colors.border },
  officeText: { fontSize: 15, fontWeight: '500', color: Colors.text },

  input: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: Colors.text, borderWidth: 1, borderColor: Colors.border,
  },
  textarea: { minHeight: 120, paddingTop: 14 },
  hint: { fontSize: 11, color: Colors.textLight, marginTop: 4 },

  bienRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, paddingHorizontal: 4 },
  bienRowOk: { backgroundColor: Colors.statusResueltoBg, paddingVertical: 8, paddingHorizontal: 12, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.statusResuelto + '40' },
  bienRowWarn: { backgroundColor: Colors.priorityAltaBg, paddingVertical: 8, paddingHorizontal: 12, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.priorityAlta + '40' },
  bienInfoCol: { flex: 1 },
  bienSub: { fontSize: 10, color: Colors.textLight, marginTop: 3 },
  bienText: { fontSize: 12, color: Colors.textSecondary },
  bienTextOk: { fontSize: 12, color: Colors.text, fontWeight: '500', flex: 1 },
  bienTextWarnTitle: { fontSize: 12, color: Colors.priorityAlta, fontWeight: '600' },
  bienTextWarnInfo: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  bienTextWarn: { fontSize: 12, color: Colors.priorityAlta, fontWeight: '500', flex: 1 },
  bienTextDim: { fontSize: 11, color: Colors.textLight, fontStyle: 'italic' },
  bienDropdown: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
    maxHeight: 280,
    overflow: 'hidden',
  },
  bienDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '80',
  },
  bienDropdownLeft: { flex: 1, marginRight: 8 },
  bienDropdownCode: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  bienDropdownDesc: { fontSize: 11, color: Colors.text, marginTop: 2 },
  bienDropdownOfficeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  bienDropdownOffice: { fontSize: 10, color: Colors.textLight },
  altText: { fontSize: 13, color: Colors.textLight, fontStyle: 'italic', paddingVertical: 8 },

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

  filePicker: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed',
  },
  filePickerText: { fontSize: 14, color: Colors.primary, fontWeight: '500' },
  fileList: { marginTop: 8, gap: 6 },
  fileItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.primary + '08', borderRadius: BorderRadius.md,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.primary + '18',
  },
  fileItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  fileThumb: { width: 32, height: 32, borderRadius: 6 },
  fileName: { fontSize: 12, color: Colors.text, flex: 1 },

  doneWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: Colors.background },
  doneBadge: { width: 84, height: 84, borderRadius: 42, backgroundColor: Colors.statusResuelto, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 4, shadowColor: Colors.statusResuelto, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  doneTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  donePrio: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.sm, borderWidth: 1, marginTop: 10 },
  donePrioText: { fontSize: 12, fontWeight: '700' },
  doneSub: { fontSize: 14, color: Colors.textSecondary, marginTop: 8, fontWeight: '500' },

  picker: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: 16,
    borderWidth: 1, borderColor: Colors.border, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  pickerFilled: { borderColor: Colors.primary + '30', backgroundColor: Colors.primary + '04' },
  pickerValue: { fontSize: 15, fontWeight: '500', color: Colors.text, flex: 1, marginRight: 8 },
  pickerPlaceholder: { fontSize: 15, color: Colors.textLight },

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
});
