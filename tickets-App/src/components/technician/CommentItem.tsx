import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../../constants/colors';
import { TicketComment } from '../../types/ticket';

interface CommentItemProps {
  comment: TicketComment;
}

export function CommentItem({ comment }: CommentItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarCol}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={18} color={Colors.primary} />
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
        <Text style={styles.comment}>{comment.comment}</Text>
        {comment.attachments.length > 0 && (
          <View style={styles.attachments}>
            {comment.attachments.map((file, i) => (
              <View key={i} style={styles.attachment}>
                <Ionicons name="document-attach-outline" size={14} color={Colors.primary} />
                <Text style={styles.attachmentName}>{file}</Text>
              </View>
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
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarCol: {
    alignItems: 'center',
    width: 32,
    marginRight: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLine: {
    flex: 1,
    width: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
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
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryLight + '15',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  comment: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  attachments: {
    marginTop: 10,
    gap: 6,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attachmentName: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  date: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'right',
  },
});
