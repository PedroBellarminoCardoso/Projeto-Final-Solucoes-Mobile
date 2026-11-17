import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FinanceProvider, useFinance } from './src/contexts/FinanceContext';
import { HomeScreen } from './src/screens/Home';
import { TransactionsScreen } from './src/screens/Transactions';
import { AddTransactionScreen } from './src/screens/AddTransaction';
import { BudgetsScreen } from './src/screens/Budgets';
import { ReportsScreen } from './src/screens/Reports';
import { ProfileScreen } from './src/screens/Profile';
import { colors } from './src/theme/colors';

type Tab = 'home' | 'transactions' | 'add' | 'budgets' | 'reports' | 'profile';

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: 'Início', icon: '⌂' },
  { key: 'transactions', label: 'Movimentos', icon: '⇄' },
  { key: 'add', label: 'Adicionar', icon: '+' },
  { key: 'budgets', label: 'Limites', icon: '◎' },
  { key: 'reports', label: 'Relatórios', icon: '▥' },
  { key: 'profile', label: 'Perfil', icon: '○' }
];

function AppContent() {
  const { loading } = useFinance();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.loadingText}>Preparando suas finanças...</Text></View>;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'transactions': return <TransactionsScreen />;
      case 'add': return <AddTransactionScreen onSaved={() => setActiveTab('transactions')} />;
      case 'budgets': return <BudgetsScreen />;
      case 'reports': return <ReportsScreen />;
      case 'profile': return <ProfileScreen />;
      default: return <HomeScreen onAdd={() => setActiveTab('add')} onSeeAll={() => setActiveTab('transactions')} />;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.content}>{renderScreen()}</View>
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => setActiveTab(tab.key)} accessibilityRole="button">
            <Text style={[styles.tabIcon, activeTab === tab.key && styles.activeTabText]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return <FinanceProvider><AppContent /></FinanceProvider>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  loadingText: { marginTop: 12, color: colors.muted },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 8, paddingHorizontal: 2 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 3 },
  tabIcon: { fontSize: 19, color: colors.muted, marginBottom: 2 },
  tabLabel: { fontSize: 9, color: colors.muted },
  activeTabText: { color: colors.primary, fontWeight: '700' }
});
