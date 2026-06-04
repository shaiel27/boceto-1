import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, BorderRadius } from '../../../../src/constants/colors';
import { Ticket } from '../../../../src/types/ticket';
import { updateTicketStatus } from '../../../../src/services/ticketService';
import { addComment as addCommentApi } from '../../../../src/services/ticketService';
import { getAdminTicketDetail, assignTechniciansToTicket, getAvailableTechnicians, changeTicketPriority } from '../../../../src/services/adminService';
import { useToast } from '../../../../src/contexts/ToastContext';
import { useAuth } from '../../../../src/hooks/useAuth';
import { StatusBadge } from '../../../../src/components/technician/StatusBadge';
import { CommentItem } from '../../../../src/components/technician/CommentItem';
import { Button } from '../../../../src/components/ui/Button';
import { findBienByCode } from '../../../../src/services/bienesService';

const PRIORITIES = ['Alta', 'Media', 'Baja'];
const PC: Record<string, string> = { Alta: Colors.priorityAlta, Media: Colors.priorityMedia, Baja: Colors.priorityBaja };

export default function AdminTicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  const [techs, setTechs] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [assignSearch, setAssignSearch] = useState('');
  const toast = useToast();
  const tid = Number(id);

  const load = async () => { setLoading(true); const r = await getAdminTicketDetail(tid); if (r.success && r.ticket) setTicket(r.ticket); setLoading(false); };
  useEffect(() => { load(); }, [tid]);

  const [bienDesc, setBienDesc] = useState<string | null>(null);
  useEffect(() => {
    if (!ticket?.property_number) { setBienDesc(null); return; }
    let cancelled = false;
    findBienByCode(ticket.property_number).then((b) => {
      if (!cancelled) setBienDesc(b ? String(b.denact || '') : null);
    });
    return () => { cancelled = true; };
  }, [ticket?.property_number]);

  const openAssign = async () => {
    if (!ticket?.fk_ti_service) {
      toast.showToast({ title: 'Sin servicio', message: 'El ticket no tiene un tipo de servicio asignado', type: 'error' });
      return;
    }
    const r = await getAvailableTechnicians(ticket.fk_ti_service);
    if (r.success && r.data) {
      setTechs(r.data);
    } else {
      setTechs([]);
    }
    setSelected([]);
    setAssignSearch('');
    setShowAssign(true);
  };

  const doAssign = async () => {
    if (!selected.length) return;
    setSaving(true);
    const r = await assignTechniciansToTicket(tid, selected);
    setSaving(false);
    toast.showToast({
      title: r.success ? 'Técnicos asignados' : 'Error',
      message: r.message || '',
      type: r.success ? 'success' : 'error',
    });
    if (r.success) { setShowAssign(false); load(); }
  };

  const toggle = (id: number) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const doPriority = async (p: string) => { const r = await changeTicketPriority(tid, p); toast.showToast({ title: r.success ? 'Actualizado' : 'Error', message: r.message || '', type: r.success ? 'success' : 'error' }); if (r.success) { setShowPriority(false); load(); } };
  const doClose = () => Alert.alert('Cerrar Ticket', '¿Marcar como resuelto?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Cerrar', style: 'destructive', onPress: async () => { const r = await updateTicketStatus(tid, 'Cerrado', 'Cerrado por administrador'); toast.showToast({ title: r.success ? 'Cerrado' : 'Error', message: r.message || '', type: r.success ? 'success' : 'error' }); if (r.success) load(); } }]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSendingComment(true);
    const r = await addCommentApi(tid, commentText.trim());
    setSendingComment(false);
    if (r.success) { toast.showToast({ title: 'Comentario agregado', message: 'Registrado exitosamente', type: 'success' }); setCommentText(''); load(); }
    else toast.showToast({ title: 'Error', message: r.message || 'No se pudo agregar', type: 'error' });
  };

  const filteredTechs = useMemo(() => {
    if (!assignSearch.trim()) return techs;
    const q = assignSearch.toLowerCase();
    return techs.filter((t: any) => {
      const name = `${t.First_Name || ''} ${t.Last_Name || ''}`.toLowerCase();
      return name.includes(q) || (t.Email || '').toLowerCase().includes(q);
    });
  }, [techs, assignSearch]);

  const isResolved = ticket?.status === 'Resuelto';

  if (loading) return <View style={styles.ctr}><Text style={styles.ctrText}>Cargando ticket...</Text></View>;
  if (!ticket) return <View style={styles.ctr}><Ionicons name="alert-circle" size={40} color={Colors.priorityAlta} /><Text style={styles.ctrTitle}>No encontrado</Text><Button title="Volver" onPress={() => router.back()} variant="outline" /></View>;

  return (
    <View style={styles.page}>
      <ScrollView style={styles.sv} contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.codeRow}>
            <View style={[styles.codeDot, { backgroundColor: isResolved ? Colors.statusResuelto : Colors.navyPrimary }]} />
            <Text style={styles.code}>{ticket.ticket_code}</Text>
            <View style={{ flex: 1 }} /><StatusBadge status={ticket.status} />
          </View>
          <Text style={styles.subject}>{ticket.subject}</Text>
          {ticket.property_number ? (
            <View style={styles.bienBlock}>
              <View style={styles.bienRow}>
                <Ionicons name="hardware-chip-outline" size={12} color={Colors.navyPrimary} />
                <Text style={styles.prop}>N° de Bien: {ticket.property_number}</Text>
              </View>
              {bienDesc ? (
                <Text style={styles.bienDesc}>{bienDesc}</Text>
              ) : null}
            </View>
          ) : null}
          <View style={styles.div} />
          <View style={styles.grid}>
            <Meta icon="business-outline" label="Oficina" value={ticket.office_name} />
            <Meta icon="person-outline" label="Solicitante" value={ticket.citizen_name} />
            {ticket.citizen_email ? (
              <Meta icon="mail-outline" label="Email" value={ticket.citizen_email} />
            ) : null}
            <Meta icon="construct-outline" label="Servicio" value={ticket.service_name} />
            <Meta icon="flag-outline" label="Prioridad" value={ticket.system_priority} color={PC[ticket.system_priority]} />
            <Meta icon="calendar-outline" label="Creado" value={fmt(ticket.created_at)} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sTitle}>Descripción</Text>
          <Text style={styles.desc}>{ticket.description || 'Sin descripción'}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sHead}>
            <Text style={styles.sTitle}>Técnicos Asignados</Text>
            {!isResolved && <TouchableOpacity onPress={openAssign}><Text style={styles.link}>+ Asignar</Text></TouchableOpacity>}
          </View>
          {ticket.technician_names.length === 0
            ? <Text style={styles.noData}>Sin técnicos asignados</Text>
            : ticket.technician_names.map((n, i) => (
                <View key={i} style={styles.tRow}><View style={styles.tDot} /><Text style={styles.tName}>{n}</Text></View>
              ))}
        </View>

        {showPriority && (
          <View style={styles.card}>
            <Text style={styles.sTitle}>Cambiar Prioridad</Text>
            <View style={styles.pRow}>{PRIORITIES.map((p) => (
              <TouchableOpacity key={p} style={[styles.pBtn, { borderColor: PC[p] }, ticket.system_priority === p && { backgroundColor: PC[p] + '12' }]} onPress={() => doPriority(p)} activeOpacity={0.7}>
                <Text style={[styles.pText, { color: PC[p] }]}>{p}</Text>
              </TouchableOpacity>
            ))}</View>
            <TouchableOpacity onPress={() => setShowPriority(false)} style={{ alignSelf: 'center', marginTop: 14 }}>
              <Text style={styles.cancelLink}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}

        {ticket.timeline.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sTitle}>Línea de Tiempo</Text>
            {ticket.timeline.map((e, i) => (
              <View key={e.id} style={styles.tlItem}>
                <View style={styles.tlCol}><View style={[styles.tlDot, i === 0 && styles.tlDotFirst]} />{i < ticket.timeline.length - 1 && <View style={styles.tlLine} />}</View>
                <View style={styles.tlBody}><Text style={styles.tlAct}>{e.action_description}</Text><Text style={styles.tlMeta}>{e.actor} · {fmtDT(e.event_date)}</Text></View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sTitle}>Comentarios ({ticket.comments.length})</Text>
          {ticket.comments.length === 0 ? <Text style={styles.noData}>Sin comentarios aún</Text> : ticket.comments.map((c) => <CommentItem key={c.id} comment={c} />)}
        </View>

        {!isResolved && (
          <View style={styles.card}>
            <Text style={styles.sTitle}>Agregar Comentario</Text>
            <TextInput style={styles.cInput} placeholder="Escribe un comentario..." placeholderTextColor={Colors.textLight} value={commentText} onChangeText={setCommentText} multiline numberOfLines={3} textAlignVertical="top" />
            <View style={styles.cFoot}><Text style={styles.cCount}>{commentText.length}</Text><Button title="Enviar" onPress={handleAddComment} disabled={!commentText.trim()} loading={sendingComment} style={styles.sendBtn} /></View>
          </View>
        )}

        {!isResolved && (
          <View style={styles.actions}>
            <Button title="Cambiar Prioridad" onPress={() => setShowPriority(true)} variant="secondary" style={{ flex: 1 }} />
            <Button title="Cerrar Ticket" onPress={doClose} style={{ flex: 1, backgroundColor: Colors.priorityAlta }} />
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ASSIGN MODAL */}
      <Modal visible={showAssign} animationType="slide" presentationStyle="pageSheet">
        <View style={modalStyles.wrap}>
          <View style={modalStyles.header}>
            <TouchableOpacity onPress={() => setShowAssign(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={modalStyles.title}>Asignar Técnicos</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={modalStyles.searchWrap}>
            <Ionicons name="search-outline" size={18} color={Colors.textLight} />
            <TextInput
              style={modalStyles.search}
              placeholder="Buscar técnico por nombre o email..."
              placeholderTextColor={Colors.textLight}
              value={assignSearch}
              onChangeText={setAssignSearch}
              autoFocus
            />
            {assignSearch.length > 0 && (
              <TouchableOpacity onPress={() => setAssignSearch('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textLight} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={modalStyles.ticketRef}>
            Ticket: {ticket.ticket_code} — {ticket.service_name}
          </Text>

          <FlatList
            data={filteredTechs}
            keyExtractor={(item: any) => String(item.ID_Technicians)}
            contentContainerStyle={modalStyles.list}
            renderItem={({ item }: any) => {
              const tid2 = item.ID_Technicians;
              const sel = selected.includes(tid2);
              const fullName = `${item.First_Name || ''} ${item.Last_Name || ''}`.trim();
              const status = item.Status || 'Desconocido';
              const statusColor = status === 'Disponible' ? Colors.statusResuelto : status === 'Ocupado' ? Colors.statusPendiente : Colors.textLight;
              return (
                <TouchableOpacity style={[modalStyles.card, sel && modalStyles.cardActive]} onPress={() => toggle(tid2)} activeOpacity={0.7}>
                  <View style={[modalStyles.cardBar, { backgroundColor: statusColor }]} />
                  <View style={[modalStyles.avatar, { backgroundColor: statusColor + '15' }]}>
                    <Text style={[modalStyles.avatarText, { color: statusColor }]}>
                      {(fullName || '?')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={modalStyles.info}>
                    <Text style={modalStyles.name}>{fullName || `Técnico #${tid2}`}</Text>
                    {item.Email ? <Text style={modalStyles.email}>{item.Email}</Text> : null}
                    <View style={modalStyles.badgeRow}>
                      <View style={[modalStyles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                        <View style={[modalStyles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[modalStyles.statusText, { color: statusColor }]}>{status}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[modalStyles.check, sel && modalStyles.checkActive]}>
                    {sel && <Ionicons name="checkmark" size={18} color="#fff" />}
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={modalStyles.empty}><Ionicons name="people-outline" size={40} color={Colors.textLight} /><Text style={modalStyles.emptyText}>Sin técnicos disponibles</Text></View>
            }
          />

          {selected.length > 0 && (
            <View style={modalStyles.footer}>
              <Text style={modalStyles.footerText}>{selected.length} técnico(s) seleccionado(s)</Text>
              <Button title={`Asignar (${selected.length})`} onPress={doAssign} loading={saving} style={modalStyles.footerBtn} />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

function Meta({ icon, label, value, color }: any) {
  return <View style={ms.item}><Ionicons name={icon} size={13} color={Colors.textLight} /><Text style={ms.lbl}>{label}</Text><Text style={[ms.val, color ? { color, fontWeight: '600' } : undefined]} numberOfLines={1}>{value}</Text></View>;
}
const ms = StyleSheet.create({ item: { flexDirection: 'row', alignItems: 'center', gap: 8 }, lbl: { fontSize: 12, color: Colors.textSecondary, width: 80 }, val: { fontSize: 12, color: Colors.text, flex: 1 } });
function fmt(d: string) { return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }); }
function fmtDT(d: string) { return new Date(d).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  sv: { flex: 1 },
  scroll: { padding: 12 },
  ctr: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, gap: 12, padding: 24 },
  ctrText: { fontSize: 14, color: Colors.textSecondary },
  ctrTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: 18, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  codeDot: { width: 8, height: 8, borderRadius: 4 },
  code: { fontSize: 13, fontWeight: '700', color: Colors.navyPrimary, fontFamily: 'monospace' },
  subject: { fontSize: 19, fontWeight: '600', color: Colors.text, lineHeight: 26 },
  prop: { fontSize: 12, color: Colors.navyPrimary, fontWeight: '600', letterSpacing: 0.2 },
  bienBlock: { marginTop: 6, backgroundColor: Colors.navyPrimary + '08', borderRadius: BorderRadius.md, padding: 10, borderWidth: 1, borderColor: Colors.navyPrimary + '18' },
  bienRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bienDesc: { fontSize: 12, color: Colors.text, marginTop: 4, paddingLeft: 18, lineHeight: 17 },
  div: { height: 1, backgroundColor: Colors.border, marginVertical: 14 },
  grid: { gap: 12 },
  sTitle: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  sHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  desc: { fontSize: 14, color: Colors.text, lineHeight: 22 },
  noData: { fontSize: 13, color: Colors.textLight, fontStyle: 'italic' },
  link: { fontSize: 13, fontWeight: '600', color: Colors.navyPrimary },
  cancelLink: { fontSize: 12, color: Colors.textSecondary },
  tRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  tDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.navyPrimary + '40' },
  tName: { fontSize: 13, color: Colors.text },
  pRow: { flexDirection: 'row', gap: 10 },
  pBtn: { flex: 1, paddingVertical: 13, borderRadius: BorderRadius.sm, borderWidth: 2, alignItems: 'center' },
  pText: { fontSize: 13, fontWeight: '600' },
  tlItem: { flexDirection: 'row', marginBottom: 4, marginTop: 10 },
  tlCol: { alignItems: 'center', width: 18 },
  tlDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textLight, borderWidth: 2, borderColor: Colors.border },
  tlDotFirst: { backgroundColor: Colors.navyPrimary, borderColor: Colors.navyPrimary },
  tlLine: { flex: 1, width: 2, backgroundColor: Colors.border, marginVertical: 2 },
  tlBody: { flex: 1, paddingLeft: 10, paddingBottom: 14 },
  tlAct: { fontSize: 13, fontWeight: '500', color: Colors.text },
  tlMeta: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  cInput: { backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: 14, fontSize: 13, color: Colors.text, minHeight: 80, borderWidth: 1, borderColor: Colors.border },
  cFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  cCount: { fontSize: 11, color: Colors.textLight },
  sendBtn: { width: 100, height: 38 },
  actions: { flexDirection: 'row', gap: 10, paddingTop: 4 },
});

const modalStyles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: 18, fontWeight: '600', color: Colors.text },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, marginHorizontal: 16, marginTop: 12, borderRadius: BorderRadius.md, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: Colors.border, gap: 8 },
  search: { flex: 1, fontSize: 14, color: Colors.text },
  ticketRef: { fontSize: 12, color: Colors.textSecondary, paddingHorizontal: 20, paddingTop: 10 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md, marginTop: 8, flexDirection: 'row', alignItems: 'center',
    padding: 14, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', gap: 12,
  },
  cardActive: { borderColor: Colors.navyPrimary, backgroundColor: Colors.navyPrimary + '06' },
  cardBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  avatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.text },
  email: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  badgeRow: { flexDirection: 'row', marginTop: 6, gap: 6 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  checkActive: { backgroundColor: Colors.navyPrimary, borderColor: Colors.navyPrimary },
  empty: { paddingVertical: 40, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border,
    paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  footerText: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  footerBtn: { minWidth: 130 },
});
