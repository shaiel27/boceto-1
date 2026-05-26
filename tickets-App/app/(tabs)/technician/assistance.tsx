import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { useToast } from '../../../src/contexts/ToastContext';

const REASONS = [
  { key: 'diagnosis', label: 'Ayuda con diagnóstico', icon: 'search-outline' },
  { key: 'knowledge', label: 'Excede mi conocimiento técnico', icon: 'school-outline' },
  { key: 'authorization', label: 'Requiere autorización del supervisor', icon: 'shield-checkmark-outline' },
  { key: 'personnel', label: 'Necesito más personal', icon: 'people-outline' },
  { key: 'parts', label: 'Repuesto no disponible', icon: 'cube-outline' },
  { key: 'other', label: 'Otro motivo', icon: 'ellipsis-horizontal-outline' },
];

export default function AssistanceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const toast = useToast();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  const handleSubmit = () => {
    if (!selectedReason) {
      toast.showToast({ title: 'Selecciona un motivo', message: 'Debes elegir un motivo para solicitar asistencia.', type: 'error' });
      return;
    }
    const reasonLabel = REASONS.find((r) => r.key === selectedReason)?.label;
    toast.showToast({
      title: 'Asistencia solicitada',
      message: `Motivo: ${reasonLabel}${details ? '. ' + details : ''}`,
      type: 'warning',
    });
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.headerIconCircle}>
          <Ionicons name="hand-left-outline" size={32} color={Colors.coral} />
        </View>
        <Text style={styles.headerTitle}>Solicitar Asistencia</Text>
        <Text style={styles.headerSubtitle}>
          Selecciona el motivo por el cual necesitas ayuda con este ticket.
        </Text>
      </View>

      <Card style={styles.reasonsCard}>
        {REASONS.map((reason) => {
          const isSelected = selectedReason === reason.key;
          return (
            <TouchableOpacity
              key={reason.key}
              style={[styles.reasonItem, isSelected && styles.reasonItemSelected]}
              onPress={() => setSelectedReason(reason.key)}
              activeOpacity={0.7}
            >
              <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <Ionicons
                name={reason.icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color={isSelected ? Colors.primary : Colors.textSecondary}
              />
              <Text style={[styles.reasonLabel, isSelected && styles.reasonLabelSelected]}>
                {reason.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Card>

      <Card style={styles.detailsCard}>
        <Text style={styles.detailsLabel}>Detalles adicionales (opcional)</Text>
        <TextInput
          style={styles.detailsInput}
          placeholder="Describe brevemente la situación..."
          placeholderTextColor={Colors.textLight}
          value={details}
          onChangeText={setDetails}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </Card>

      <View style={styles.actions}>
        <Button
          title="Cancelar"
          onPress={() => router.back()}
          variant="outline"
          style={styles.actionBtn}
        />
        <Button
          title="Enviar Solicitud"
          onPress={handleSubmit}
          variant="primary"
          disabled={!selectedReason}
          style={styles.actionBtn}
        />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  headerIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.coralLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  reasonsCard: {
    marginBottom: 12,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    gap: 12,
    marginBottom: 4,
  },
  reasonItemSelected: {
    backgroundColor: Colors.primaryLight + '10',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.textLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  reasonLabel: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  reasonLabelSelected: {
    fontWeight: '600',
    color: Colors.primary,
  },
  detailsCard: {
    marginBottom: 16,
  },
  detailsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 10,
  },
  detailsInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 14,
    fontSize: 14,
    color: Colors.text,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
  },
});
