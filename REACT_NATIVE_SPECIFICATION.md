# Workout Timer — Complete React Native (Expo) Master Specification

> **Source Version:** Figma Workout Timer v2 (Nodes: `59:2387`, `84:151`, `56:2194`, `77:49`)  
> **Target Framework:** React Native with Expo (TypeScript recommended)  
> **Design Style:** High-Contrast Athletic Brutalist (Solid color-blocking, 0px border-radius, pure black/volt green/crimson red, bold condensed typography)

---

## Table of Contents
1. [Core Design Tokens (Colors, Typography, Layout, Radii)](#1-core-design-tokens)
2. [Screen 1: Workout Setup & Configuration (`index.html`)](#2-screen-1-workout-setup--configuration)
3. [Screen 2: Active Workout Execution (`timer.html`)](#3-screen-2-active-workout-execution)
4. [Screen 3: Settings & Audio Architecture (`settings.html`)](#4-screen-3-settings--audio-architecture)
5. [The Chevron Action Runway Engine (Exact Geometry & 5 Modes)](#5-the-chevron-action-runway-engine)
6. [Timer Engine, State Machine & Edge Cases](#6-timer-engine-state-machine--edge-cases)
7. [Sound Synthesis, Voice Engine & Wake Lock](#7-sound-synthesis-voice-engine--wake-lock)
8. [Data Models & Persistence Schema](#8-data-models--persistence-schema)
9. [React Native & Expo Implementation Guide](#9-react-native--expo-implementation-guide)

---

## 1. Core Design Tokens

### 1.1 Color Palette
| Token Name | HEX / RGBA Value | Context & Usage |
| :--- | :--- | :--- |
| `COLOR_BG` | `#000000` | Pure Black baseline background for all screens, headers, controls, and parameter cards |
| `COLOR_VOLT_GREEN` | `#99FF44` | Neon Volt Green: Home header background, home tabs bar background, start CTA button, active timer HOLD stage, play/pause center button, modal primary action |
| `COLOR_CRIMSON_RED` | `#F13629` | Athletic Crimson Red: Active tab fill, red command bar background in timer, parameter reset buttons |
| `COLOR_HEADER_RED` | `#F1372A` | Settings entry button on home, close (`✕`) button on timer header |
| `COLOR_STOP_RED` | `#FF003B` | Stop icon fill on active timer controls and modal stop buttons |
| `COLOR_REST_YELLOW` | `#FFE600` | Vibrant Rest Yellow: Stage background during rest intervals |
| `COLOR_PAUSE_YELLOW` | `#FFD000` | Athletic Pause Yellow: Red command bar background when workout is paused |
| `COLOR_WHITE` | `#FFFFFF` | Primary text on black/red, stepper glyphs, close icons, clock digits |
| `COLOR_TEXT_BLACK` | `#000000` | Text on Volt Green / Rest Yellow / Pause Yellow backgrounds, timer countdown digits, primary metric numbers |
| `COLOR_TEXT_GREY` | `#9E9E9F` | Secondary parameter card labels (`SETS`, `HOLD TIME (SEC)`), modal subtitles |
| `COLOR_MUTED_GREY` | `#727287` | Inactive tab text, breadcrumbs, slider track borders |
| `COLOR_BORDER_DARK` | `#1B1B1F` | 1px horizontal borders separating parameter cards on the setup screen |
| `COLOR_CARD_BORDER` | `rgba(255, 255, 255, 0.30)` | 30% dashed white border for settings cards |
| `COLOR_OVERLAY_FILL` | `rgba(0, 0, 0, 0.20)` | 20% Black liquid progress overlay filling upward during hold and draining during rest |
| `COLOR_METRIC_DIVIDER`| `rgba(0, 0, 0, 0.22)` | 1.5px vertical dividers in the 3-column top metrics strip |
| `COLOR_METRIC_MUTED` | `rgba(0, 0, 0, 0.75)` | High-contrast secondary totals in the metrics bar (`OF 3`, `OF 10`) |
| `COLOR_CHEVRON_RED` | `rgba(255, 255, 255, 0.28)` | Solid chevron ribbons on red background (renders precisely as `#F45E54`) |
| `COLOR_CHEVRON_PAUSE`| `rgba(0, 0, 0, 0.28)` | Solid chevron ribbons on yellow paused background (renders as subtle dark bands) |

### 1.2 Typography
* **Heading Font:** `Anton, sans-serif` (Google Font: Anton 400). Used for all headlines, clock displays, parameter values, button titles, and command badges. Ultra-condensed athletic display style.
* **Body Font:** `Onest, sans-serif` (Google Font: Onest 400, 500, 600, 700). Used for parameter labels, settings descriptions, modal body text, and breadcrumbs. Clean geometric sans-serif.

#### React Native Typography Mapping:
```typescript
export const Typography = {
  headerClock: {
    fontFamily: 'Anton',
    fontSize: 24,
    letterSpacing: 1.2,
    color: '#FFFFFF',
  },
  setupTitle: {
    fontFamily: 'Anton',
    fontSize: 24,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#000000',
  },
  tabTitle: {
    fontFamily: 'Anton',
    fontSize: 15,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  paramLabel: {
    fontFamily: 'Anton',
    fontSize: 13,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
    color: '#9E9E9F',
  },
  paramValue: {
    fontFamily: 'Anton',
    fontSize: 36,
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  metricVal: {
    fontFamily: 'Anton',
    fontSize: 22,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#000000',
  },
  metricTotal: {
    fontFamily: 'Anton',
    fontSize: 17,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(0, 0, 0, 0.75)',
  },
  timerDigits: {
    fontFamily: 'Anton',
    fontSize: 84,
    letterSpacing: 1.0,
    color: '#000000',
  },
  commandBadge: {
    fontFamily: 'Anton',
    fontSize: 24,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  modalTitle: {
    fontFamily: 'Anton',
    fontSize: 24,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontFamily: 'Onest-Medium',
    fontSize: 13,
    lineHeight: 18,
    color: '#9E9E9E',
  },
};
```

### 1.3 Canvas Dimensions & Rules
* **Mobile Baseline:** `375px × 812px` (iPhone baseline) or `375px × 833px` (Android baseline).
* **Max Container Width:** `440px` (centered with letterboxing on larger tablets/foldables).
* **Border Radii:** Strictly `0px` (`--r-none: 0px`). No rounded corners on buttons, cards, headers, or modal action bars.
* **Scrollbars:** Completely hidden (`scrollbar-width: none;`).
* **Haptics:** Selection and impact feedback on button taps and stepper increments.

---

## 2. Screen 1: Workout Setup & Configuration

### 2.1 Layout Breakdown
1. **Top Section (`#99FF44` Volt Green)**
   - **Header Bar (`83px` height):**
     - Left text: `WORKOUT TIMER` (`#000000`, Anton, 24px).
     - Right button (`94px` width, `83px` height, `#F1372A` red background): Settings gear icon (stroke `#FFFFFF`, strokeWidth 2.2).
   - **Workout Tabs Bar (`84px` height, `#99FF44` background):**
     - Horizontal scrolling strip with `12px` gap.
     - **Add Tab Button (`+`):** `40px × 40px` solid black square, white plus icon (`stroke-width: 2.2`). Tapping creates a new workout tab and smoothly scrolls the tabs bar to the end.
     - **Active Tab:** Height `40px`, background `#F13629` Crimson Red, title `WORKOUT X` (Anton, 15px, `#FFFFFF`).
       - Embedded dismiss square button (`40px × 40px`, background `rgba(0, 0, 0, 0.35)`, border-left `1px solid rgba(0, 0, 0, 0.2)`): White `✕` icon.
       - **Dismiss/Reset Behavior:**
         - If multiple workouts exist: deletes the current workout tab, decrements remaining workout numbers, and focuses the previous tab.
         - If only 1 workout exists: resets parameters to absolute minimums: `Sets: 1`, `Reps: 1`, `Rest Sets: 0`, `Rest Reps: 0`, `Hold: 0`.
     - **Inactive Tab:** Height `40px`, background `#000000` solid black, title `WORKOUT X` (Anton, 15px, `#FFFFFF`), embedded `✕` button (`#1B1B1F` background, border-left `1px solid rgba(255, 255, 255, 0.15)`).

2. **Parameter Cards (Center Area, Flex 1, Solid Black `#000000`)**
   - 5 equal vertical full-width rows divided by `1px solid #1B1B1F`.
   - Each row features a **Dual-Zone Touch Stepper**:
     - **Left 50% Touch Zone:** Decrements parameter (`-`). Displays a crisp white minus bar (`16px × 2.5px`).
     - **Right 50% Touch Zone:** Increments parameter (`+`). Displays a crisp white plus cross (`16px × 16px`, strokeWidth 2.5).
     - **Center Text Stack:**
       - Label: Anton, 13px, uppercase, `#9E9E9F` (e.g. `SETS`, `REST BETWEEN SETS (SEC)`).
       - Value: Anton, 36px, tabular-nums, `#FFFFFF`.
   - **Stepper Press-and-Hold Acceleration:**
     - Single tap: triggers 1 step immediately.
     - Held for > `320ms`: accelerates rapidly at `60ms` per step until released.

#### 5 Core Parameters & Default Values:
| Parameter | UI Label | Target Key | Default | Min | Max |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1. Sets | `SETS` | `sets` | **3** | **1** | **∞** |
| 2. Rest Between Sets | `REST BETWEEN SETS (SEC)` | `restSets` | **10** | **0** | **∞** |
| 3. Reps Per Set | `REPS PER SET` | `reps` | **10** | **1** | **∞** |
| 4. Rest Between Reps | `REST BETWEEN REPS (SEC)` | `restReps` | **5** | **0** | **∞** |
| 5. Hold Time | `HOLD TIME (SEC)` | `hold` | **10** | **0** | **∞** |

3. **Bottom CTA Button (`83px` height, `#99FF44` Volt Green)**
   - Full-width button at the screen base.
   - Icon: Solid black play triangle (`24px × 30px`, `fill: #000000`, `polygon points: 0 0, 24 15, 0 30`).
   - Tapping launches the active timer screen (`timer.html`).

---

## 3. Screen 2: Active Workout Execution

### 3.1 Layout Architecture
```
┌──────────────────────────────────────────────┐
│ TOP HEADER (83px, #000000)                   │
│ 00:00:00 (Elapsed)               [ ✕ Red Sq ]│
├──────────────────────────────────────────────┤
│ HERO GREEN STAGE (Flex 1, #99FF44 / #FFE600) │
│ ┌──────────────────────────────────────────┐ │
│ │ 3-COLUMN METRICS (54px, Transparent)     │ │
│ │ WRT 1 OF 3  |  SET 2 OF 3  |  REP 2 OF 10 │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│                  00:00:10                    │
│           (Giant Countdown Digits)           │
│                                              │
│ [ 20% Black Liquid Overlay Fills / Drains ]  │
├──────────────────────────────────────────────┤
│ RED COMMAND ACTION RUNWAY (84px, #F13629)    │
│ <<<<<<<<<<<<      [ GO! ]       >>>>>>>>>>>> │
├──────────────────────────────────────────────┤
│ BOTTOM CONTROLS (83px, #000000)              │
│ [  ↺ Reset  ]  [   ❚❚ Volt Play   ]  [ ■ Stop]│
└──────────────────────────────────────────────┘
```

### 3.2 Top Header (`83px` height, `#000000` Black)
* **Left Elapsed Clock:** `workout-clock` displays total cumulative time formatted as `HH:MM:SS` or `MM:SS` in Anton 24px white. Ticks every second while the workout is active.
* **Right Close Button (`93px` width, `83px` height, `#F1372A` Red):**
  * Solid red block flush to the top-right corner.
  * White `✕` icon (`width: 20px, height: 20px, stroke: #FFFFFF, strokeWidth: 2.4`).
  * Tapping pauses the workout and opens the confirmation modal.

### 3.3 Hero Green Stage (Flex 1)
* **Background Color:**
  * During **HOLD / Active Rep / Prep**: `#99FF44` (Neon Volt Green).
  * During **REST / Set Rest**: `#FFE600` (Vibrant Athletic Yellow).
* **Liquid Progress Fill Overlay (`stage-progress-overlay`):**
  * Color: `rgba(0, 0, 0, 0.20)` (20% black).
  * **During HOLD (0% → 100%):** Starts completely empty at the bottom and fills upward toward 100% as the hold seconds tick down.
  * **During REST (100% → 0%):** Starts completely full and drains downward toward 0% as the rest seconds tick down.
* **Top Unified 3-Column Metrics Bar (`52px – 64px` height):**
  * Transparent background, no bottom border.
  * 3 equal columns:
    1. **Workout Column:** `WRT X OF Y` (e.g. `WRT 1` in Anton 22px `#000000` with 1.2px letter-spacing, `OF 3` in Anton 17px `rgba(0, 0, 0, 0.75)` with 1.2px letter-spacing).
    2. **Divider 1:** `1.5px` width, `30px` height, `rgba(0, 0, 0, 0.22)`.
    3. **Set Column:** `SET X OF Y` (e.g. `SET 2` in `#000000`, `OF 3` in `rgba(0, 0, 0, 0.75)`).
    4. **Divider 2:** `1.5px` width, `30px` height, `rgba(0, 0, 0, 0.22)`.
    5. **Rep Column:** `REP X OF Y` (e.g. `REP 2` in `#000000`, `OF 10` in `rgba(0, 0, 0, 0.75)`).
  * Pop animation (`scale: 1.2 -> 1.0` over 180ms) triggers whenever a rep completes.
* **Giant Countdown Digits (`stage-timer-digits`):**
  * Anton, 84px – 100px, `#000000`, tabular-nums, line-height 1.
  * Displays remaining seconds formatted as `00:00:SS` or `00:MM:SS`.

### 3.4 Red Command Action Runway (`84px` height)
* Full detailed specification given in [Section 5](#5-the-chevron-action-runway-engine).

### 3.5 Bottom Controls (`83px` height, `#000000` Black)
* 3 equal columns (`1fr 1fr 1fr`):
  1. **Reset Button (Left):** Solid black background. White loop icon (`M6 1V5H22C25.3 5 28 7.7 28 11C28 14.3 25.3 17 22 17H4 M8 9L3 5L8 1`, strokeWidth 2.5). Tapping restarts the current rep from the beginning.
  2. **Play / Pause Button (Center):** Full **Neon Volt Green (`#99FF44`)** background.
     * When running: Bold black pause bars (`rect x=2 y=2 width=7 height=26`, `rect x=15 y=2 width=7 height=26`).
     * When paused: Bold black play triangle (`polygon 2 2, 22 15, 2 28`).
     * Tapping toggles pause/resume.
  3. **Stop Button (Right):** Solid black background. Solid red square icon (`24px × 24px`, `#FF003B`). Tapping pauses and opens the Stop modal.

---

## 4. Screen 3: Settings & Audio Architecture

### 4.1 Sub-View Routing Architecture
The settings screen operates as an in-app slide stack with 4 views:
1. `view-main`: Main Settings list
2. `view-sound`: Sound & Spoken Cues Configuration
3. `view-countdown`: Countdown Beeps & Pitch Styles
4. `view-delay`: Delay & Preparation Times

### 4.2 Complete Settings Key-Value Map & Defaults
```typescript
export interface AppSettings {
  soundEnabled: boolean;           // Default: true
  volume: number;                  // Default: 80 (Range: 0 - 100)
  language: string;                // Default: 'en-US'
  languageLabel: string;           // Default: 'English'
  voiceURI: string;                // Default: 'default'
  voiceName: string;               // Default: 'Default'
  countdownBeeps: boolean;         // Default: true
  speed: number;                   // Default: 1.0 (TTS speech rate)
  countdownStyle: string;          // Default: 'default' ('default', 'arcade', 'voice')
  countdownStyleLabel: string;     // Default: 'Default'
  voiceCommands: boolean;          // Default: false
  prepTime: number;                // Default: 10 (Seconds, Range: 0 - 60)
  keepScreenAwake: boolean;        // Default: true
  delayTime: number;               // Default: 2 (Seconds, Range: 0 - 10)
  workoutDelay: number;            // Default: 60 (Seconds, Range: 0 - 600)
  cueToggles: {
    sets: boolean;                 // Default: true
    restSets: boolean;             // Default: true
    reps: boolean;                 // Default: true
    restReps: boolean;             // Default: true
    hold: boolean;                 // Default: true
  };
  cueNames: {
    sets: string;                  // Default: 'Set'
    restSets: string;              // Default: 'Rest'
    reps: string;                  // Default: 'Rep'
    restReps: string;              // Default: 'Rest'
    hold: string;                  // Default: 'Hold'
  };
}
```

### 4.3 Settings UI Components
* **Switch Row:** Title, optional subtitle, and custom brutalist toggle switch (`52px × 30px`, black background, `#99FF44` when ON, `#303038` when OFF).
* **Slider Row:** Value label on right (e.g. `80%`, `10 SEC`, `60 SEC`). Track filled with `#99FF44`.
* **Select Option Modal / Sheet:** Used for Language, Voice, and Countdown Style picker.
* **Custom Rename Input:** Allows renaming individual spoken cues (e.g., changing 'Hold' to 'Plank' or 'Hang').
* **Reset to Default Button:** Prompts user and restores `DEFAULT_SETTINGS`.

---

## 5. The Chevron Action Runway Engine

### 5.1 Chevron Ribbon Geometry (Figma Node 84-151)
* **Bar Height:** `84px`
* **Chevron Thickness:** `22px`
* **Repeat Pitch:** `48px` (22px solid band + 26px transparent gap)
* **Apex Vertical Position:** `Y = 42px` (exact center)
* **Slant Offset:** `22px` horizontal offset between apex and top/bottom edges.
* **Base Red Color:** `#F13629` (or `#FF003B`)
* **Chevron Fill on Red:** `rgba(255, 255, 255, 0.28)` (blends to `#F45E54`)
* **Chevron Fill on Yellow:** `rgba(0, 0, 0, 0.28)` (crisp black bands)

#### Left Chevron Polygon Path (`<` pointing left):
Top vertices at `(x0 + 22, 0)`, apex at `(x0, 42)`, bottom vertices at `(x0 + 22, 84)`, inner bottom at `(x0 + 44, 84)`, inner apex at `(x0 + 22, 42)`, inner top at `(x0 + 44, 0)`.
$$\text{Path: } M\ (x_0 + 22)\ 0 \ L\ x_0\ 42 \ L\ (x_0 + 22)\ 84 \ L\ (x_0 + 44)\ 84 \ L\ (x_0 + 22)\ 42 \ L\ (x_0 + 44)\ 0\ Z$$

#### Right Chevron Polygon Path (`>` pointing right):
Top vertices at `(x0, 0)`, apex at `(x0 + 22, 42)`, bottom vertices at `(x0, 84)`, inner bottom at `(x0 + 22, 84)`, inner apex at `(x0 + 44, 42)`, inner top at `(x0 + 22, 0)`.
$$\text{Path: } M\ x_0\ 0 \ L\ (x_0 + 22)\ 42 \ L\ x_0\ 84 \ L\ (x_0 + 22)\ 84 \ L\ (x_0 + 44)\ 42 \ L\ (x_0 + 22)\ 0\ Z$$

### 5.2 Entry Point Gradient Fade Mask
To avoid sharp rectangular scissor cuts near the center badge:
* **Left Runway:** Masked with a linear gradient fading from `0% opacity` at the inner right edge to `100% opacity` over `36px`:
  `-webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0) 0px, rgba(0,0,0,1) 24px, rgba(0,0,0,1) calc(100% - 36px), rgba(0,0,0,0) 100%)`
* **Right Runway:** Masked with a linear gradient fading from `0% opacity` at the inner left edge to `100% opacity` over `36px`:
  `-webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0) 0px, rgba(0,0,0,1) 36px, rgba(0,0,0,1) calc(100% - 24px), rgba(0,0,0,0) 100%)`

### 5.3 The 5 Interaction Modes
| Mode | Phase / Trigger | Arrow Direction | Animation Motion | Background Color | Text & Chevron Colors |
| :--- | :--- | :---: | :--- | :---: | :---: |
| **1. `OUTWARD`** | `GO!` | `<<<< [GO!] >>>>` | Streaming outward (Left: `translateX(0 → -48px)`, Right: `translateX(0 → +48px)` in 0.8s) | `#F13629` | Text: White `#FFFFFF`<br>Chevrons: White 0.28 |
| **2. `HOLD`** | `HOLD` (or custom cue) | `<<<< [HOLD] >>>>` | **FROZEN in exact moment & position** (`animationPlayState: 'paused'`) | `#F13629` | Text: White `#FFFFFF`<br>Chevrons: White 0.28 |
| **3. `INWARD`** | `REST` / `SET REST` | `>>>> [REST] <<<<` | Streaming inward (Left: `translateX(0 → +48px)`, Right: `translateX(0 → -48px)` in 0.8s) | `#F13629` | Text: White `#FFFFFF`<br>Chevrons: White 0.28 |
| **4. `PAUSED`** | User taps Pause | None (Chevrons hidden) | Clean text only | **`#FFD000` (Yellow)** | Text: Pure Black `#000000`<br>Chevrons: **Hidden** (`opacity: 0`) |
| **5. `NO ARROWS`**| `PREPARATION` / `COMPLETE!` | None | Chevrons hidden (`opacity: 0`) | `#F13629` | Text: White `#FFFFFF` |

---

## 6. Timer Engine, State Machine & Edge Cases

### 6.1 State Machine Lifecycle
```
[ START ]
    │
    ▼
[ 1. PREPARATION ] (10s countdown, mode-no-arrows, green background)
    │
    ▼
[ 2. WORKOUT DELAY ] (If workout > 1, e.g. 60s rest between tabs)
    │
    ▼
[ 3. PRE-REP DELAY ] (2s delay, badge: 'GO!', arrows streaming outward)
    │
    ▼
[ 4. HOLD PHASE ] (Hold seconds countdown, badge: 'HOLD', chevrons frozen in position, liquid fills upward)
    │
    ├── Rep < Total Reps
    │       ▼
    │   [ 5. REST BETWEEN REPS ] (Rest seconds countdown, badge: 'REST', chevrons streaming inward, liquid drains downward)
    │       │
    │       └─► (Loop back to 3. PRE-REP DELAY)
    │
    └── Rep == Total Reps
            │
            ├── Set < Total Sets
            │       ▼
            │   [ 6. REST BETWEEN SETS ] (Set rest seconds countdown, badge: 'SET REST', chevrons streaming inward)
            │       │
            │       └─► (Loop back to 3. PRE-REP DELAY for Set + 1)
            │
            └── Set == Total Sets
                    │
                    ├── Workout < Total Workouts ──► (Loop to 2. WORKOUT DELAY for next Tab)
                    │
                    └── All Complete ──► [ 7. GREAT WORKOUT! COMPLETE! ] (Trophy modal + celebration chime)
```

### 6.2 Critical Edge Cases Handled
1. **Zero Rest Duration (`restReps = 0` or `restSets = 0`):**
   - The timer must **not** pause or flicker.
   - It announces `"Set X complete"` and immediately transitions into the next set/rep.
2. **Audio Cutoff Prevention on "Hold" Cue:**
   - The text-to-speech audio for "Hold" or "GO!" uses a speech completion callback (`onDone`).
   - The countdown timer ticks only start after the cue utterance finishes speaking, preventing truncated audio.
3. **Reset Tab Values:**
   - Tapping `✕` on a single remaining workout resets values to minimums: `sets: 1`, `reps: 1`, others: `0`.
4. **App Background / Sleep Mode:**
   - Uses `expo-keep-awake` while running to prevent the phone screen from sleeping during workouts.
   - Uses timestamp delta timing (`Date.now() - startTime`) so the clock remains mathematically exact even if backgrounded.

---

## 7. Sound Synthesis, Voice Engine & Wake Lock

### 7.1 Audio Beeps (Pitch Matrix)
Synthesized using Web Audio API in web, or `expo-av` with small pre-rendered audio buffers in React Native:
* **High Chime (Go Cue):** `1760 Hz` (A6), duration `0.2s`, sine wave.
* **Countdown Beeps (3, 2, 1):** `880 Hz` (A5), duration `0.1s`, sine wave.
* **Rest / Finish Chime:** `440 Hz` (A4) → `880 Hz` ascending chime.

### 7.2 Text-to-Speech (TTS)
* Handled via `expo-speech`:
  ```typescript
  import * as Speech from 'expo-speech';

  export function speakCue(text: string, settings: AppSettings, onComplete?: () => void) {
    if (!settings.soundEnabled) {
      if (onComplete) onComplete();
      return;
    }
    Speech.stop();
    Speech.speak(text, {
      language: settings.language || 'en-US',
      rate: settings.speed || 1.0,
      pitch: 1.0,
      onDone: onComplete,
      onError: onComplete,
    });
  }
  ```

---

## 8. Data Models & Persistence Schema

### 8.1 Workout Configuration (`AsyncStorage` key: `workout_timer_saved_config`)
```typescript
export interface WorkoutItem {
  id: number;
  sets: number;      // min: 1, default: 3
  restSets: number;  // min: 0, default: 10
  reps: number;      // min: 1, default: 10
  restReps: number;  // min: 0, default: 5
  hold: number;      // min: 0, default: 10
}

export interface SavedWorkoutConfig {
  activeWorkoutIndex: number;
  workouts: WorkoutItem[];
  exerciseCount: number;
}
```

### 8.2 Settings Persistence (`AsyncStorage` key: `workout_timer_settings_v2`)
Stores the complete `AppSettings` object shown in Section 4.2.

---

## 9. React Native & Expo Implementation Guide

### 9.1 Recommended Directory Structure
```
workout-timer-app/
├── app.json
├── package.json
├── tsconfig.json
├── assets/
│   ├── fonts/
│   │   ├── Anton-Regular.ttf
│   │   ├── Onest-Regular.ttf
│   │   └── Onest-Bold.ttf
│   ├── illustrations/
│   │   ├── ill_trophy.png
│   │   ├── ill_stopwatch.png
│   │   └── ill_water_bottle.png
│   └── icons/
├── src/
│   ├── constants/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── defaults.ts
│   ├── types/
│   │   └── workout.ts
│   ├── services/
│   │   ├── storage.ts
│   │   ├── audio.ts
│   │   └── speech.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── BrutalistHeader.tsx
│   │   │   └── BrutalistModal.tsx
│   │   ├── setup/
│   │   │   ├── WorkoutTabsBar.tsx
│   │   │   ├── ParamCardRow.tsx
│   │   │   └── DualZoneStepper.tsx
│   │   ├── timer/
│   │   │   ├── MetricsStrip.tsx
│   │   │   ├── StageTimerDigits.tsx
│   │   │   ├── LiquidFillOverlay.tsx
│   │   │   ├── ChevronRunwayBar.tsx
│   │   │   └── TimerControls.tsx
│   │   └── settings/
│   │       ├── SettingSwitchRow.tsx
│   │       └── SettingSliderRow.tsx
│   ├── hooks/
│   │   ├── useWorkoutTimer.ts
│   │   └── useKeepScreenAwake.ts
│   └── screens/
│       ├── SetupScreen.tsx
│       ├── TimerScreen.tsx
│       └── SettingsScreen.tsx
└── App.tsx
```

### 9.2 Critical NPM Dependencies
```bash
npx expo install expo-font @expo-google-fonts/anton @expo-google-fonts/onest
npx expo install expo-speech expo-av expo-keep-awake
npx expo install react-native-svg react-native-reanimated
npx expo install @react-native-async-storage/async-storage
```

---
*End of Master Specification. This document contains all requirements, mathematics, colors, dimensions, and state logic to recreate the workout timer app in React Native with 100% fidelity.*
