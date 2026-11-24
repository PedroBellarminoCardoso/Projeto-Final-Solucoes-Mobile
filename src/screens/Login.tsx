import React, { useRef, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { AuthLayout } from '../components/AuthLayout';
import { PrimaryButton } from '../components/PrimaryButton';
import { AuthInput } from '../components/AuthInput';
import { colors } from '../theme/colors';
import { getEmailError, sanitizeEmail } from '../utils/validation';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);

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
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Seu dinheiro, sem complicação."
      cardIcon="log-in"
      cardTitle="Acesse sua conta"
      cardSubtitle="Entre com seu e-mail e senha para continuar."
      switchPrompt="Não possui conta ainda?"
      switchActionLabel="Criar conta"
      onSwitchPress={() => navigation.navigate('Cadastro')}
    >
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
        onSubmitEditing={() => passwordRef.current?.focus()}
        error={emailError}
      />

      <AuthInput
        ref={passwordRef}
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

      <PrimaryButton
        title="Entrar"
        icon="log-in"
        onPress={handleLogin}
        style={styles.submitButton}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  passwordSpacing: {
    marginTop: 14
  },
  submitButton: {
    marginTop: 20,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 5
  }
});
