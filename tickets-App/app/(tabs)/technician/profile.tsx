import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../../../src/constants/colors';
import { MOCK_TECHNICIAN } from '../../../src/mocks/technician';
import { useAuth } from '../../../src/hooks/useAuth';
import { useToast } from '../../../src/contexts/ToastContext';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { StatusBadge } from '../../../src/components/technician/StatusBadge';

export default function TechnicianProfileScreen() {
  const { logout } = useAuth();
  const toast = useToast();
  const [isAvailable, setIsAvailable] = useState(true);

  const tech = MOCK_TECHNICIAN;

  const handleLogout = async () => {
    await logout();
    toast.showToast({
      title: 'Sesión cerrada',
      message: 'Has cerrado sesión correctamente.',
      type: 'info',
    });
  };

  const handleChangePassword = () => {
    toast.showToast({
      title: 'Cambiar Contraseña',
      message: 'Funcionalidad próximamente disponible.',
      type: 'warning',
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={44} color={Colors.coral} />
        </View>
        <Text style={styles.fullName}>{tech.full_name}</Text>
        <View style={styles.roleRow}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{tech.role_name}</Text>
          </View>
          <Text style={styles.username}>@{tech.username}</Text>
        </View>
        <StatusBadge status={tech.technician_status === 'Disponible' ? 'Resuelto' : 'Pendiente'} />
      </View>

      {/* Availability */}
      <Card style={styles.sectionCard}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <View style={styles.onlineIndicator}>
              <View style={[styles.onlineDot, { backgroundColor: isAvailable ? Colors.statusResuelto : Colors.textLight }]} />
              <Text style={styles.toggleLabel}>
                {isAvailable ? 'Disponible' : 'No disponible'}
              </Text>
            </View>
            <Text style={styles.toggleHint}>
              {isAvailable ? 'Puedes recibir nuevos tickets' : 'No recibirás nuevos tickets'}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={(v) => {
              setIsAvailable(v);
              toast.showToast({
                message: v ? 'Ahora estás disponible para tickets' : 'Ahora estás no disponible',
                type: v ? 'success' : 'warning',
              });
            }}
            trackColor={{ false: Colors.border, true: Colors.statusResueltoBg }}
            thumbColor={isAvailable ? Colors.statusResuelto : Colors.textLight}
          />
        </View>
      </Card>

      {/* Work Info */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Información Laboral</Text>

        <ProfileRow icon="build-outline" label="Servicios" />
        <View style={styles.serviceTags}>
          {tech.services.map((s) => (
            <View key={s} style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>{s}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />
        <ProfileRow icon="time-outline" label="Horario">
          <Text style={styles.infoValue}>{tech.schedule[0].start} - {tech.schedule[0].end}</Text>
        </ProfileRow>

        <View style={styles.divider} />
        <ProfileRow icon="restaurant-outline" label="Almuerzo">
          <Text style={styles.infoValue}>{tech.lunch_block}</Text>
        </ProfileRow>

        <View style={styles.divider} />
        <Text style={styles.scheduleTitle}>Horario Semanal</Text>
        {tech.schedule.map((s, i) => (
          <View key={i} style={styles.scheduleRow}>
            <Text style={styles.scheduleDay}>{s.day_of_week}</Text>
            <View style={styles.scheduleTimeBar}>
              <View style={[styles.scheduleBar, { width: s.work_end_time === '15:00' ? '65%' : '80%' }]} />
            </View>
            <Text style={styles.scheduleTime}>{s.work_start_time} - {s.work_end_time}</Text>
          </View>
        ))}
      </Card>

      {/* Metrics */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Rendimiento</Text>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Resueltos Hoy</Text>
            <Text style={styles.metricValue}>{tech.metrics.resolved_today}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(tech.metrics.resolved_today / 5) * 100}%`, backgroundColor: Colors.coral }]} />
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Esta Semana</Text>
            <Text style={styles.metricValue}>{tech.metrics.resolved_week}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(tech.metrics.resolved_week / 20) * 100}%`, backgroundColor: Colors.gold }]} />
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Este Mes</Text>
            <Text style={styles.metricValue}>{tech.metrics.resolved_month}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(tech.metrics.resolved_month / 60) * 100}%`, backgroundColor: Colors.primary }]} />
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Tiempo Promedio</Text>
            <Text style={styles.metricValue}>{tech.metrics.avg_resolution_time}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '65%', backgroundColor: Colors.statusResuelto }]} />
          </View>
        </View>
      </Card>

      {/* Actions */}
      <Card style={styles.sectionCard}>
        <Button title="Cambiar Contraseña" onPress={handleChangePassword} variant="outline" />
        <View style={{ height: 12 }} />
        <Button title="Cerrar Sesión" onPress={handleLogout} variant="danger" />
      </Card>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function ProfileRow({
  icon,
  label,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.profileRow}>
      <Ionicons name={icon} size={16} color={Colors.textSecondary} />
      <Text style={styles.profileLabel}>{label}</Text>
      {children}
    </View>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 4,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: Colors.coral,
  },
  fullName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  roleBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight + '15',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  username: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  sectionCard: {
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  toggleHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    marginLeft: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  profileLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    width: 85,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  serviceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  serviceTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryLight + '12',
    borderWidth: 1,
    borderColor: Colors.primaryLight + '20',
  },
  serviceTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 2,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  scheduleDay: {
    fontSize: 13,
    color: Colors.text,
    width: 70,
  },
  scheduleTimeBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scheduleBar: {
    height: '100%',
    backgroundColor: Colors.primaryLight + '25',
    borderRadius: 4,
  },
  scheduleTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    width: 90,
    textAlign: 'right',
  },
  metricCard: {
    marginBottom: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
