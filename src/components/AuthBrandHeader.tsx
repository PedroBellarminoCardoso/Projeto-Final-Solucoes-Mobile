import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppLogo } from './AppLogo';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface AuthBrandHeaderProps {
  activeMode: 'login' | 'cadastro';
  bannerOverline: string;
  bannerTitle: string;
  bannerSubtitle: string;
  onSelectLogin: () => void;
  onSelectCadastro: () => void;
}


export function AuthBrandHeader({
  activeMode,
  bannerOverline,
  bannerTitle,
  bannerSubtitle,
  onSelectLogin,
  onSelectCadastro
}: AuthBrandHeaderProps) {
  const isLogin = activeMode === 'login';

  return (
    <View>
     
      <View style={styles.brandCard}>
        <View style={styles.logoFrame}>
          <AppLogo size={58} />
        </View>

        <View style={styles.brandTextBlock}>
          <Text style={styles.brandOverline}>{bannerOverline}</Text>
          <Text style={styles.brandTitle}>{bannerTitle}</Text>
          <Text style={styles.brandSubtitle}>{bannerSubtitle}</Text>
        </View>
      </View>


      <View style={styles.segmentedControl}>
        <TouchableOpacity
          onPress={onSelectLogin}
          activeOpacity={0.8}
          style={[styles.segmentBtn, isLogin && styles.segmentBtnActive]}
        >
          <Feather name="log-in" size={14} color={isLogin ? '#FFFFFF' : colors.muted} />
          <Text style={[styles.segmentText, isLogin && styles.segmentTextActive]}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSelectCadastro}
          activeOpacity={0.8}
          style={[styles.segmentBtn, !isLogin && styles.segmentBtnActive]}
        >
          <Feather name="user-plus" size={14} color={!isLogin ? '#FFFFFF' : colors.muted} />
          <Text style={[styles.segmentText, !isLogin && styles.segmentTextActive]}>Criar conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14
  },
  logoFrame: {
    padding: 3,
    borderRadius: 17,
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    marginRight: 14
  },
  brandTextBlock: {
    flex: 1
  },
  brandOverline: {
    color: '#E6DCFF',
    fontSize: 10.5,
    fontFamily: fonts.bold,
    letterSpacing: 0.6,
    textTransform: 'uppercase'
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontFamily: fonts.bold,
    marginTop: 2
  },
  brandSubtitle: {
    color: '#DFD2FF',
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 3,
    lineHeight: 17
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    padding: 4,
    marginBottom: 14
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12
  },
  segmentBtnActive: {
    backgroundColor: colors.primary
  },
  segmentText: {
    fontSize: 13.5,
    fontFamily: fonts.bold,
    color: colors.muted,
    marginLeft: 6
  },
  segmentTextActive: {
    color: '#FFFFFF'
  }
});
