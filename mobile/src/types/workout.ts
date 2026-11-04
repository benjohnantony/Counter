export interface WorkoutItem {
  id: number;
  sets: number;      // min: 1, default: 3
  restSets: number;  // min: 0, default: 10
  reps: number;      // min: 1, default: 10
  restReps: number;  // min: 0, default: 5
  hold: number;      // min: 0, default: 10
}

export interface AppSettings {
  soundEnabled: boolean;
  volume: number;
  language: string;
  languageLabel: string;
  voiceURI: string;
  voiceName: string;
  countdownBeeps: boolean;
  speed: number;
  countdownStyle: string;
  countdownStyleLabel: string;
  voiceCommands: boolean;
  prepTime: number;
  keepScreenAwake: boolean;
  delayTime: number;
  workoutDelay: number;
  cueToggles: {
    sets: boolean;
    restSets: boolean;
    reps: boolean;
    restReps: boolean;
    hold: boolean;
  };
  cueNames: {
    sets: string;
    restSets: string;
    reps: string;
    restReps: string;
    hold: string;
  };
}

export type TimerPhase =
  | 'PREPARATION'
  | 'WORKOUT_DELAY'
  | 'PRE_REP_DELAY'
  | 'HOLD'
  | 'REST_REPS'
  | 'REST_SETS'
  | 'COMPLETE';

export type ChevronMode =
  | 'OUTWARD'    // GO!
  | 'HOLD'       // HOLD (frozen in position)
  | 'INWARD'     // REST / SET REST
  | 'PAUSED'     // Yellow, text only, no arrows
  | 'NO_ARROWS'; // PREPARATION / COMPLETE
