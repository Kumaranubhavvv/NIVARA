import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

/**
 * Hook for smooth fade-in and slide-up entrance animation.
 * @param {number} delay Delay in milliseconds
 * @param {number} distance Distance in pixels to slide up (default: 20)
 * @param {number} duration Duration in milliseconds (default: 600)
 */
export function useFadeSlideIn(delay = 0, distance = 20, duration = 600) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: false,
    }).start();
  }, []);

  const opacity = animValue;
  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [distance, 0],
  });

  return {
    opacity,
    transform: [{ translateY }],
  };
}

/**
 * Hook for gentle floating / breathing levitation animation.
 * Ideal for showcase cards, badges, and avatars.
 */
export function useFloatingAnimation(distance = 8, duration = 2800) {
  const floatValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatValue, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: false,
        }),
        Animated.timing(floatValue, {
          toValue: 0,
          duration: duration / 2,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [distance, duration]);

  const translateY = floatValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -distance],
  });

  return {
    transform: [{ translateY }],
  };
}

/**
 * Hook for pulsing live radar beacon (status dots, SOS buttons).
 */
export function usePulseAnimation(minScale = 0.94, maxScale = 1.08, duration = 1600) {
  const pulseValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: false,
        }),
        Animated.timing(pulseValue, {
          toValue: 0,
          duration: duration / 2,
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [minScale, maxScale, duration]);

  const scale = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [minScale, maxScale],
  });

  const opacity = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  return {
    transform: [{ scale }],
    opacity,
  };
}
