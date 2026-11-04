import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Image,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useKeepAwake } from 'expo-keep-awake';
import { Colors, Fonts, Layout } from '../constants/theme';
import { WorkoutItem, AppSettings, ChevronMode } from '../types/workout';
import { ChevronRunway } from '../components/ChevronRunway';
import { speakCue, stopSpeaking } from '../services/audio';

interface TimerScreenProps {
  workouts: WorkoutItem[];
  settings: AppSettings;
  onExit: () => void;
}

export const TimerScreen: React.FC<TimerScreenProps> = ({ workouts, settings, onExit }) => {
  // Keep screen awake while active
  if (settings.keepScreenAwake) {
    useKeepAwake();
  }

  // State
  const [workoutIdx, setWorkoutIdx] = useState(0);
  const [setNum, setSetNum] = useState(1);
  const [repNum, setRepNum] = useState(1);
  const [phase, setPhase] = useState<'PREP' | 'GO' | 'HOLD' | 'REST_REP' | 'REST_SET' | 'WORKOUT_DELAY' | 'COMPLETE'>('PREP');
  const [secondsLeft, setSecondsLeft] = useState(settings.prepTime || 10);
  const [totalSeconds, setTotalSeconds] = useState(settings.prepTime || 10);
  const [isRunning, setIsRunning] = useState(true);
  const [elapsedClock, setElapsedClock] = useState(0);

  // Modals
  const [isPausedModalVisible, setIsPausedModalVisible] = useState(false);
  const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);

  const curWorkout = workouts[workoutIdx] || workouts[0];

  // Elapsed Clock Timer
  useEffect(() => {
    if (!isRunning || phase === 'COMPLETE') return;
    const interval = setInterval(() => {
      setElapsedClock((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, phase]);

  // Main Phase Countdown Loop
  useEffect(() => {
    if (!isRunning || phase === 'COMPLETE') return;

    if (secondsLeft <= 0) {
      handlePhaseTransition();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, secondsLeft, phase]);

  const handlePhaseTransition = () => {
    if (phase === 'PREP') {
      // Transition from Preparation to first Rep
      startRep();
    } else if (phase === 'GO') {
      // Go delay finishes -> start HOLD
      const holdTime = curWorkout.hold;
      setPhase('HOLD');
      setSecondsLeft(holdTime);
      setTotalSeconds(holdTime);
      speakCue(settings.cueNames.hold || 'Hold', settings);
    } else if (phase === 'HOLD') {
      // Hold finishes -> check rest or next rep
      if (repNum < curWorkout.reps) {
        // Rest between reps
        const rest = curWorkout.restReps;
        if (rest > 0) {
          setPhase('REST_REP');
          setSecondsLeft(rest);
          setTotalSeconds(rest);
          speakCue(settings.cueNames.restReps || 'Rest', settings);
        } else {
          // Zero rest: skip directly to next rep
          setRepNum((r) => r + 1);
          startRep();
        }
      } else {
        // All reps of this set finished -> Set Rest
        if (setNum < curWorkout.sets) {
          const restSets = curWorkout.restSets;
          if (restSets > 0) {
            setPhase('REST_SET');
            setSecondsLeft(restSets);
            setTotalSeconds(restSets);
            speakCue(`Set ${setNum} complete. ${settings.cueNames.restSets || 'Rest'}`, settings);
          } else {
            // Zero rest between sets
            setSetNum((s) => s + 1);
            setRepNum(1);
            speakCue(`Set ${setNum} complete`, settings);
            startRep();
          }
        } else {
          // All sets finished -> check next workout
          if (workoutIdx < workouts.length - 1) {
            const wDelay = settings.workoutDelay || 60;
            setWorkoutIdx((w) => w + 1);
            setSetNum(1);
            setRepNum(1);
            setPhase('WORKOUT_DELAY');
            setSecondsLeft(wDelay);
            setTotalSeconds(wDelay);
            speakCue(`Workout ${workoutIdx + 1} complete. Rest before next workout`, settings);
          } else {
            // ALL WORKOUTS COMPLETE
            setPhase('COMPLETE');
            setIsRunning(false);
            setIsCompleteModalVisible(true);
            speakCue('Great workout! You crushed it!', settings);
          }
        }
      }
    } else if (phase === 'REST_REP') {
      setRepNum((r) => r + 1);
      startRep();
    } else if (phase === 'REST_SET') {
      setSetNum((s) => s + 1);
      setRepNum(1);
      startRep();
    } else if (phase === 'WORKOUT_DELAY') {
      startRep();
    }
  };

  const startRep = () => {
    const delay = settings.delayTime || 2;
    if (delay > 0) {
      setPhase('GO');
      setSecondsLeft(delay);
      setTotalSeconds(delay);
      speakCue('GO!', settings);
    } else {
      const holdTime = curWorkout.hold;
      setPhase('HOLD');
      setSecondsLeft(holdTime);
      setTotalSeconds(holdTime);
      speakCue(settings.cueNames.hold || 'Hold', settings);
    }
  };

  const resetCurrentRep = () => {
    startRep();
  };

  const togglePause = () => {
    setIsRunning((prev) => !prev);
  };

  const handleStopPress = () => {
    setIsRunning(false);
    setIsPausedModalVisible(true);
    speakCue('Workout paused', settings);
  };

  // Determine Badge Text & Chevron Mode
  let badgeText = 'GO!';
  let chevronMode: ChevronMode = 'OUTWARD';

  if (!isRunning && phase !== 'COMPLETE') {
    badgeText = 'PAUSED';
    chevronMode = 'PAUSED';
  } else if (phase === 'PREP') {
    badgeText = 'PREPARATION';
    chevronMode = 'NO_ARROWS';
  } else if (phase === 'COMPLETE') {
    badgeText = 'COMPLETE!';
    chevronMode = 'NO_ARROWS';
  } else if (phase === 'REST_REP') {
    badgeText = (settings.cueNames.restReps || 'REST').toUpperCase();
    chevronMode = 'INWARD';
  } else if (phase === 'REST_SET' || phase === 'WORKOUT_DELAY') {
    badgeText = ('SET ' + (settings.cueNames.restSets || 'REST')).toUpperCase();
    chevronMode = 'INWARD';
  } else if (phase === 'HOLD') {
    badgeText = (settings.cueNames.hold || 'HOLD').toUpperCase();
    chevronMode = 'HOLD';
  } else {
    // GO!
    badgeText = 'GO!';
    chevronMode = 'OUTWARD';
  }

  // Format Helpers
  const formatTime = (secs: number) => {
    const safe = Math.max(0, secs);
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return `00:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatElapsed = (secs: number) => {
    const safe = Math.max(0, secs);
    const h = Math.floor(safe / 3600);
    const m = Math.floor((safe % 3600) / 60);
    const s = safe % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Liquid Progress Fill Fraction (0% to 100%)
  const isResting = phase === 'REST_REP' || phase === 'REST_SET' || phase === 'WORKOUT_DELAY';
  let fillFraction = 0;
  if (totalSeconds > 0) {
    if (phase === 'HOLD') {
      fillFraction = (totalSeconds - secondsLeft) / totalSeconds; // Fills upward
    } else if (isResting) {
      fillFraction = secondsLeft / totalSeconds; // Drains downward
    }
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <View style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.header}>
          <View style={styles.clockWrap}>
            <Text style={styles.clockText}>{formatElapsed(elapsedClock)}</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={handleStopPress} activeOpacity={0.85}>
            <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <Path d="M4 4L16 16M16 4L4 16" stroke={Colors.white} strokeWidth={2.4} strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Hero Stage (Volt Green or Rest Yellow) */}
        <View style={[styles.stage, isResting && styles.stageResting]}>
          {/* Liquid Progress Overlay (Fills upward on Hold, drains downward on Rest) */}
          <View
            style={[
              styles.liquidOverlay,
              {
                height: `${Math.round(fillFraction * 100)}%`,
              },
            ]}
          />

          {/* Pinned Top Metrics Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricCol}>
              <Text style={styles.metricVal}>WRT {workoutIdx + 1}</Text>
              <Text style={styles.metricTotal}>OF {workouts.length}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCol}>
              <Text style={styles.metricVal}>SET {setNum}</Text>
              <Text style={styles.metricTotal}>OF {curWorkout.sets}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCol}>
              <Text style={styles.metricVal}>REP {repNum}</Text>
              <Text style={styles.metricTotal}>OF {curWorkout.reps}</Text>
            </View>
          </View>

          {/* Giant Countdown Digits (Centered at true geometric 50% X/Y center) */}
          <View style={styles.timerCenterWrap} pointerEvents="none">
            <Text style={styles.timerDigits}>{formatTime(secondsLeft)}</Text>
          </View>
        </View>

        {/* Red Command Action Runway Bar */}
        <ChevronRunway badgeText={badgeText} mode={chevronMode} />

        {/* Bottom Controls (3 Equal Columns) */}
        <View style={styles.controls}>
          {/* Reset Current Rep */}
          <TouchableOpacity style={styles.ctrlBtn} onPress={resetCurrentRep} activeOpacity={0.85}>
            <Svg width={28} height={18} viewBox="0 0 32 18" fill="none">
              <Path
                d="M6 1V5H22C25.3 5 28 7.7 28 11C28 14.3 25.3 17 22 17H4 M8 9L3 5L8 1"
                stroke={Colors.white}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          {/* Center Play/Pause in Volt Green */}
          <TouchableOpacity style={[styles.ctrlBtn, styles.ctrlPlayBtn]} onPress={togglePause} activeOpacity={0.9}>
            {isRunning ? (
              <Svg width={24} height={30} viewBox="0 0 24 30">
                <Rect x={2} y={2} width={7} height={26} fill={Colors.textBlack} />
                <Rect x={15} y={2} width={7} height={26} fill={Colors.textBlack} />
              </Svg>
            ) : (
              <Svg width={24} height={30} viewBox="0 0 24 30">
                <Path d="M2 2L22 15L2 28V2Z" fill={Colors.textBlack} />
              </Svg>
            )}
          </TouchableOpacity>

          {/* Stop in Black with Red Square */}
          <TouchableOpacity style={styles.ctrlBtn} onPress={handleStopPress} activeOpacity={0.85}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Rect x={0} y={0} width={24} height={24} fill={Colors.stopRed} />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* PAUSE MODAL */}
        <Modal visible={isPausedModalVisible} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Image
                source={require('../../assets/illustrations/ill_stopwatch.png')}
                style={styles.modalIll}
                resizeMode="contain"
              />
              <Text style={styles.modalTitle}>WORKOUT PAUSED</Text>
              <Text style={styles.modalSubtitle}>Take a breather or resume when you're ready.</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnRestart]}
                  onPress={() => {
                    setIsPausedModalVisible(false);
                    setSetNum(1);
                    setRepNum(1);
                    startRep();
                    setIsRunning(true);
                  }}
                >
                  <Text style={styles.modalBtnTextWhite}>RESTART</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnResume]}
                  onPress={() => {
                    setIsPausedModalVisible(false);
                    setIsRunning(true);
                  }}
                >
                  <Text style={styles.modalBtnTextBlack}>RESUME</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* COMPLETE MODAL */}
        <Modal visible={isCompleteModalVisible} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Image
                source={require('../../assets/illustrations/ill_trophy.png')}
                style={styles.modalIll}
                resizeMode="contain"
              />
              <Text style={styles.modalTitle}>GREAT WORKOUT!</Text>
              <Text style={styles.modalSubtitle}>You've successfully crushed your routine.</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnRestart]}
                  onPress={() => {
                    setIsCompleteModalVisible(false);
                    setWorkoutIdx(0);
                    setSetNum(1);
                    setRepNum(1);
                    setElapsedClock(0);
                    startRep();
                    setIsRunning(true);
                  }}
                >
                  <Text style={styles.modalBtnTextWhite}>RESTART</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnHome]}
                  onPress={onExit}
                >
                  <Text style={styles.modalBtnTextBlack}>HOME</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  header: {
    height: Layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    backgroundColor: Colors.bg,
  },
  clockWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 20,
  },
  clockText: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    letterSpacing: 1.2,
    color: Colors.white,
  },
  closeBtn: {
    width: 93,
    height: '100%',
    backgroundColor: Colors.headerRed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stage: {
    flex: 1,
    backgroundColor: Colors.voltGreen,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageResting: {
    backgroundColor: Colors.restYellow,
  },
  liquidOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlayFill,
    zIndex: 1,
  },
  metricsBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Layout.metricsBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
    paddingHorizontal: 8,
  },
  metricCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
  },
  metricDivider: {
    width: 1.5,
    height: 30,
    backgroundColor: Colors.metricDivider,
  },
  metricVal: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    letterSpacing: 1.2,
    color: Colors.textBlack,
    textTransform: 'uppercase',
  },
  metricTotal: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    letterSpacing: 1.2,
    color: Colors.metricMuted,
    textTransform: 'uppercase',
  },
  timerCenterWrap: {
    zIndex: 3,
  },
  timerDigits: {
    fontFamily: Fonts.heading,
    fontSize: 84,
    letterSpacing: 1.0,
    color: Colors.textBlack,
    textAlign: 'center',
  },
  controls: {
    height: Layout.controlsHeight,
    flexDirection: 'row',
    backgroundColor: Colors.bg,
  },
  ctrlBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
  },
  ctrlPlayBtn: {
    backgroundColor: Colors.voltGreen,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    paddingTop: 24,
  },
  modalIll: {
    width: 180,
    height: 150,
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    letterSpacing: 1.2,
    color: Colors.white,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 30,
  },
  modalActions: {
    width: '100%',
    height: Layout.controlsHeight,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  modalBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnRestart: {
    backgroundColor: Colors.bg,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.15)',
  },
  modalBtnResume: {
    backgroundColor: Colors.voltGreen,
  },
  modalBtnHome: {
    backgroundColor: Colors.voltGreen,
  },
  modalBtnTextWhite: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    letterSpacing: 1.2,
    color: Colors.white,
    textTransform: 'uppercase',
  },
  modalBtnTextBlack: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    letterSpacing: 1.2,
    color: Colors.textBlack,
    textTransform: 'uppercase',
  },
});
