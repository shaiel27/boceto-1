import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Colors, BorderRadius } from '../../src/constants/colors';
import { useAuthStore } from '../../src/stores/authStore';
import { loginSchema, LoginFormData } from '../../src/utils/validation';
import { FormField } from '../../src/components/ui/FormField';

export default function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuthStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const EMAIL_DOMAIN = '@tickets.gob';

  const buildFullEmail = (prefix: string) => {
    const cleaned = prefix.split('@')[0].trim();
    return cleaned ? `${cleaned}${EMAIL_DOMAIN}` : '';
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      const fullEmail = buildFullEmail(data.email);
      if (!fullEmail) return;
      await login(fullEmail, data.password);
    } catch {}
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.topSection}>
        <View style={styles.topGradient}>
          <Animated.View style={[styles.logoWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Image source={require('../../assets/loading.png')} style={styles.logoImage} resizeMode="contain" />
          </Animated.View>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
            <Text style={styles.brandLabel}>ALCALDÍA DEL MUNICIPIO</Text>
            <Text style={styles.brandName}>San Cristóbal</Text>
            <View style={styles.brandRule} />
            <Text style={styles.brandDesc}>Sistema de Gestión de Tickets</Text>
          </Animated.View>
        </View>
      </View>

      <View style={styles.formWrap}>
        <Text style={styles.formTitle}>Iniciar sesión</Text>
        <Text style={styles.formSub}>Ingrese sus credenciales</Text>

        <FormField
          name="email"
          control={control}
          label="Correo electrónico"
          icon="mail-outline"
          placeholder="tu.usuario"
          autoCapitalize="none"
          autoComplete="username"
          domainSuffix="@tickets.gob"
          error={errors.email}
        />

        <FormField
          name="password"
          control={control}
          label="Contraseña"
          icon="lock-closed-outline"
          placeholder="••••••••"
          isPassword
          autoComplete="password"
          error={errors.password}
        />

        {error && (
          <View style={styles.errBox}>
            <Ionicons name="alert-circle" size={16} color={Colors.coral} />
            <Text style={styles.errText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submit, isLoading && styles.submitDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.submitText}>
            {isLoading ? 'Verificando...' : 'Ingresar'}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.gold} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.navyPrimary },
  topSection: { flex: 1, justifyContent: 'center' },
  topGradient: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 32 },
  logoWrap: {
    width: 150, height: 120,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: { width: 150, height: 120 },
  brandLabel: { fontSize: 10, letterSpacing: 3, color: '#94845c', textTransform: 'uppercase', fontWeight: '600' },
  brandName: { fontSize: 28, fontWeight: '300', color: Colors.gold, marginTop: 6, letterSpacing: 1 },
  brandRule: { width: 32, height: 1, backgroundColor: Colors.gold, marginVertical: 14, opacity: 0.5 },
  brandDesc: { fontSize: 12, color: '#94845c', letterSpacing: 2, textTransform: 'uppercase', fontWeight: '500' },

  formWrap: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  formTitle: { fontSize: 22, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  formSub: { fontSize: 13, color: Colors.textSecondary, marginBottom: 28 },

  errBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef3f2',
    padding: 12,
    borderRadius: BorderRadius.sm,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#fecdc9',
  },
  errText: { fontSize: 13, color: '#b91c1c', flex: 1, fontWeight: '500' },

  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.navyPrimary,
    height: 52,
    borderRadius: BorderRadius.sm,
    marginTop: 12,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { fontSize: 15, fontWeight: '600', color: Colors.gold, letterSpacing: 0.5 },
});
