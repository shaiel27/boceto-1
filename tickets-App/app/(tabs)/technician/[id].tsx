import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { useTickets } from '../../../src/contexts/TicketContext';
import { StatusBadge } from '../../../src/components/technician/StatusBadge';
import { CommentItem } from '../../../src/components/technician/CommentItem';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { useToast } from '../../../src/contexts/ToastContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PRIORITY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Alta: 'arrow-up-circle',
  Media: 'remove-circle',
  Baja: 'arrow-down-circle',
};

const PRIORITY_COLORS: Record<string, string> = {
  Alta: Colors.priorityAlta,
  Media: Colors.priorityMedia,
  Baja: Colors.priorityBaja,
};

const QUICK_REPLIES = [
  'Recibido, comenzaré la revisión.',
  'Necesito más información del problema.',
  'Repuesto solicitado, estimo 24h.',
  'Problema resuelto, confirmar cierre.',
];

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [newComment, setNewComment] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    timeline: true,
    comments: true,
  });
  const toast = useToast();
  const { getTicketById, takeTicket, resolveTicket, addComment } = useTickets();

  const ticket = getTicketById(Number(id));

  const toggleSection = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!ticket) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <Ionicons name="alert-circle-outline" size={40} color={Colors.coral} />
        </View>
        <Text style={styles.errorTitle}>Ticket no encontrado</Text>
        <Button title="Volver" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  const handleTakeTicket = () => {
    takeTicket(ticket.id, 'Carlos Técnico');
    toast.showToast({
      title: 'Ticket tomado',
      message: `El ticket ${ticket.ticket_code} ahora está en proceso.`,
      type: 'success',
    });
  };

  const handleResolve = () => {
    resolveTicket(ticket.id, newComment || 'Resuelto por el técnico.');
    toast.showToast({
      title: 'Ticket resuelto',
      message: `El ticket ${ticket.ticket_code} ha sido marcado como resuelto.`,
      type: 'success',
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim() && !selectedImage) return;
    addComment(ticket.id, {
      fk_service_request: ticket.id,
      fk_user: 2,
      comment: newComment || 'Adjunto imagen.',
      user_name: 'Carlos Técnico',
      user_role: 'Tecnico',
      attachments: selectedImage ? [selectedImage] : [],
    });
    toast.showToast({
      title: 'Comentario agregado',
      message: 'Tu comentario ha sido registrado exitosamente.',
      type: 'info',
    });
    setNewComment('');
    setSelectedImage(null);
    setShowQuickReplies(false);
  };

  const handleQuickReply = (reply: string) => {
    setNewComment(reply);
    setShowQuickReplies(false);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      toast.showToast({ title: 'Permiso denegado', message: 'Se necesita acceso a la galería.', type: 'error' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      toast.showToast({ title: 'Permiso denegado', message: 'Se necesita acceso a la cámara.', type: 'error' });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleAssistance = () => {
    router.push(`/(tabs)/technician/assistance?id=${ticket.id}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Ticket header */}
      <Card style={styles.headerCard}>
        <View style={styles.codeRow}>
          <View style={styles.codeDot} />
          <Text style={styles.code}>{ticket.ticket_code}</Text>
          <View style={{ flex: 1 }} />
          <StatusBadge status={ticket.status} />
        </View>
        <Text style={styles.subject}>{ticket.subject}</Text>
        {ticket.property_number && (
          <View style={styles.propertyRow}>
            <Ionicons name="pricetag-outline" size={13} color={Colors.textLight} />
            <Text style={styles.propertyText}>N° Bien: {ticket.property_number}</Text>
          </View>
        )}
        <View style={styles.divider} />
        <View style={styles.metaGrid}>
          <MetaRow icon="business-outline" label="Oficina" value={ticket.office_name} />
          <MetaRow icon="person-outline" label="Solicitante" value={ticket.citizen_name} />
          <MetaRow icon="build-outline" label="Servicio" value={ticket.service_name} />
          <MetaRow icon="bug-outline" label="Problema" value={ticket.problem_name} />
          <MetaRow
            icon={PRIORITY_ICONS[ticket.system_priority]}
            label="Prioridad"
            value={ticket.system_priority}
            valueColor={PRIORITY_COLORS[ticket.system_priority]}
          />
          <MetaRow icon="calendar-outline" label="Creado" value={formatDate(ticket.created_at)} />
        </View>
      </Card>

      {/* Description */}
      <Card style={styles.sectionCard}>
        <SectionHeader
          title="Descripción"
          icon="document-text-outline"
          isExpanded={expandedSections.description}
          onToggle={() => toggleSection('description')}
        />
        {expandedSections.description && (
          <Text style={styles.description}>{ticket.description}</Text>
        )}
      </Card>

      {/* Timeline */}
      {ticket.timeline.length > 0 && (
        <Card style={styles.sectionCard}>
          <SectionHeader
            title="Línea de Tiempo"
            icon="time-outline"
            badge={String(ticket.timeline.length)}
            isExpanded={expandedSections.timeline}
            onToggle={() => toggleSection('timeline')}
          />
          {expandedSections.timeline && (
            <View>
              {ticket.timeline.map((event, idx) => (
                <View key={event.id} style={styles.timelineItem}>
                  <View style={styles.timelineCol}>
                    <View style={[styles.timelineDot, idx === 0 && styles.timelineDotFirst, idx === ticket.timeline.length - 1 && styles.timelineDotLast]} />
                    {idx < ticket.timeline.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineAction}>{event.action_description}</Text>
                    <Text style={styles.timelineMeta}>
                      {event.actor} · {formatDateTime(event.event_date)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
      )}

      {/* Comments */}
      <Card style={styles.sectionCard}>
        <SectionHeader
          title="Comentarios"
          icon="chatbubble-ellipses-outline"
          badge={String(ticket.comments.length)}
          isExpanded={expandedSections.comments}
          onToggle={() => toggleSection('comments')}
        />
        {expandedSections.comments && (
          ticket.comments.length === 0 ? (
            <View style={styles.noComments}>
              <Ionicons name="chatbubble-ellipses-outline" size={28} color={Colors.textLight} />
              <Text style={styles.noCommentsText}>Sin comentarios aún</Text>
            </View>
          ) : (
            ticket.comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )
        )}
      </Card>

      {/* Add comment */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Agregar Comentario</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Describe tu avance o solución..."
          placeholderTextColor={Colors.textLight}
          value={newComment}
          onChangeText={(t) => {
            setNewComment(t);
            if (t.length === 0) setShowQuickReplies(false);
          }}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        <View style={styles.inputMeta}>
          <TouchableOpacity
            style={styles.quickReplyToggle}
            onPress={() => setShowQuickReplies(!showQuickReplies)}
          >
            <Ionicons name="flash-outline" size={16} color={Colors.primary} />
            <Text style={styles.quickReplyToggleText}>Respuestas rápidas</Text>
          </TouchableOpacity>
          <Text style={styles.charCount}>{newComment.length}</Text>
        </View>

        {showQuickReplies && (
          <View style={styles.quickReplies}>
            {QUICK_REPLIES.map((reply, i) => (
              <TouchableOpacity
                key={i}
                style={styles.quickReplyChip}
                onPress={() => handleQuickReply(reply)}
              >
                <Text style={styles.quickReplyText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedImage && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close-circle" size={22} color={Colors.coral} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.commentActions}>
          <View style={styles.attachGroup}>
            <TouchableOpacity style={styles.attachBtn} onPress={handleTakePhoto}>
              <Ionicons name="camera-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachBtn} onPress={handlePickImage}>
              <Ionicons name="image-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <Button
            title="Enviar"
            onPress={handleAddComment}
            disabled={!newComment.trim() && !selectedImage}
            style={styles.sendBtn}
          />
        </View>
      </Card>

      {/* Actions */}
      {(ticket.status === 'Pendiente' || ticket.status === 'En Proceso') && (
        <View style={styles.actionRow}>
          {ticket.status === 'Pendiente' && (
            <Button title="Tomar Ticket" onPress={handleTakeTicket} variant="primary" style={styles.actionBtn} />
          )}
          {ticket.status === 'En Proceso' && (
            <Button title="Marcar como Resuelto" onPress={handleResolve} variant="secondary" style={styles.actionBtn} />
          )}
          <Button title="Ayuda" onPress={handleAssistance} variant="outline" style={styles.actionBtn} />
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function MetaRow({ icon, label, value, valueColor }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={14} color={Colors.textLight} />
      <Text style={styles.metaLabel}>{label}</Text>
      <Text
        style={[styles.metaValue, valueColor ? { color: valueColor, fontWeight: '600' } : undefined]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function SectionHeader({
  title,
  icon,
  badge,
  isExpanded,
  onToggle,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity style={sectionHeaderStyles.header} onPress={onToggle} activeOpacity={0.7}>
      <View style={sectionHeaderStyles.left}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
        <Text style={sectionHeaderStyles.title}>{title}</Text>
        {badge && (
          <View style={sectionHeaderStyles.badge}>
            <Text style={sectionHeaderStyles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Ionicons
        name={isExpanded ? 'chevron-up' : 'chevron-down'}
        size={18}
        color={Colors.textLight}
      />
    </TouchableOpacity>
  );
}

const sectionHeaderStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryLight + '15',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
});

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  headerCard: {},
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  codeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  code: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  subject: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 26,
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  propertyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  metaGrid: {
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    width: 85,
  },
  metaValue: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
  },
  sectionCard: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 14,
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    marginTop: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
    marginTop: 14,
  },
  timelineCol: {
    alignItems: 'center',
    width: 20,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryLight + '40',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  timelineDotFirst: {
    backgroundColor: Colors.primary,
  },
  timelineDotLast: {
    borderColor: Colors.statusResuelto,
    backgroundColor: Colors.statusResueltoBg,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  timelineAction: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  timelineMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
    marginTop: 14,
  },
  noCommentsText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  commentInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 14,
    fontSize: 14,
    color: Colors.text,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quickReplyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  quickReplyToggleText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  charCount: {
    fontSize: 12,
    color: Colors.textLight,
  },
  quickReplies: {
    marginTop: 8,
    gap: 6,
  },
  quickReplyChip: {
    backgroundColor: Colors.primaryLight + '10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primaryLight + '25',
  },
  quickReplyText: {
    fontSize: 13,
    color: Colors.primary,
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  attachGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 110,
    height: 38,
  },
  imagePreview: {
    position: 'relative',
    marginTop: 12,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 160,
    borderRadius: BorderRadius.md,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: 16,
    padding: 24,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.coralLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '600',
  },
});
