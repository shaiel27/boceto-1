import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, LayoutAnimation, Platform, UIManager, Modal, ActivityIndicator, Linking, KeyboardAvoidingView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { API_BASE_URL } from '../../../src/constants/config';
import { Ticket } from '../../../src/types/ticket';
import { useTickets } from '../../../src/contexts/TicketContext';
import { getTicketDetail, requestAssistance } from '../../../src/services/ticketService';
import { useAuth } from '../../../src/hooks/useAuth';
import { CommentItem } from '../../../src/components/technician/CommentItem';
import { Button } from '../../../src/components/ui/Button';
import { useToast } from '../../../src/contexts/ToastContext';
import { findBienByCode } from '../../../src/services/bienesService';

try {
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
} catch {}

const PRIO_COL: Record<string, string> = { Alta: Colors.priorityAlta, Media: Colors.priorityMedia, Baja: Colors.textLight };
const QUICK = ['Problema resuelto.'];
const ASSIST_REASONS = ['Necesito ayuda con este ticket', 'Requiero autorización', 'Otro'];

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [showAssistance, setShowAssistance] = useState(false);
  const [assistReason, setAssistReason] = useState('');
  const [assistDetails, setAssistDetails] = useState('');
  const [assistSending, setAssistSending] = useState(false);
  const toast = useToast();
  const { user } = useAuth();
  const { tickets, takeTicket, resolveTicket, addComment } = useTickets();
  const tid = Number(id);
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);

  const load = async () => {
    setLoading(true);
    const cached = tickets.find((t) => t.id === tid) || null;
    const r = await getTicketDetail(tid, cached);
    if (r.success && r.ticket) { setTicket(r.ticket); navigation.setOptions({ title: r.ticket.ticket_code }); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [tid]);

  const [bienDesc, setBienDesc] = useState<string | null>(null);
  useEffect(() => {
    if (!ticket?.property_number) { setBienDesc(null); return; }
    setBienDesc(null);
    let cancelled = false;
    findBienByCode(ticket.property_number).then((b) => {
      if (!cancelled) setBienDesc(b ? String(b.denact || '') : null);
    });
    return () => { cancelled = true; };
  }, [ticket?.property_number]);

  const handleTake = async () => {
    if (!ticket) return;
    const r = await takeTicket(tid);
    if (r.success) { toast.showToast({ title: 'Ticket tomado', message: 'Comenzaste a trabajar en este ticket', type: 'info' }); setTicket((prev) => (prev ? { ...prev, status: 'En Proceso' as Ticket['status'] } : null)); }
    else toast.showToast({ title: 'Error', message: r.message || 'No se pudo tomar', type: 'error' });
  };

  const doResolve = async (note: string) => {
    setSending(true);
    const r = await resolveTicket(tid, note);
    setSending(false);
    if (r.success) {
      toast.showToast({ title: 'Enviado a verificación', message: 'El solicitante debe confirmar', type: 'success' });
      setTicket((prev) => (prev ? { ...prev, status: 'Pendiente de Verificación' as Ticket['status'] } : null));
    } else {
      toast.showToast({ title: 'Error', message: r.message || '', type: 'error' });
    }
  };

  const handleComment = async () => {
    if (!comment.trim() && !image) return;
    setSending(true);
    await addComment(tid, comment || 'Adjunto imagen.', image || undefined);
    setComment(''); setImage(null);
    setSending(false);
    const cached = tickets.find((t) => t.id === tid) || null;
    const r = await getTicketDetail(tid, cached);
    if (r.success && r.ticket) setTicket(r.ticket);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
  };

  const pickImage = async (fromCamera: boolean) => {
    const perm = fromCamera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') return;
    const result = fromCamera ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.7 });
    if (!result.canceled && result.assets[0]) setImage(result.assets[0].uri);
  };

  const handleAssistance = async () => {
    if (!assistReason) return;
    setAssistSending(true);
    const r = await requestAssistance(tid, assistReason, assistDetails);
    setAssistSending(false);
    if (r.success) { toast.showToast({ title: 'Asistencia solicitada', message: 'Admin notificado', type: 'warning' }); setShowAssistance(false); setAssistReason(''); setAssistDetails(''); }
    else toast.showToast({ title: 'Error', message: r.message || '', type: 'error' });
  };

  if (loading) return <View style={styles.ctr}><ActivityIndicator size="small" color={Colors.primary} /><Text style={styles.ctrText}>Cargando ticket...</Text></View>;
  if (!ticket) return <View style={styles.ctr}><Ionicons name="alert-circle" size={36} color={Colors.priorityAlta} /><Text style={styles.ctrTitle}>No encontrado</Text><Button title="Volver" onPress={() => router.back()} variant="outline" /></View>;

  const isResolved = ticket.status === 'Resuelto' || ticket.status === 'Pendiente de Verificación' || ticket.status === 'Cerrado';
  const prioColor = PRIO_COL[ticket.system_priority] || Colors.textLight;

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.scrollInner}>
        {/* === SIGNAL HEADER === */}
        <View style={styles.signalHeader}>
          <View style={styles.signalHeaderTop}>
            <View style={[styles.signalPrioDot, { backgroundColor: prioColor }]} />
            <Text style={styles.signalCode}>{ticket.ticket_code}</Text>
            <View style={{ flex: 1 }} />
            <View style={[styles.signalStatusBadge, { backgroundColor: statBg(ticket.status) }]}>
              <Text style={[styles.signalStatusText, { color: statFg(ticket.status) }]}>{ticket.status === 'En Proceso' ? 'En curso' : ticket.status}</Text>
            </View>
          </View>
          <Text style={styles.signalSubject}>{ticket.subject}</Text>
          <View style={styles.signalMetaRow}>
            <SignalMeta icon="business-outline" text={ticket.office_name} />
            <SignalMeta icon="construct-outline" text={ticket.service_name} />
            <SignalMeta icon="calendar-outline" text={fmt(ticket.created_at)} />
          </View>
          {ticket.property_number ? (
            <View style={styles.signalBienBlock}>
              <Ionicons name="hardware-chip-outline" size={11} color={Colors.navyPrimary} />
              <Text style={styles.signalBienText}>Bien N° {ticket.property_number}</Text>
              {bienDesc ? <Text style={styles.signalBienDesc}>{bienDesc}</Text> : null}
            </View>
          ) : null}
          {ticket.technician_names.length > 0 && (
            <View style={styles.signalTechRow}>
              <Ionicons name="people-outline" size={11} color={Colors.textLight} />
              <Text style={styles.signalTechText}>{ticket.technician_names.join(', ')}</Text>
            </View>
          )}
        </View>

        {/* === DESCRIPTION === */}
        <View style={styles.section}>
          <SectionHead icon="document-text-outline" label="Descripción" />
          <Text style={styles.descText}>{ticket.description || 'Sin descripción'}</Text>
        </View>

        {/* === ATTACHMENTS === */}
        {ticket.ticket_attachments.length > 0 && (
          <View style={styles.section}>
            <SectionHead icon="attach-outline" label={`Archivos (${ticket.ticket_attachments.length})`} />
            {ticket.ticket_attachments.map((att) => {
              const isImage = att.file_type?.startsWith('image/');
              const fileUrl = `${API_BASE_URL}/${att.file_path}`;
              return (
                <TouchableOpacity key={att.id} style={styles.attRow} onPress={() => Linking.openURL(fileUrl)} activeOpacity={0.7}>
                  {isImage ? (
                    <Image source={{ uri: fileUrl }} style={styles.attThumb} />
                  ) : (
                    <View style={styles.attIcon}><Ionicons name="document-outline" size={18} color={Colors.primary} /></View>
                  )}
                  <View style={styles.attInfo}>
                    <Text style={styles.attName} numberOfLines={1}>{att.file_name}</Text>
                    <Text style={styles.attMeta}>{formatBytes(att.file_size)}</Text>
                  </View>
                  <Ionicons name="open-outline" size={14} color={Colors.textLight} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* === TIMELINE === */}
        {ticket.timeline.length > 0 && (
          <View style={styles.section}>
            <SectionHead icon="time-outline" label="Línea de Tiempo" />
            {ticket.timeline.map((e, i) => (
              <View key={e.id} style={styles.tlRow}>
                <View style={styles.tlCol}>
                  <View style={[styles.tlDot, i === 0 && styles.tlDotFirst]} />
                  {i < ticket.timeline.length - 1 && <View style={styles.tlLine} />}
                </View>
                <View style={styles.tlBody}>
                  <Text style={styles.tlAct}>{e.action_description}</Text>
                  <Text style={styles.tlMeta}>{e.actor} · {fmtDT(e.event_date)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* === COMMENTS === */}
        <View style={styles.section}>
          <SectionHead icon="chatbubble-ellipses-outline" label={`Comentarios (${ticket.comments.length})`} />
          {ticket.comments.length === 0 ? (
            <Text style={styles.noData}>Sin comentarios aún</Text>
          ) : (
            ticket.comments.map((c) => <CommentItem key={c.id} comment={c} />)
          )}
        </View>

        {/* === COMMENT INPUT === */}
        {!isResolved && (
          <View style={styles.section}>
            <TextInput
              style={styles.commentInput}
              placeholder="Escribe un comentario..."
              placeholderTextColor={Colors.textLight}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            {image && (
              <View style={styles.imagePreview}>
                <Image source={{ uri: image }} style={styles.imagePreviewImg} />
                <TouchableOpacity style={styles.imageRemove} onPress={() => setImage(null)}>
                  <Ionicons name="close-circle" size={22} color={Colors.priorityAlta} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.commentFoot}>
              <View style={styles.commentAttach}>
                <TouchableOpacity style={styles.attachBtn} onPress={() => pickImage(true)}>
                  <Ionicons name="camera-outline" size={18} color={Colors.navyPrimary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachBtn} onPress={() => pickImage(false)}>
                  <Ionicons name="image-outline" size={18} color={Colors.navyPrimary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.sendBtn, (!comment.trim() && !image) && { opacity: 0.4 }]}
                onPress={handleComment}
                disabled={!comment.trim() && !image}
              >
                {sending ? <ActivityIndicator size="small" color={Colors.gold} /> : <Text style={styles.sendText}>Enviar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* === ACTIONS === */}
        {!isResolved && (
          <View style={styles.actionsRow}>
            {ticket.status === 'Pendiente' && (
              <TouchableOpacity style={[styles.actionBtn, styles.actionTake]} onPress={handleTake}>
                <Ionicons name="hand-left-outline" size={18} color={Colors.surface} />
                <Text style={styles.actionBtnText}>Tomar Ticket</Text>
              </TouchableOpacity>
            )}
            {ticket.status === 'En Proceso' && (
              <TouchableOpacity style={[styles.actionBtn, styles.actionResolve]} onPress={() => doResolve(QUICK[0])} disabled={sending}>
                {sending ? <ActivityIndicator size="small" color={Colors.surface} /> : <Ionicons name="checkmark-circle-outline" size={18} color={Colors.surface} />}
                <Text style={styles.actionBtnText}>{sending ? 'Enviando...' : 'Marcar Resuelto'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionBtn, styles.actionHelp]} onPress={() => setShowAssistance(true)}>
              <Ionicons name="hand-left-outline" size={18} color={Colors.surface} />
              <Text style={styles.actionBtnText}>Ayuda</Text>
            </TouchableOpacity>
          </View>
        )}

        {isResolved && (
          <View style={styles.resolvedBanner}>
            <Ionicons name="lock-closed" size={14} color={Colors.statusResuelto} />
            <Text style={styles.resolvedText}>Ticket cerrado. No se pueden agregar comentarios.</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* === ASSISTANCE MODAL === */}
      <Modal visible={showAssistance} animationType="slide" presentationStyle="pageSheet" transparent>
        <View style={modal.wrap}>
          <View style={modal.sheet}>
            <View style={modal.head}>
              <View style={modal.headIcon}>
                <Ionicons name="hand-left-outline" size={18} color={Colors.coral} />
              </View>
              <Text style={modal.title}>Solicitar Asistencia</Text>
              <TouchableOpacity onPress={() => { setShowAssistance(false); setAssistReason(''); setAssistDetails(''); }}>
                <Ionicons name="close" size={22} color={Colors.textLight} />
              </TouchableOpacity>
            </View>
            <Text style={modal.subtitle}>¿Qué necesitas?</Text>
            <View style={modal.reasonList}>
              {ASSIST_REASONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[modal.reasonBtn, assistReason === r && modal.reasonBtnActive]}
                  onPress={() => setAssistReason(r)}
                  activeOpacity={0.7}
                >
                  <View style={[modal.radio, assistReason === r && modal.radioActive]}>
                    {assistReason === r && <View style={modal.radioInner} />}
                  </View>
                  <Text style={[modal.reasonText, assistReason === r && modal.reasonTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button
              title="Enviar Solicitud"
              onPress={handleAssistance}
              loading={assistSending}
              disabled={!assistReason}
              style={modal.sendBtn}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function SectionHead({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; text?: string; label: string }) {
  return (
    <View style={sh.wrap}>
      <View style={sh.icon}><Ionicons name={icon} size={14} color={Colors.navyPrimary} /></View>
      <Text style={sh.label}>{label}</Text>
      <View style={sh.line} />
    </View>
  );
}
const sh = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  icon: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.navyPrimary + '0C', justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 12, fontWeight: '700', color: Colors.text, textTransform: 'uppercase', letterSpacing: 0.6 },
  line: { flex: 1, height: 1, backgroundColor: Colors.border },
});

function SignalMeta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={sm.row}>
      <Ionicons name={icon} size={10} color={Colors.textLight} />
      <Text style={sm.text}>{text}</Text>
    </View>
  );
}
const sm = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  text: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
});

function fmt(d: string) { return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }); }
function fmtDT(d: string) { return new Date(d).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
function statBg(s: string) { return s === 'Pendiente' ? Colors.statusPendienteBg : s === 'En Proceso' ? Colors.statusEnProcesoBg : Colors.statusResueltoBg; }
function statFg(s: string) { return s === 'Pendiente' ? Colors.badgeMedText : s === 'En Proceso' ? Colors.badgeBlueText : Colors.badgeLowText; }
function formatBytes(bytes: number) { if (!bytes) return ''; const k = bytes / 1024; if (k < 1024) return k.toFixed(1) + ' KB'; return (k / 1024).toFixed(1) + ' MB'; }

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollInner: { padding: 12 },
  ctr: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, gap: 10, padding: 24 },
  ctrText: { fontSize: 13, color: Colors.textSecondary },
  ctrTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },

  signalHeader: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  signalHeaderTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  signalPrioDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  signalCode: { fontSize: 13, fontWeight: '700', color: Colors.navyPrimary, fontFamily: 'monospace', letterSpacing: 0.3 },
  signalStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  signalStatusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  signalSubject: { fontSize: 18, fontWeight: '700', color: Colors.text, lineHeight: 24, marginBottom: 10 },
  signalMetaRow: { flexDirection: 'row', gap: 14, marginBottom: 8 },
  signalBienBlock: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginTop: 6, backgroundColor: Colors.navyPrimary + '08', borderRadius: BorderRadius.sm, padding: 8, borderWidth: 1, borderColor: Colors.navyPrimary + '15' },
  signalBienText: { fontSize: 11, fontWeight: '600', color: Colors.navyPrimary },
  signalBienDesc: { fontSize: 11, color: Colors.text, marginLeft: 17, flexBasis: '100%', marginTop: 2 },
  signalTechRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  signalTechText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },

  section: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  descText: { fontSize: 14, color: Colors.text, lineHeight: 22 },
  noData: { fontSize: 12, color: Colors.textLight, fontStyle: 'italic' },

  attRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.background, borderRadius: BorderRadius.md,
    padding: 10, marginBottom: 6, borderWidth: 1, borderColor: Colors.border,
  },
  attThumb: { width: 40, height: 40, borderRadius: 6 },
  attIcon: { width: 40, height: 40, borderRadius: 6, backgroundColor: Colors.primary + '0C', justifyContent: 'center', alignItems: 'center' },
  attInfo: { flex: 1 },
  attName: { fontSize: 12, fontWeight: '600', color: Colors.text },
  attMeta: { fontSize: 10, color: Colors.textLight, marginTop: 1 },

  tlRow: { flexDirection: 'row', marginBottom: 2 },
  tlCol: { alignItems: 'center', width: 18 },
  tlDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.textLight, borderWidth: 2, borderColor: Colors.border },
  tlDotFirst: { backgroundColor: Colors.navyPrimary, borderColor: Colors.navyPrimary },
  tlLine: { flex: 1, width: 2, backgroundColor: Colors.border, marginVertical: 2 },
  tlBody: { flex: 1, paddingLeft: 10, paddingBottom: 10 },
  tlAct: { fontSize: 12, fontWeight: '500', color: Colors.text },
  tlMeta: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },

  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 10 },
  quickChip: { backgroundColor: Colors.primary + '08', borderRadius: BorderRadius.sm, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: Colors.primary + '15' },
  quickChipText: { fontSize: 10, fontWeight: '500', color: Colors.primary },
  commentInput: { backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: 12, fontSize: 13, color: Colors.text, minHeight: 72, borderWidth: 1, borderColor: Colors.border },
  imagePreview: { position: 'relative', marginTop: 10, borderRadius: BorderRadius.md, overflow: 'hidden' },
  imagePreviewImg: { width: '100%', height: 130, borderRadius: BorderRadius.md },
  imageRemove: { position: 'absolute', top: 6, right: 6, backgroundColor: Colors.surface, borderRadius: 11 },
  commentFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  commentAttach: { flexDirection: 'row', gap: 8 },
  attachBtn: { width: 36, height: 36, borderRadius: BorderRadius.sm, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  sendBtn: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: BorderRadius.md, backgroundColor: Colors.primary },
  sendText: { fontSize: 13, fontWeight: '700', color: Colors.gold },

  actionsRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: BorderRadius.md },
  actionTake: { backgroundColor: Colors.statusEnProceso },
  actionResolve: { backgroundColor: Colors.statusResuelto },
  actionHelp: { backgroundColor: Colors.navyPrimary },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: Colors.surface },

  quickPanel: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: 18, marginTop: 10, borderWidth: 1, borderColor: Colors.border },
  quickPanelTitle: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  quickPanelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  quickPanelBtnText: { fontSize: 13, fontWeight: '500', color: Colors.text },
  quickPanelCancel: { alignItems: 'center', marginTop: 12 },
  quickPanelCancelText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },

  resolvedBanner: { backgroundColor: Colors.statusResueltoBg, borderRadius: BorderRadius.md, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  resolvedText: { flex: 1, fontSize: 12, color: Colors.statusResuelto, fontWeight: '500' },
});

const modal = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  headIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.coralLight, justifyContent: 'center', alignItems: 'center' },
  title: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 12 },
  reasonList: { gap: 8, marginBottom: 18 },
  reasonBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  reasonBtnActive: { borderColor: Colors.coral + '50', backgroundColor: Colors.coralLight },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: Colors.coral },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.coral },
  reasonText: { fontSize: 14, fontWeight: '500', color: Colors.text },
  reasonTextActive: { color: Colors.coral, fontWeight: '600' },
  sendBtn: { marginTop: 4 },
});
