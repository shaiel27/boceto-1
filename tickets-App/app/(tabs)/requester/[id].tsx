import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { useTickets } from '../../../src/contexts/TicketContext';
import { getTicketDetail } from '../../../src/services/ticketService';
import { Ticket } from '../../../src/types/ticket';
import { CommentItem } from '../../../src/components/technician/CommentItem';
import { findBienByCode } from '../../../src/services/bienesService';

const PRIO_COL: Record<string, string> = { Alta: Colors.priorityAlta, Media: Colors.priorityMedia, Baja: Colors.textLight };

export default function RequesterTicketDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const { tickets, addComment } = useTickets();
  const tid = Number(id);
  const isResolved = ticket?.status === 'Resuelto';

  const load = async () => {
    setLoading(true);
    const cached = tickets.find((t) => t.id === tid) || null;
    const r = await getTicketDetail(tid, cached);
    if (r.success && r.ticket) setTicket(r.ticket);
    setLoading(false);
  };
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

  const handleComment = async () => {
    if (!comment.trim() && !image) return;
    setSending(true);
    await addComment(tid, comment || 'Adjunto imagen.', image || undefined);
    setComment(''); setImage(null);
    setSending(false);
    const cached = tickets.find((t) => t.id === tid) || null;
    const r = await getTicketDetail(tid, cached);
    if (r.success && r.ticket) setTicket(r.ticket);
  };

  const pickImage = async (fromCamera: boolean) => {
    const perm = fromCamera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') return;
    const result = fromCamera ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.7 });
    if (!result.canceled && result.assets[0]) setImage(result.assets[0].uri);
  };

  if (loading) return <View style={styles.ctr}><Text style={styles.ctrText}>Cargando...</Text></View>;
  if (!ticket) return <View style={styles.ctr}><Ionicons name="alert-circle" size={40} color={Colors.priorityAlta} /><Text style={styles.ctrTitle}>No encontrado</Text></View>;

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.codeBlock}>
              <View style={[styles.codeDot, { backgroundColor: isResolved ? Colors.statusResuelto : Colors.navyPrimary }]} />
              <Text style={styles.code}>{ticket.ticket_code}</Text>
            </View>
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: PRIO_COL[ticket.system_priority] + '14' }]}>
                <Text style={[styles.badgeText, { color: PRIO_COL[ticket.system_priority] }]}>{ticket.system_priority}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: sBg(ticket.status) }]}>
                <Text style={[styles.badgeText, { color: sFg(ticket.status) }]}>{ticket.status === 'En Proceso' ? 'En curso' : ticket.status}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.subject}>{ticket.subject}</Text>
          {ticket.property_number ? (
            <View style={styles.bienBlock}>
              <View style={styles.bienRow}>
                <Ionicons name="hardware-chip-outline" size={12} color={Colors.navyPrimary} />
                <Text style={styles.prop}>Bien N° {ticket.property_number}</Text>
              </View>
              {bienDesc ? (
                <Text style={styles.bienDesc}>{bienDesc}</Text>
              ) : null}
            </View>
          ) : null}
          <View style={styles.divider} />
          <View style={styles.grid}>
            <Row icon="business-outline" label="Oficina" v={ticket.office_name} />
            <Row icon="person-outline" label="Solicitante" v={ticket.citizen_name} />
            {ticket.citizen_email ? (
              <Row icon="mail-outline" label="Email" v={ticket.citizen_email} />
            ) : null}
            <Row icon="construct-outline" label="Servicio" v={ticket.service_name} />
            <Row icon="calendar-outline" label="Creado" v={fmt(ticket.created_at)} />
            {ticket.technician_names.length > 0 && (
              <Row icon="people-outline" label="Técnico" v={ticket.technician_names.join(', ')} />
            )}
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <View style={styles.sHead}><Ionicons name="document-text-outline" size={16} color={Colors.navyPrimary} /><Text style={styles.sLabel}>Descripción</Text></View>
          <Text style={styles.desc}>{ticket.description || 'Sin descripción'}</Text>
        </View>

        {/* Timeline */}
        {ticket.timeline.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sHead}><Ionicons name="time-outline" size={16} color={Colors.navyPrimary} /><Text style={styles.sLabel}>Línea de Tiempo</Text></View>
            {ticket.timeline.map((e, i) => (
              <View key={e.id} style={styles.tl}>
                <View style={styles.tlCol}><View style={[styles.tlDot, i === 0 && styles.tlDotFirst]} />{i < ticket.timeline.length - 1 && <View style={styles.tlLine} />}</View>
                <View style={styles.tlBody}><Text style={styles.tlAct}>{e.action_description}</Text><Text style={styles.tlMeta}>{e.actor} · {fmtDT(e.event_date)}</Text></View>
              </View>
            ))}
          </View>
        )}

        {/* Comments */}
        <View style={styles.card}>
          <View style={styles.sHead}><Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.navyPrimary} /><Text style={styles.sLabel}>Comentarios</Text></View>
          {ticket.comments.length === 0 ? <Text style={styles.noData}>Sin comentarios</Text> : ticket.comments.map((c) => <CommentItem key={c.id} comment={c} />)}
        </View>

        {/* Comment input */}
        {!isResolved && (
          <View style={styles.card}>
            <Text style={styles.sLabel}>Agregar Comentario</Text>
            <TextInput style={styles.cInput} placeholder="Escribe un comentario..." placeholderTextColor={Colors.textLight} value={comment} onChangeText={setComment} multiline numberOfLines={3} textAlignVertical="top" />
            {image && (
              <View style={styles.imgWrap}>
                <Image source={{ uri: image }} style={styles.img} />
                <TouchableOpacity style={styles.imgRemove} onPress={() => setImage(null)}><Ionicons name="close-circle" size={22} color={Colors.priorityAlta} /></TouchableOpacity>
              </View>
            )}
            <View style={styles.cFoot}>
              <View style={styles.cAttach}>
                <TouchableOpacity style={styles.attachBtn} onPress={() => pickImage(true)}><Ionicons name="camera-outline" size={18} color={Colors.navyPrimary} /></TouchableOpacity>
                <TouchableOpacity style={styles.attachBtn} onPress={() => pickImage(false)}><Ionicons name="image-outline" size={18} color={Colors.navyPrimary} /></TouchableOpacity>
              </View>
              <TouchableOpacity style={[styles.sendBtn, (!comment.trim() && !image) && { opacity: 0.4 }]} onPress={handleComment} disabled={!comment.trim() && !image}>
                {sending ? <ActivityIndicator size="small" color={Colors.gold} /> : <Text style={styles.sendText}>Enviar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isResolved && (
          <View style={styles.resolvedBanner}>
            <Ionicons name="lock-closed" size={16} color={Colors.statusResuelto} />
            <Text style={styles.resolvedText}>Este ticket está cerrado.</Text>
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function Row({ icon, label, v }: any) {
  return <View style={rs.item}><Ionicons name={icon} size={13} color={Colors.textLight} /><Text style={rs.lbl}>{label}</Text><Text style={rs.val} numberOfLines={1}>{v}</Text></View>;
}
const rs = StyleSheet.create({ item: { flexDirection: 'row', alignItems: 'center', gap: 8 }, lbl: { fontSize: 12, color: Colors.textSecondary, width: 80 }, val: { fontSize: 12, color: Colors.text, flex: 1 } });
function fmt(d: string) { return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }); }
function fmtDT(d: string) { return new Date(d).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
function sBg(s: string) { return s === 'Pendiente' ? Colors.statusPendienteBg : s === 'En Proceso' ? Colors.statusEnProcesoBg : Colors.statusResueltoBg; }
function sFg(s: string) { return s === 'Pendiente' ? Colors.badgeMedText : s === 'En Proceso' ? Colors.badgeBlueText : Colors.badgeLowText; }

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 12 },
  ctr: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, gap: 12, padding: 24 },
  ctrText: { fontSize: 14, color: Colors.textSecondary },
  ctrTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: 18, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  codeBlock: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  codeDot: { width: 8, height: 8, borderRadius: 4 },
  code: { fontSize: 13, fontWeight: '700', color: Colors.navyPrimary, fontFamily: 'monospace' },
  badges: { flexDirection: 'row', gap: 5 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.sm },
  badgeText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  subject: { fontSize: 18, fontWeight: '600', color: Colors.text, lineHeight: 24 },
  prop: { fontSize: 12, color: Colors.navyPrimary, fontWeight: '600', letterSpacing: 0.2 },
  bienBlock: { marginTop: 6, backgroundColor: Colors.navyPrimary + '08', borderRadius: BorderRadius.md, padding: 10, borderWidth: 1, borderColor: Colors.navyPrimary + '18' },
  bienRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bienDesc: { fontSize: 12, color: Colors.text, marginTop: 4, paddingLeft: 18, lineHeight: 17 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 14 },
  grid: { gap: 12 },
  sHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, textTransform: 'uppercase', letterSpacing: 0.5 },
  desc: { fontSize: 14, color: Colors.text, lineHeight: 22 },
  noData: { fontSize: 13, color: Colors.textLight, fontStyle: 'italic' },
  tl: { flexDirection: 'row', marginBottom: 4, marginTop: 8 },
  tlCol: { alignItems: 'center', width: 18 },
  tlDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textLight, borderWidth: 2, borderColor: Colors.border },
  tlDotFirst: { backgroundColor: Colors.navyPrimary, borderColor: Colors.navyPrimary },
  tlLine: { flex: 1, width: 2, backgroundColor: Colors.border, marginVertical: 2 },
  tlBody: { flex: 1, paddingLeft: 10, paddingBottom: 12 },
  tlAct: { fontSize: 13, fontWeight: '500', color: Colors.text },
  tlMeta: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  cInput: { backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: 14, fontSize: 13, color: Colors.text, minHeight: 80, borderWidth: 1, borderColor: Colors.border },
  imgWrap: { position: 'relative', marginTop: 10, borderRadius: BorderRadius.md, overflow: 'hidden' },
  img: { width: '100%', height: 150, borderRadius: BorderRadius.md },
  imgRemove: { position: 'absolute', top: 8, right: 8, backgroundColor: Colors.surface, borderRadius: 12 },
  cFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  cAttach: { flexDirection: 'row', gap: 8 },
  attachBtn: { width: 36, height: 36, borderRadius: BorderRadius.sm, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  sendBtn: { paddingHorizontal: 24, paddingVertical: 11, borderRadius: BorderRadius.md, backgroundColor: Colors.primary },
  sendText: { fontSize: 13, fontWeight: '700', color: Colors.gold },
  resolvedBanner: { backgroundColor: Colors.statusResueltoBg, borderRadius: BorderRadius.md, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  resolvedText: { flex: 1, fontSize: 12, color: Colors.statusResuelto, fontWeight: '500' },
});
