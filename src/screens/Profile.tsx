import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';

export function ProfileScreen() {
  return (
    <Screen title="Meu perfil" subtitle="Configurações da conta">
      <Card style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>E</Text>
        </View>
        <Text style={styles.name}>Estudante</Text>
        <Text style={styles.email}>estudante@email.com</Text>
      </Card>
      <Text style={styles.info}>
        Esta é uma tela inicial de perfil. Autenticação, edição de dados e configurações podem ser conectadas futuramente.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    alignItems: 'center'
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.softPurple,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: colors.primary,
    fontSize: 26,
    fontWeight: '800'
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12
  },
  email: {
    color: colors.muted,
    marginTop: 4
  },
  info: {
    color: colors.muted,
    lineHeight: 21,
    marginTop: 18
  }
});
