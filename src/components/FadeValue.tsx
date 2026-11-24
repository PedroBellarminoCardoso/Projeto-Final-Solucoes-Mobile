import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleProp, TextStyle } from 'react-native';

interface FadeValueProps {
  value: string;
  masked: string;
  hidden: boolean;
  style?: StyleProp<TextStyle>;
}

const FADE_OUT_MS = 150;
const FADE_IN_MS = 220;

// Mostra o valor ou a versão mascarada, com fade-out/fade-in ao alternar `hidden`.
export function FadeValue({ value, masked, hidden, style }: FadeValueProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [shownHidden, setShownHidden] = useState(hidden);
  const previousHidden = useRef(hidden);

  useEffect(() => {
    if (previousHidden.current === hidden) return;
    previousHidden.current = hidden;

    Animated.timing(opacity, { toValue: 0, duration: FADE_OUT_MS, useNativeDriver: true }).start(({ finished }) => {
      if (!finished) return;
      setShownHidden(hidden);
      Animated.timing(opacity, { toValue: 1, duration: FADE_IN_MS, useNativeDriver: true }).start();
    });
  }, [hidden, opacity]);

  return <Animated.Text style={[style, { opacity }]}>{shownHidden ? masked : value}</Animated.Text>;
}
