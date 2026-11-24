import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { AuthInput } from '../components/AuthInput';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { getEmailError, sanitizeEmail } from '../utils/validation';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleLogin = () => {
    const nextEmailError = getEmailError(email);
    const nextPasswordError = password.trim() ? null : 'Informe sua senha.';

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError || nextPasswordError) {
      return;
    }

    navigation.replace('MainTabs');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen
        overline="CADÊ MEU DINHEIRO?"
        title="Entrar"
        subtitle="Seu dinheiro, sem complicação."
      >
        <Card style={styles.formCard}>
          <Text style={styles.cardTitle}>Acesse sua conta</Text>
          <Text style={styles.cardSubtitle}>
            Entre com seu e-mail e senha para acompanhar suas finanças.
          </Text>

          <View style={styles.purpleDivider} />

          <AuthInput
            label="E-mail"
            icon="mail"
            value={email}
            onChangeText={text => {
              setEmail(sanitizeEmail(text));
              if (emailError) setEmailError(null);
            }}
            onBlur={() => {
              if (email.length > 0) {
                setEmailError(getEmailError(email));
              }
            }}
            placeholder="estudante@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            error={emailError}
          />

          <AuthInput
            label="Senha"
            icon="lock"
            isPassword
            containerStyle={styles.passwordSpacing}
            value={password}
            onChangeText={text => {
              setPassword(text);
              if (passwordError) setPasswordError(null);
            }}
            placeholder="Digite sua senha"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            error={passwordError}
          />

          <View style={styles.purpleDivider} />

          <PrimaryButton
            title="Entrar"
            icon="log-in"
            onPress={handleLogin}
            style={styles.submitButton}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Cadastro')}
            style={styles.switchButton}
          >
            <Text style={styles.switchButtonText}>Não possui conta ainda?</Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.securityRow}>
          <Feather name="lock" size={11} color={colors.muted} />
          <Text style={styles.securityText}>Suas finanças são pessoais. Cuide dos seus dados.</Text>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  formCard: {
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    marginTop: 8
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.text
  },
  cardSubtitle: {
    fontSize: 12.5,
    fontFamily: fonts.regular,
    color: colors.muted,
    marginTop: 3
  },
  purpleDivider: {
    height: 1,
    backgroundColor: colors.softPurpleBorder,
    marginVertical: 14
  },
  passwordSpacing: {
    marginTop: 14
  },
  submitButton: {
    marginTop: 0
  },
  switchButton: {
    marginTop: 10,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.softPurpleBorder,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  switchButtonText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 14
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6
  },
  securityText: {
    fontSize: 11,
    color: colors.muted,
    marginLeft: 5,
    fontFamily: fonts.regular
  }
});
