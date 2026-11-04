import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, Fonts } from '../constants/theme';
import { ChevronMode } from '../types/workout';

interface ChevronRunwayProps {
  badgeText: string;
  mode: ChevronMode;
}

// Generate mathematical paths repeating every 48px matching Figma node 84-151
function generatePaths() {
  const pitch = 48;
  const w = 22;
  const H = 84;
  const midY = 42;
  const slant = 22;

  const leftPointing: string[] = [];
  const rightPointing: string[] = [];

  for (let i = -2; i <= 13; i++) {
    const x0 = i * pitch;
    // Left-pointing chevron (<)
    leftPointing.push(
      `M ${x0 + slant} 0 L ${x0} ${midY} L ${x0 + slant} ${H} L ${x0 + slant + w} ${H} L ${x0 + w} ${midY} L ${x0 + slant + w} 0 Z`
    );
    // Right-pointing chevron (>)
    rightPointing.push(
      `M ${x0} 0 L ${x0 + slant} ${midY} L ${x0} ${H} L ${x0 + w} ${H} L ${x0 + slant + w} ${midY} L ${x0 + w} 0 Z`
    );
  }

  return {
    leftD: leftPointing.join(' '),
    rightD: rightPointing.join(' '),
  };
}

const { leftD, rightD } = generatePaths();

export const ChevronRunway: React.FC<ChevronRunwayProps> = ({ badgeText, mode }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (mode === 'OUTWARD' || mode === 'INWARD') {
      animRef.current = Animated.loop(
        Animated.timing(animValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animRef.current.start();
    } else if (mode === 'HOLD' || mode === 'PAUSED') {
      // Freeze in place at exact moment and position
      if (animRef.current) {
        animRef.current.stop();
      }
    } else {
      if (animRef.current) animRef.current.stop();
      animValue.setValue(0);
    }
  }, [mode]);

  // Movement translations
  const leftTranslateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: mode === 'INWARD' ? [0, 48] : [0, -48],
  });

  const rightTranslateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: mode === 'INWARD' ? [0, -48] : [0, 48],
  });

  const isPaused = mode === 'PAUSED';
  const showArrows = mode !== 'NO_ARROWS' && mode !== 'PAUSED';

  // In inward mode: left points right (>), right points left (<)
  // In outward/hold mode: left points left (<), right points right (>)
  const leftPathD = mode === 'INWARD' ? rightD : leftD;
  const rightPathD = mode === 'INWARD' ? leftD : rightD;

  return (
    <View style={[styles.banner, isPaused && styles.bannerPaused]}>
      {/* Left Runway */}
      {showArrows ? (
        <View style={[styles.runwaySide, styles.runwayLeft]}>
          <Animated.View style={{ transform: [{ translateX: leftTranslateX }] }}>
            <Svg width={576} height={84} viewBox="0 0 576 84">
              <Path d={leftPathD} fill={Colors.chevronRed} />
            </Svg>
          </Animated.View>
        </View>
      ) : (
        <View style={styles.runwaySide} />
      )}

      {/* Center Badge Wrap */}
      <View style={[styles.centerWrap, isPaused && styles.centerWrapPaused]}>
        <Text style={[styles.badgeText, isPaused && styles.badgeTextPaused]}>
          {badgeText}
        </Text>
      </View>

      {/* Right Runway */}
      {showArrows ? (
        <View style={[styles.runwaySide, styles.runwayRight]}>
          <Animated.View style={{ transform: [{ translateX: rightTranslateX }] }}>
            <Svg width={576} height={84} viewBox="0 0 576 84">
              <Path d={rightPathD} fill={Colors.chevronRed} />
            </Svg>
          </Animated.View>
        </View>
      ) : (
        <View style={styles.runwaySide} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: 84,
    backgroundColor: Colors.crimsonRed,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  bannerPaused: {
    backgroundColor: Colors.pauseYellow,
  },
  runwaySide: {
    flex: 1,
    height: 84,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  runwayLeft: {
    alignItems: 'flex-end',
    marginRight: -48,
  },
  runwayRight: {
    alignItems: 'flex-start',
    marginLeft: -48,
  },
  centerWrap: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: Colors.crimsonRed,
  },
  centerWrapPaused: {
    backgroundColor: Colors.pauseYellow,
  },
  badgeText: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: Colors.white,
    textAlign: 'center',
  },
  badgeTextPaused: {
    color: Colors.textBlack,
    letterSpacing: 2.5,
  },
});
