import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts, Anton_400Regular } from '@expo-google-fonts/anton';
import {
  Onest_400Regular,
  Onest_500Medium,
  Onest_700Bold,
} from '@expo-google-fonts/onest';
import { SetupScreen } from './src/screens/SetupScreen';
import { TimerScreen } from './src/screens/TimerScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { WorkoutItem, AppSettings } from './src/types/workout';
import {
  loadWorkouts,
  loadSettings,
  createDefaultWorkout,
  DEFAULT_SETTINGS,
} from './src/services/storage';
import { Colors } from './src/constants/theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    Anton_400Regular,
    Onest_400Regular,
    Onest_500Medium,
    Onest_700Bold,
  });

  const [currentScreen, setCurrentScreen] = useState<'setup' | 'timer' | 'settings'>('setup');
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([createDefaultWorkout(1)]);
  const [activeWorkoutIndex, setActiveWorkoutIndex] = useState(0);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      const storedWorkouts = await loadWorkouts();
      const storedSettings = await loadSettings();
      setWorkouts(storedWorkouts.workouts);
      setActiveWorkoutIndex(storedWorkouts.activeIndex);
      setSettings(storedSettings);
      setIsDataLoaded(true);
    }
    init();
  }, []);

  if (!fontsLoaded || !isDataLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.voltGreen} />
      </View>
    );
  }

  if (currentScreen === 'timer') {
    return (
      <TimerScreen
        workouts={workouts}
        settings={settings}
        onExit={() => setCurrentScreen('setup')}
      />
    );
  }

  if (currentScreen === 'settings') {
    return (
      <SettingsScreen
        settings={settings}
        setSettings={setSettings}
        onClose={() => setCurrentScreen('setup')}
      />
    );
  }

  return (
    <SetupScreen
      workouts={workouts}
      setWorkouts={setWorkouts}
      activeWorkoutIndex={activeWorkoutIndex}
      setActiveWorkoutIndex={setActiveWorkoutIndex}
      onStart={() => setCurrentScreen('timer')}
      onOpenSettings={() => setCurrentScreen('settings')}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
