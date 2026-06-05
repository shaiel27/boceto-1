import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Controller, FieldError } from 'react-hook-form';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';

interface FormFieldProps extends RNTextInputProps {
  name: string;
  control: any;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  error?: FieldError;
}

export function FormField({
  name,
  control,
  label,
  icon,
  isPassword = false,
  error,
  style,
  ...rest
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={styles.container}>
          <Text style={styles.label}>{label}</Text>
          <View
            style={[
              styles.inputRow,
              error && styles.inputError,
            ]}
          >
            {icon && (
              <Ionicons
                name={icon}
                size={18}
                color={error ? Colors.coral : Colors.textLight}
                style={styles.icon}
              />
            )}
            <TextInput
              style={[styles.input, style]}
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholderTextColor={Colors.textLight}
              secureTextEntry={isPassword && !showPassword}
              {...rest}
            />
            {isPassword && (
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.toggleBtn}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
          {error && (
            <Text style={styles.errorText}>{error.message}</Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    height: 50,
  },
  inputError: {
    borderColor: Colors.coral,
  },
  icon: {
    marginLeft: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    height: '100%',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    color: Colors.coral,
    marginTop: 4,
    marginLeft: 4,
  },
});
