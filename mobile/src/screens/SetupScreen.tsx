import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors, Fonts, Layout } from '../constants/theme';
import { WorkoutItem } from '../types/workout';
import { createDefaultWorkout, saveWorkouts } from '../services/storage';

interface SetupScreenProps {
  workouts: WorkoutItem[];
  setWorkouts: React.Dispatch<React.SetStateAction<WorkoutItem[]>>;
  activeWorkoutIndex: number;
  setActiveWorkoutIndex: (idx: number) => void;
  onStart: () => void;
  onOpenSettings: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  workouts,
  setWorkouts,
  activeWorkoutIndex,
  setActiveWorkoutIndex,
  onStart,
  onOpenSettings,
}) => {
  const tabsScrollRef = useRef<ScrollView>(null);
  const activeWorkout = workouts[activeWorkoutIndex] || workouts[0];

  const updateParam = (key: keyof WorkoutItem, delta: number) => {
    setWorkouts((prev) => {
      const updated = [...prev];
      const cur = updated[activeWorkoutIndex];
      if (!cur) return prev;

      let min = 0;
      if (key === 'sets' || key === 'reps') min = 1;

      const currentVal = typeof cur[key] === 'number' ? (cur[key] as number) : min;
      const nextVal = Math.max(min, currentVal + delta);
      updated[activeWorkoutIndex] = { ...cur, [key]: nextVal };
      saveWorkouts(updated, activeWorkoutIndex);
      return updated;
    });
  };

  // Acceleration hold timer
  const holdTimeout = useRef<NodeJS.Timeout | null>(null);
  const holdInterval = useRef<NodeJS.Timeout | null>(null);

  const startHold = (key: keyof WorkoutItem, delta: number) => {
    updateParam(key, delta);
    holdTimeout.current = setTimeout(() => {
      holdInterval.current = setInterval(() => {
        updateParam(key, delta);
      }, 60);
    }, 320);
  };

  const stopHold = () => {
    if (holdTimeout.current) clearTimeout(holdTimeout.current);
    if (holdInterval.current) clearInterval(holdInterval.current);
    holdTimeout.current = null;
    holdInterval.current = null;
  };

  const addWorkout = () => {
    const nextId = workouts.length + 1;
    const nextWorkouts = [...workouts, createDefaultWorkout(nextId)];
    const nextIndex = nextWorkouts.length - 1;
    setWorkouts(nextWorkouts);
    setActiveWorkoutIndex(nextIndex);
    saveWorkouts(nextWorkouts, nextIndex);
    setTimeout(() => {
      tabsScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const removeOrResetWorkout = (idx: number) => {
    if (workouts.length > 1) {
      const filtered = workouts.filter((_, i) => i !== idx).map((w, i) => ({ ...w, id: i + 1 }));
      const nextIdx = Math.max(0, idx - 1);
      setWorkouts(filtered);
      setActiveWorkoutIndex(nextIdx);
      saveWorkouts(filtered, nextIdx);
    } else {
      // Single workout reset to minimums
      const reset = [{ id: 1, sets: 1, restSets: 0, reps: 1, restReps: 0, hold: 0 }];
      setWorkouts(reset);
      setActiveWorkoutIndex(0);
      saveWorkouts(reset, 0);
    }
  };

  const paramsList: Array<{ label: string; key: keyof WorkoutItem; value: number }> = [
    { label: 'SETS', key: 'sets', value: activeWorkout.sets },
    { label: 'REST BETWEEN SETS (SEC)', key: 'restSets', value: activeWorkout.restSets },
    { label: 'REPS PER SET', key: 'reps', value: activeWorkout.reps },
    { label: 'REST BETWEEN REPS (SEC)', key: 'restReps', value: activeWorkout.restReps },
    { label: 'HOLD TIME (SEC)', key: 'hold', value: activeWorkout.hold },
  ];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.voltGreen} />
      <View style={styles.container}>
        {/* Top Section: Volt Green */}
        <View style={styles.topSection}>
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>WORKOUT TIMER</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={onOpenSettings}
              activeOpacity={0.85}
            >
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={3} stroke={Colors.white} strokeWidth={2.2} />
                <Path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                  stroke={Colors.white}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Workout Tabs Bar */}
          <ScrollView
            ref={tabsScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
            style={styles.tabsBar}
          >
            {workouts.map((w, idx) => {
              const isActive = idx === activeWorkoutIndex;
              return (
                <View key={w.id} style={[styles.tab, isActive ? styles.tabActive : styles.tabInactive]}>
                  <TouchableOpacity
                    style={styles.tabTitleBtn}
                    onPress={() => setActiveWorkoutIndex(idx)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.tabText}>WORKOUT {idx + 1}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tabRemoveBtn, isActive ? styles.tabRemoveActive : styles.tabRemoveInactive]}
                    onPress={() => removeOrResetWorkout(idx)}
                    activeOpacity={0.7}
                  >
                    <Svg width={14} height={14} viewBox="0 0 16 16" fill="none">
                      <Path d="M4 4L12 12M12 4L4 12" stroke={Colors.white} strokeWidth={2.4} strokeLinecap="square" />
                    </Svg>
                  </TouchableOpacity>
                </View>
              );
            })}
            <TouchableOpacity style={styles.tabAddBtn} onPress={addWorkout} activeOpacity={0.85}>
              <Svg width={14} height={14} viewBox="0 0 16 16" fill="none">
                <Path d="M8 2.5v11M2.5 8h11" stroke={Colors.white} strokeWidth={2.2} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Parameter Cards (5 Rows) */}
        <View style={styles.paramsContainer}>
          {paramsList.map((param) => (
            <View key={param.key} style={styles.paramCard}>
              {/* Left Zone: Minus */}
              <TouchableOpacity
                style={[styles.stepperZone, styles.stepperZoneLeft]}
                onPressIn={() => startHold(param.key, -1)}
                onPressOut={stopHold}
                activeOpacity={0.85}
              >
                <View style={styles.glyphMinus} />
              </TouchableOpacity>

              {/* Center Stack */}
              <View style={styles.centerStack} pointerEvents="none">
                <Text style={styles.paramLabel}>{param.label}</Text>
                <Text style={styles.paramValue}>{param.value}</Text>
              </View>

              {/* Right Zone: Plus */}
              <TouchableOpacity
                style={[styles.stepperZone, styles.stepperZoneRight]}
                onPressIn={() => startHold(param.key, 1)}
                onPressOut={stopHold}
                activeOpacity={0.85}
              >
                <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
                  <Path d="M9 2.5v13M2.5 9h13" stroke={Colors.white} strokeWidth={2.5} strokeLinecap="square" />
                </Svg>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Bottom CTA Button */}
        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.9}>
          <Svg width={24} height={30} viewBox="0 0 24 30">
            <Path d="M0 0L24 15L0 30V0Z" fill={Colors.textBlack} />
          </Svg>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'space-between',
  },
  topSection: {
    backgroundColor: Colors.voltGreen,
  },
  header: {
    height: Layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    backgroundColor: Colors.voltGreen,
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 20,
  },
  headerTitle: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    letterSpacing: 1.2,
    color: Colors.textBlack,
    textTransform: 'uppercase',
  },
  settingsBtn: {
    width: 94,
    height: '100%',
    backgroundColor: Colors.headerRed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsBar: {
    height: Layout.tabsBarHeight,
    backgroundColor: Colors.voltGreen,
  },
  tabsContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  tab: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tabActive: {
    backgroundColor: Colors.crimsonRed,
  },
  tabInactive: {
    backgroundColor: Colors.bg,
  },
  tabTitleBtn: {
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 16,
    paddingRight: 10,
  },
  tabText: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    letterSpacing: 1.2,
    color: Colors.white,
    textTransform: 'uppercase',
  },
  tabRemoveBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabRemoveActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0, 0, 0, 0.2)',
  },
  tabRemoveInactive: {
    backgroundColor: '#1B1B1F',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabAddBtn: {
    width: 40,
    height: 40,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paramsContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  paramCard: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDark,
    flexDirection: 'row',
    alignItems: 'stretch',
    position: 'relative',
  },
  stepperZone: {
    flex: 1,
    justifyContent: 'center',
  },
  stepperZoneLeft: {
    alignItems: 'flex-start',
    paddingLeft: 24,
  },
  stepperZoneRight: {
    alignItems: 'flex-end',
    paddingRight: 24,
  },
  glyphMinus: {
    width: 16,
    height: 2.5,
    backgroundColor: Colors.white,
    borderRadius: 1,
  },
  centerStack: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  paramLabel: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    letterSpacing: 1.0,
    color: Colors.textGrey,
    textTransform: 'uppercase',
  },
  paramValue: {
    fontFamily: Fonts.heading,
    fontSize: 36,
    letterSpacing: 0.5,
    color: Colors.white,
  },
  startBtn: {
    width: '100%',
    height: Layout.headerHeight,
    backgroundColor: Colors.voltGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
