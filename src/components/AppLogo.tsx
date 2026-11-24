import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme/colors';

interface AppLogoProps {
  size?: number;
}


export function AppLogo({ size = 50 }: AppLogoProps) {
  const radius = Math.round(size * 0.24);

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: radius }]}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Rect x={0} y={0} width={120} height={120} rx={28} fill={colors.primary} />
        <Circle cx={28} cy={22} r={54} fill={colors.primaryLight} fillOpacity={0.3} />

        <Path
          d="M 22 27 A 10 10 0 0 1 32 17 L 68 17 A 10 10 0 0 1 78 27 L 78 31 A 1.5 1.5 0 0 1 76.5 32.5 L 72 32.5 A 1.5 1.5 0 0 1 70.5 31 L 70.5 27.5 A 2.5 2.5 0 0 0 68 25 L 32 25 A 2.5 2.5 0 0 0 29.5 27.5 L 29.5 82.5 A 2.5 2.5 0 0 0 32 85 L 76.5 85 A 1.5 1.5 0 0 1 78 86.5 L 78 93 A 10 10 0 0 1 68 103 L 32 103 A 10 10 0 0 1 22 93 Z"
          fill="#FFFFFF"
        />
        <Circle cx={50} cy={94} r={5.4} fill={colors.primary} />

        <Circle cx={76} cy={58.5} r={19.5} fill="none" stroke="#FFFFFF" strokeWidth={4.2} />
        <Path
          d="M 71 53.8 C 71 50.1 73.2 48.1 76.2 48.1 C 79.4 48.1 81.5 50.2 81.5 53.1 C 81.5 55.8 79.2 57.1 77.4 58.4 C 76.4 59.1 76 59.9 76 61.8"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={3.5}
          strokeLinecap="round"
        />
        <Circle cx={76} cy={68.1} r={2.2} fill="#FFFFFF" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
