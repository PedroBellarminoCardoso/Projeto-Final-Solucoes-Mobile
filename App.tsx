import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { FinanceProvider, useFinance } from './src/contexts/FinanceContext';
import { HomeScreen } from './src/screens/Home';
import { TransactionsScreen } from './src/screens/Transactions';
import { AddTransactionScreen } from './src/screens/AddTransaction';
import { BudgetsScreen } from './src/screens/Budgets';
import { ReportsScreen } from './src/screens/Reports';
import { CategoriesScreen } from './src/screens/CategoriesModal';
import { NotificationsScreen } from './src/screens/NotificationsModal';
import { colors } from './src/theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Início"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color }) => {
          if (route.name === 'Adicionar') {
            return (
              <View style={styles.fabCircle}>
                <Feather name="plus" size={20} color="#FFFFFF" />
              </View>
            );
          }

          let iconName: keyof typeof Feather.glyphMap = 'home';
          if (route.name === 'Extrato') iconName = 'repeat';
          if (route.name === 'Orçamento') iconName = 'pie-chart';
          if (route.name === 'Relatórios') iconName = 'bar-chart-2';

          return (
            <View style={[styles.tabIconPill, focused && styles.tabIconPillActive]}>
              <Feather name={iconName} size={18} color={color} />
            </View>
          );
        }
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Extrato" component={TransactionsScreen} />
      <Tab.Screen name="Adicionar" component={AddTransactionScreen} />
      <Tab.Screen name="Orçamento" component={BudgetsScreen} />
      <Tab.Screen name="Relatórios" component={ReportsScreen} />
    </Tab.Navigator>
  );
}

function AppNavigation() {
  const { loading } = useFinance();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Preparando suas finanças...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainTabs" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Categories" component={CategoriesScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <FinanceProvider>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
          <AppNavigation />
        </SafeAreaView>
      </FinanceProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background
  },
  loadingText: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 13.5,
    fontWeight: '600'
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 68,
    paddingTop: 6,
    paddingBottom: 8
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2
  },
  tabIconPill: {
    width: 38,
    height: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabIconPillActive: {
    backgroundColor: colors.softPurple
  },
  fabCircle: {
    width: 44,
    height: 34,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
