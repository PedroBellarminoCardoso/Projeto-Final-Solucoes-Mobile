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

export function CadastroScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const handleRegister = () => {
    const nextNameError = name.trim() ? null : 'Informe seu nome.';
    const nextEmailError = getEmailError(email);
    const nextPasswordError = password.trim() ? null : 'Informe uma senha.';
    let nextConfirmError: string | null = null;

    if (!confirmPassword.trim()) {
      nextConfirmError = 'Confirme sua senha.';
    } else if (confirmPassword !== password) {
      nextConfirmError = 'As senhas não coincidem.';
    }

    setNameError(nextNameError);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setConfirmError(nextConfirmError);

    if (nextNameError || nextEmailError || nextPasswordError || nextConfirmError) {
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
        title="Criar conta"
        subtitle="Seu dinheiro, sem complicação."
      >
        <Card style={styles.formCard}>
          <Text style={styles.cardTitle}>Faça seu cadastro</Text>
          <Text style={styles.cardSubtitle}>
            Preencha seus dados para começar a organizar suas finanças.
          </Text>

          <View style={styles.purpleDivider} />

          <AuthInput
            label="Nome"
            icon="user"
            value={name}
            onChangeText={text => {
              setName(text);
              if (nameError) setNameError(null);
            }}
            placeholder="Seu nome completo"
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            error={nameError}
          />

          <AuthInput
            label="E-mail"
            icon="mail"
            containerStyle={styles.fieldSpacing}
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
            containerStyle={styles.fieldSpacing}
            value={password}
            onChangeText={text => {
              setPassword(text);
              if (passwordError) setPasswordError(null);
              if (confirmError && confirmPassword === text) setConfirmError(null);
            }}
            placeholder="Digite sua senha"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            error={passwordError}
          />

          <AuthInput
            label="Confirme sua senha"
            icon="lock"
            isPassword
            containerStyle={styles.fieldSpacing}
            value={confirmPassword}
            onChangeText={text => {
              setConfirmPassword(text);
              if (confirmError) setConfirmError(null);
            }}
            placeholder="Repita sua senha"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={handleRegister}
            error={confirmError}
          />

          <View style={styles.purpleDivider} />

          <PrimaryButton
            title="Cadastrar"
            icon="user-plus"
            onPress={handleRegister}
            style={styles.submitButton}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.switchButton}
          >
            <Text style={styles.switchButtonText}>Possui cadastro?</Text>
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
    marginTop: 4
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
  fieldSpacing: {
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
