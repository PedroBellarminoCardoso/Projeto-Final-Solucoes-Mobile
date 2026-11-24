import React, { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface AuthInputProps extends TextInputProps {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  error?: string | null;
  isPassword?: boolean;
  containerStyle?: object;
}

/**
 * Campo de formulário padrão de autenticação com fundo suave, destaque no foco e suporte a senha.
 */
export const AuthInput = forwardRef<TextInput, AuthInputProps>(function AuthInput(
  {
    label,
    icon,
    error,
    isPassword = false,
    containerStyle,
    onFocus,
    onBlur,
    ...props
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);

  const iconColor = error ? colors.expense : focused ? colors.primary : colors.muted;

  return (
    <View style={containerStyle}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View
        style={[
          styles.inputBox,
          focused && styles.inputBoxFocused,
          !!error && styles.inputBoxError
        ]}
      >
        <Feather name={icon} size={16} color={iconColor} style={styles.inputIcon} />
        <TextInput
          ref={ref}
          placeholderTextColor={colors.muted}
          secureTextEntry={isPassword ? hidePassword : false}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={styles.input}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setHidePassword(prev => !prev)}
            style={styles.eyeButton}
            accessibilityLabel={hidePassword ? 'Mostrar senha' : 'Ocultar senha'}
          >
            <Feather
              name={hidePassword ? 'eye-off' : 'eye'}
              size={16}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
      {!!error && (
        <View style={styles.errorRow}>
          <Feather name="alert-circle" size={12} color={colors.expense} style={styles.errorIcon} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    marginBottom: 7
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softPurpleLight,
    borderWidth: 1.5,
    borderColor: colors.softPurpleBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 3
  },
  inputBoxFocused: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  inputBoxError: {
    backgroundColor: '#FFF8F8',
    borderColor: colors.expense
  },
  inputIcon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontFamily: fonts.regular,
    paddingVertical: 10
  },
  eyeButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.softPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  errorIcon: {
    marginRight: 5
  },
  errorText: {
    color: colors.expense,
    fontSize: 11.5,
    fontFamily: fonts.regular,
    flex: 1
  }
});
