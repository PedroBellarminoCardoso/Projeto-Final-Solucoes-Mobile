import React, { useState } from 'react';
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
 * Campo de formulário padrão de autenticação com fundo branco, borda roxa e suporte a senha.
 */
export function AuthInput({
  label,
  icon,
  error,
  isPassword = false,
  containerStyle,
  onFocus,
  onBlur,
  ...props
}: AuthInputProps) {
  const [focused, setFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);

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
        <Feather name={icon} size={16} color={colors.primary} style={styles.inputIcon} />
        <TextInput
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
              size={17}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 13,
    marginBottom: 8
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4
  },
  inputBoxFocused: {
    borderColor: colors.primary
  },
  inputBoxError: {
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
  errorText: {
    color: colors.expense,
    fontSize: 11.5,
    fontFamily: fonts.regular,
    marginTop: 6
  }
});
