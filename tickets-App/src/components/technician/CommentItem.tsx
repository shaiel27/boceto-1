import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../../constants/colors';
import { TicketComment, TicketAttachment } from '../../types/ticket';
import { API_BASE_URL } from '../../constants/config';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function iconForType(type: string): keyof typeof Ionicons.glyphMap {
  if (type.startsWith('image/')) return 'image-outline';
  if (type.includes('pdf')) return 'document-text-outline';
  if (type.includes('word') || type.includes('document')) return 'document-outline';
  if (type.includes('sheet') || type.includes('excel')) return 'grid-outline';
  return 'document-attach-outline';
}

function AttachmentRow({ file }: { file: TicketAttachment }) {
  const url = `${API_BASE_URL}/${file.file_path}`;

  const open = () => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <TouchableOpacity style={attStyles.row} onPress={open} activeOpacity={0.6}>
      <View style={attStyles.icon}>
        <Ionicons name={iconForType(file.file_type)} size={16} color={Colors.navyPrimary} />
      </View>
      <View style={attStyles.info}>
        <Text style={attStyles.name} numberOfLines={1}>{file.file_name}</Text>
        <Text style={attStyles.meta}>{formatSize(file.file_size)}</Text>
      </View>
      <Ionicons name="open-outline" size={14} color={Colors.textLight} />
    </TouchableOpacity>
  );
}

const attStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.navyPrimary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1 },
  name: { fontSize: 12, fontWeight: '500', color: Colors.navyPrimary },
  meta: { fontSize: 10, color: Colors.textLight, marginTop: 1 },
});

interface CommentItemProps {
  comment: TicketComment;
}

export function CommentItem({ comment }: CommentItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarCol}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={16} color={Colors.navyPrimary} />
        </View>
        <View style={styles.avatarLine} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.userName}>{comment.user_name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{comment.user_role}</Text>
          </View>
        </View>
        <Text style={styles.commentText}>{comment.comment}</Text>
        {comment.attachments.length > 0 && (
          <View style={styles.attachments}>
            {comment.attachments.map((file) => (
              <AttachmentRow key={file.id} file={file} />
            ))}
          </View>
        )}
        <Text style={styles.date}>
          {new Date(comment.created_at).toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', marginBottom: 16 },
  avatarCol: { alignItems: 'center', width: 32, marginRight: 10 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.navyPrimary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLine: { flex: 1, width: 1, backgroundColor: Colors.border, marginTop: 4 },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: { fontSize: 13, fontWeight: '600', color: Colors.text },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.navyPrimary + '10',
  },
  roleText: { fontSize: 10, fontWeight: '600', color: Colors.navyPrimary, textTransform: 'uppercase' },
  commentText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  attachments: { marginTop: 10, gap: 6 },
  date: { fontSize: 11, color: Colors.textLight, marginTop: 8, textAlign: 'right' },
});
