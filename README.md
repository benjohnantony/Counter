# ⏱️ Cross-Platform Workout Interval Timer

A sleek, responsive interval timer and audio coach web application crafted with a strict 4-point UX/UI grid system and modern Web APIs.

## 🌟 Live Demo
Host directly on GitHub Pages with zero build configuration!

## ✨ Key Features
- **Config Screen (`index.html`):**
  - Sets, Rest between Sets, Reps, Rest between Reps, and Hold Time parameters.
  - Interactive steppers (single-click increment, press-and-hold rapid acceleration, and direct numeric input).
  - Horizontally scrollable exercise tabs with mouse wheel, swipe, and drag panning support.
  - Custom toggle switches with integrated speaker icons for granular audio cues.
  - Persistent settings: all configured intervals and exercise tabs are automatically saved and restored via `localStorage`.

- **Active Workout Timer (`timer.html`):**
  - Large center circle displaying strictly current rep count (`X of Y`) with pop animation.
  - Synchronized Audio Coach: announcement cues (*"Exercise 1. Set 1. Rep 1."*) finish speaking *before* the countdown starts.
  - Dynamic Dual-Color Ring:
    - **Red Arc (`#ff3b5c`):** Smoothly fills from 0% to 100% during Hold.
    - **Yellow Arc (`#f5a623`):** Smoothly drains from 100% down to 0% during Rest between reps.
  - Stop modal dialog (Restart from beginning, Go to home, Cancel).
  - Celebration bottom sheets (between exercises and upon workout completion).
  - Hands-free voice recognition engine (*"pause"*, *"resume"*, *"stop"*, *"repeat"*, *"next"*, *"home"*).

- **Settings (`settings.html`):**
  - Voice selection sheet with device speech synthesis voice previews.
  - Language & accent selection.
  - Speech speed (0.6x – 1.6x) and volume (0% – 100%) sliders with live feedback.
  - Screen Wake Lock API integration to keep screen awake during workouts.
  - Toggleable voice commands & audio countdown chime beeps.

## 🚀 Deployment to GitHub Pages
1. Push this repository to GitHub.
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Branch**, select `main` (root) and click **Save**.
4. Your workout timer will be live at `https://<username>.github.io/<repository-name>/`!
