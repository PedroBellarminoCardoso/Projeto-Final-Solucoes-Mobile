import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppLogo } from './AppLogo';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  cardIcon: keyof typeof Feather.glyphMap;
  cardTitle: string;
  cardSubtitle: string;
  switchPrompt: string;
  switchActionLabel: string;
  onSwitchPress: () => void;
  children: React.ReactNode;
}



export function AuthLayout({
  title,
  subtitle,
  cardIcon,
  cardTitle,
  cardSubtitle,
  switchPrompt,
  switchActionLabel,
  onSwitchPress,
  children
}: AuthLayoutProps) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.root}>
        <View style={styles.backdropLayer} pointerEvents="none">
          <View style={styles.blobTopRight} />
          <View style={styles.blobTopLeft} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.logoFrame}>
              <AppLogo size={74} />
            </View>

            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>CADÊ MEU DINHEIRO?</Text>
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

   
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconPill}>
                <Feather name={cardIcon} size={18} color={colors.primary} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>{cardTitle}</Text>
                <Text style={styles.cardSubtitle}>{cardSubtitle}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {children}
          </View>


          <TouchableOpacity
            onPress={onSwitchPress}
            activeOpacity={0.75}
            style={styles.switchPill}
          >
            <Text style={styles.switchPrompt}>{switchPrompt} </Text>
            <Text style={styles.switchAction}>{switchActionLabel}</Text>
            <Feather name="arrow-right" size={14} color={colors.primary} style={styles.switchArrow} />
          </TouchableOpacity>

        
          <View style={styles.securityRow}>
            <Feather name="shield" size={12} color={colors.primary} />
            <Text style={styles.securityText}>
              Suas finanças são pessoais. Cuide dos seus dados.
            </Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  backdropLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden'
  },
  blobTopRight: {
    position: 'absolute',
    top: -110,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.softPurple,
    opacity: 0.9
  },
  blobTopLeft: {
    position: 'absolute',
    top: -60,
    left: -90,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.softPurpleBorder,
    opacity: 0.45
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 28
  },
  hero: {
    alignItems: 'center',
    marginBottom: 20
  },
  logoFrame: {
    padding: 7,
    borderRadius: 26,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.softPurpleBorder,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
    marginBottom: 14
  },
  brandBadge: {
    backgroundColor: colors.softPurple,
    borderWidth: 1,
    borderColor: colors.softPurpleBorder,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10
  },
  brandBadgeText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 1.1,
    color: colors.primary
  },
  title: {
    fontSize: 25,
    fontFamily: fonts.bold,
    color: colors.text,
    letterSpacing: -0.4,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 13.5,
    fontFamily: fonts.regular,
    color: colors.muted,
    marginTop: 4,
    textAlign: 'center'
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.softPurpleBorder,
    shadowColor: '#2A145E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
    elevation: 4
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  cardIconPill: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.softPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  cardHeaderText: {
    flex: 1
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
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16
  },
  switchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.softPurpleBorder
  },
  switchPrompt: {
    fontSize: 13.5,
    fontFamily: fonts.regular,
    color: colors.textSecondary
  },
  switchAction: {
    fontSize: 13.5,
    fontFamily: fonts.bold,
    color: colors.primary
  },
  switchArrow: {
    marginLeft: 5
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14
  },
  securityText: {
    fontSize: 11.5,
    color: colors.muted,
    marginLeft: 6,
    fontFamily: fonts.regular
  }
});
