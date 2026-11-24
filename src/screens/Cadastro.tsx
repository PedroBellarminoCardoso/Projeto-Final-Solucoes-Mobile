import React, { useRef, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { AuthLayout } from '../components/AuthLayout';
import { PrimaryButton } from '../components/PrimaryButton';
import { AuthInput } from '../components/AuthInput';
import { colors } from '../theme/colors';
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

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

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
    <AuthLayout
      title="Criar conta"
      subtitle="Seu dinheiro, sem complicação."
      cardIcon="user-plus"
      cardTitle="Faça seu cadastro"
      cardSubtitle="Preencha seus dados para organizar suas finanças."
      switchPrompt="Já possui cadastro?"
      switchActionLabel="Entrar"
      onSwitchPress={() => navigation.navigate('Login')}
    >
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
        onSubmitEditing={() => emailRef.current?.focus()}
        error={nameError}
      />

      <AuthInput
        ref={emailRef}
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
        onSubmitEditing={() => passwordRef.current?.focus()}
        error={emailError}
      />

      <AuthInput
        ref={passwordRef}
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
        onSubmitEditing={() => confirmRef.current?.focus()}
        error={passwordError}
      />

      <AuthInput
        ref={confirmRef}
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

      <PrimaryButton
        title="Cadastrar"
        icon="user-plus"
        onPress={handleRegister}
        style={styles.submitButton}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  fieldSpacing: {
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
