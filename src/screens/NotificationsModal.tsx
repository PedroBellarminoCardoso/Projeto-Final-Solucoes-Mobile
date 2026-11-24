import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { useFinance } from '../contexts/FinanceContext';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/currency';
import { isSameMonth } from '../utils/date';
import { fonts } from '../theme/fonts';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  actionLabel: string;
  targetTab: 'Orçamento' | 'Extrato';
  tone: 'amber' | 'red' | 'purple' | 'green';
  icon: string;
  meta: string;
}

export function NotificationsScreen({ navigation }: any) {
  const { transactions, selectedMonth, categoryBudgets, readNotifications, markAllNotificationsRead } = useFinance();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const monthTx = transactions.filter(t => isSameMonth(t.date, selectedMonth));
  const items: NotificationItem[] = [];

  const spentByCat: Record<string, number> = {};
  monthTx
    .filter(t => t.type === 'expense')
    .forEach(t => {
      spentByCat[t.category] = (spentByCat[t.category] || 0) + t.amount;
    });

  Object.entries(categoryBudgets).forEach(([cat, limit]) => {
    const spent = spentByCat[cat] || 0;
    const pct = limit > 0 ? (spent / limit) * 100 : 0;
    if (pct > 100) {
      items.push({
        id: `exceeded-${cat}`,
        title: `${cat} passou do combinado`,
        body: `Foram ${formatCurrency(spent)} para um limite de ${formatCurrency(limit)}. Que tal rever o plano?`,
        actionLabel: 'Ajustar limite',
        targetTab: 'Orçamento',
        tone: 'red',
        icon: 'alert-circle',
        meta: 'Orçamento'
      });
    } else if (pct >= 85) {
      items.push({
        id: `near-${cat}`,
        title: `Só ${formatCurrency(Math.max(limit - spent, 0))} para ${cat.toLowerCase()}`,
        body: `Seus gastos chegaram a ${formatCurrency(spent)} de ${formatCurrency(limit)}. Você usou ${Math.round(pct)}% do limite.`,
        actionLabel: 'Ver orçamento',
        targetTab: 'Orçamento',
        tone: 'amber',
        icon: 'alert-triangle',
        meta: 'Atenção'
      });
    }
  });

  const latestIncome = monthTx.find(t => t.type === 'income');
  if (latestIncome) {
    items.push({
      id: `income-${latestIncome.id}`,
      title: `${latestIncome.category} entrou no saldo!`,
      body: `${formatCurrency(latestIncome.amount)} registrados em ${latestIncome.description}. Boa hora para separar suas prioridades.`,
      actionLabel: 'Ver no extrato',
      targetTab: 'Extrato',
      tone: 'green',
      icon: 'check-circle',
      meta: 'Receita'
    });
  }

  if (items.length === 0) {
    items.push({
      id: 'welcome-tip',
      title: 'Tudo tranquilo por aqui',
      body: 'Quando algum limite estiver próximo ou uma receita entrar, você verá alertas claros e sem complicação.',
      actionLabel: 'Ver orçamento',
      targetTab: 'Orçamento',
      tone: 'purple',
      icon: 'bell',
      meta: 'Dica'
    });
  }

  const unreadCount = items.filter(i => !readNotifications.includes(i.id)).length;
  const visibleItems = filter === 'unread' ? items.filter(i => !readNotifications.includes(i.id)) : items;

  const toneStyles = (tone: NotificationItem['tone']) => {
    switch (tone) {
      case 'amber':
        return { bg: colors.softAmber, fg: colors.warning };
      case 'red':
        return { bg: colors.softRed, fg: colors.expense };
      case 'green':
        return { bg: colors.softGreen, fg: colors.income };
      default:
        return { bg: colors.softPurple, fg: colors.primary };
    }
  };

  return (
    <Screen
      title="Notificações"
      subtitle="Um toque de atenção, sem julgamento."
      onBack={() => navigation.goBack()}
      rightAction={
        <TouchableOpacity
          onPress={() => markAllNotificationsRead(items.map(i => i.id))}
          style={styles.checkAllBtn}
        >
          <Feather name="check-square" size={16} color={colors.primary} />
        </TouchableOpacity>
      }
    >
      <View style={styles.filterRow}>
        <View style={styles.pills}>
          <TouchableOpacity
            onPress={() => setFilter('all')}
            style={[styles.pill, filter === 'all' && styles.pillActive]}
          >
            <Text style={[styles.pillText, filter === 'all' && styles.pillTextActive]}>Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('unread')}
            style={[styles.pill, filter === 'unread' && styles.pillActive]}
          >
            <Text style={[styles.pillText, filter === 'unread' && styles.pillTextActive]}>
              Não lidas • {unreadCount}
            </Text>
          </TouchableOpacity>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={() => markAllNotificationsRead(items.map(i => i.id))}>
            <Text style={styles.markReadLink}>Marcar como lidas</Text>
          </TouchableOpacity>
        )}
      </View>

      {visibleItems.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Feather name="check-circle" size={26} color={colors.income} />
          <Text style={styles.emptyTitle}>Nenhuma notificação pendente</Text>
          <Text style={styles.emptySub}>Você já visualizou todos os seus alertas.</Text>
        </Card>
      ) : (
        visibleItems.map(item => {
          const isUnread = !readNotifications.includes(item.id);
          const palette = toneStyles(item.tone);
          return (
            <Card key={item.id} style={styles.notifCard}>
              <View style={[styles.iconBox, { backgroundColor: palette.bg }]}>
                <Feather name={item.icon as any} size={17} color={palette.fg} />
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifTopRow}>
                  <Text style={styles.notifMeta}>{item.meta}</Text>
                  {isUnread && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifBody}>{item.body}</Text>
                <TouchableOpacity
                  onPress={() => {
                    markAllNotificationsRead([item.id]);
                    navigation.navigate('MainTabs', { screen: item.targetTab });
                  }}
                  style={styles.actionRow}
                >
                  <Text style={styles.actionText}>{item.actionLabel}</Text>
                  <Feather name="arrow-up-right" size={13} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </Card>
          );
        })
      )}

      <Text style={styles.footerNote}>Lembretes para ajudar você a decidir, no seu ritmo.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  checkAllBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.softPurple,
    alignItems: 'center',
    justifyContent: 'center'
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  pills: {
    flexDirection: 'row'
  },
  pill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  pillText: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
    color: colors.textSecondary
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontFamily: fonts.bold
  },
  markReadLink: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.primary
  },
  notifCard: {
    flexDirection: 'row',
    padding: 14,
    marginBottom: 10
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  notifContent: {
    flex: 1
  },
  notifTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  notifMeta: {
    fontSize: 11,
    color: colors.muted,
    fontFamily: fonts.bold,
    marginRight: 6
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary
  },
  notifTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 4
  },
  notifBody: {
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
    fontFamily: fonts.regular
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  actionText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.primary
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 26
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.text
  },
  emptySub: {
    marginTop: 4,
    fontSize: 12.5,
    color: colors.muted,
    fontFamily: fonts.regular
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 11.5,
    color: colors.muted,
    marginTop: 12,
    fontFamily: fonts.regular
  },
});
