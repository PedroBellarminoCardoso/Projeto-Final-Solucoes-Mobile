import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { FadeValue } from './FadeValue';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface ExpenseDonutProps {
  slices: DonutSlice[];
  total: number;
  hidden: boolean;
}

const SIZE = 150;
const STROKE = 24;

function formatWholeCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

export function ExpenseDonut({ slices, total, hidden }: ExpenseDonutProps) {
  const radius = (SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = slices.map(slice => {
    const share = total > 0 ? slice.value / total : 0;
    const length = share * circumference;
    const segment = {
      label: slice.label,
      color: slice.color,
      dash: `${length} ${circumference - length}`,
      offset: -offset
    };
    offset += length;
    return segment;
  });

  return (
    <View style={styles.row}>
      <View style={styles.wrapper}>
        <Svg width={SIZE} height={SIZE}>
          {segments.map(segment => (
            <Circle
              key={segment.label}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={STROKE}
              fill="none"
              strokeDasharray={segment.dash}
              strokeDashoffset={segment.offset}
              rotation={-90}
              origin={`${SIZE / 2}, ${SIZE / 2}`}
            />
          ))}
        </Svg>
        <View style={styles.center} pointerEvents="none">
          <Text style={styles.centerLabel}>Despesas</Text>
          <FadeValue
            value={formatWholeCurrency(total)}
            masked="R$ •••"
            hidden={hidden}
            style={styles.centerValue}
          />
        </View>
      </View>

      <View style={styles.legend}>
        {slices.map(slice => {
          const pct = total > 0 ? (slice.value / total) * 100 : 0;
          return (
            <View key={slice.label} style={styles.legendItem}>
              <View style={styles.legendLeft}>
                <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
                <Text style={styles.legendName} numberOfLines={1}>{slice.label}</Text>
              </View>
              <Text style={styles.legendPct}>{pct.toFixed(1).replace('.', ',')}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  wrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center'
  },
  center: {
    position: 'absolute',
    alignItems: 'center'
  },
  centerLabel: {
    fontSize: 12.5,
    color: colors.muted,
    fontFamily: fonts.regular
  },
  centerValue: {
    fontSize: 17,
    color: colors.text,
    fontFamily: fonts.regular,
    marginTop: 2
  },
  legend: {
    flex: 1,
    marginLeft: 16
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 8
  },
  legendName: {
    fontSize: 12.5,
    color: colors.textSecondary,
    fontFamily: fonts.regular
  },
  legendPct: {
    fontSize: 12.5,
    color: colors.text,
    fontFamily: fonts.regular
  }
});
