import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutItem, AppSettings } from '../types/workout';

export const WORKOUT_STORAGE_KEY = 'workout_timer_saved_config';
export const SETTINGS_STORAGE_KEY = 'workout_timer_settings_v2';

export function createDefaultWorkout(id: number = 1): WorkoutItem {
  return {
    id,
    sets: 3,
    restSets: 10,
    reps: 10,
    restReps: 5,
    hold: 10,
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  volume: 80,
  language: 'en-US',
  languageLabel: 'English',
  voiceURI: 'default',
  voiceName: 'Default',
  countdownBeeps: true,
  speed: 1.0,
  countdownStyle: 'default',
  countdownStyleLabel: 'Default',
  voiceCommands: false,
  prepTime: 10,
  keepScreenAwake: true,
  delayTime: 2,
  workoutDelay: 60,
  cueToggles: {
    sets: true,
    restSets: true,
    reps: true,
    restReps: true,
    hold: true,
  },
  cueNames: {
    sets: 'Set',
    restSets: 'Rest',
    reps: 'Rep',
    restReps: 'Rest',
    hold: 'Hold',
  },
};

export async function loadWorkouts(): Promise<{ workouts: WorkoutItem[]; activeIndex: number }> {
  try {
    const raw = await AsyncStorage.getItem(WORKOUT_STORAGE_KEY);
    if (!raw) {
      return { workouts: [createDefaultWorkout(1)], activeIndex: 0 };
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.workouts) && parsed.workouts.length > 0) {
      const workouts = parsed.workouts.map((w: any, idx: number) => ({
        id: idx + 1,
        sets: Math.max(1, typeof w.sets === 'number' ? w.sets : 3),
        restSets: Math.max(0, typeof w.restSets === 'number' ? w.restSets : 10),
        reps: Math.max(1, typeof w.reps === 'number' ? w.reps : 10),
        restReps: Math.max(0, typeof w.restReps === 'number' ? w.restReps : 5),
        hold: Math.max(0, typeof w.hold === 'number' ? w.hold : 10),
      }));
      const activeIndex = typeof parsed.activeWorkoutIndex === 'number' && parsed.activeWorkoutIndex < workouts.length
        ? parsed.activeWorkoutIndex
        : 0;
      return { workouts, activeIndex };
    }
  } catch (e) {
    console.warn('Failed to load workouts from storage:', e);
  }
  return { workouts: [createDefaultWorkout(1)], activeIndex: 0 };
}

export async function saveWorkouts(workouts: WorkoutItem[], activeIndex: number): Promise<void> {
  try {
    await AsyncStorage.setItem(
      WORKOUT_STORAGE_KEY,
      JSON.stringify({
        activeWorkoutIndex: activeIndex,
        workouts,
        exerciseCount: workouts.length,
      })
    );
  } catch (e) {
    console.warn('Failed to save workouts to storage:', e);
  }
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        cueToggles: { ...DEFAULT_SETTINGS.cueToggles, ...(parsed.cueToggles || {}) },
        cueNames: { ...DEFAULT_SETTINGS.cueNames, ...(parsed.cueNames || {}) },
      };
    }
  } catch (e) {
    console.warn('Failed to load settings from storage:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to storage:', e);
  }
}
