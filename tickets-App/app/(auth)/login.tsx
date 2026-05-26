import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../../src/constants/colors';
import { useAuth } from '../../src/hooks/useAuth';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const { login, isLoading, error, clearError } = useAuth();

  async function handleLogin() {
    setEmailError('');
    clearError();

    if (!email.trim()) {
      setEmailError('El correo es requerido');
      return;
    }
    if (!password) {
      return;
    }

    try {
      await login(email.trim(), password);
      // app/index.tsx handles redirect when isAuthenticated changes
    } catch {
      // handled by AuthContext
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand section */}
        <View style={styles.brandSection}>
          <View style={styles.shieldCircle}>
            <Ionicons name="shield-checkmark" size={44} color={Colors.coral} />
          </View>
          <Text style={styles.title}>Sistema de Tickets</Text>
          <Text style={styles.subtitle}>Alcaldía de San Cristóbal</Text>
        </View>

        {/* Form section */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Iniciar Sesión</Text>

          <Input
            label="Correo Electrónico"
            icon="mail-outline"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) clearError();
            }}
            placeholder="correo@alcaldia.gob"
            autoCapitalize="none"
            keyboardType="email-address"
            error={emailError}
          />

          <Input
            label="Contraseña"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            isPassword
          />

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={Colors.coral} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />

          <View style={styles.divider} />

          <View style={styles.helpSection}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.textLight} />
            <Text style={styles.helperText}>
              Demo: tech1@alcaldia.gob / password123
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  brandSection: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  shieldCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2.5,
    borderColor: Colors.coral,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textOnPrimary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.goldLight,
    marginTop: 4,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  formSection: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.coralLight,
    padding: 12,
    borderRadius: BorderRadius.md,
    marginBottom: 16,
    gap: 10,
  },
  errorText: {
    fontSize: 13,
    color: Colors.coralDark,
    flex: 1,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 4,
    height: 52,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 20,
  },
  helpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textLight,
  },
});
