import * as Speech from 'expo-speech';
import { AppSettings } from '../types/workout';

export function stopSpeaking(): void {
  try {
    Speech.stop();
  } catch (e) {
    // ignore
  }
}

export function speakCue(
  text: string,
  settings: AppSettings,
  onComplete?: () => void
): void {
  if (!settings.soundEnabled) {
    if (onComplete) onComplete();
    return;
  }

  try {
    Speech.stop();
    Speech.speak(text, {
      language: settings.language || 'en-US',
      rate: settings.speed || 1.0,
      pitch: 1.0,
      onDone: onComplete,
      onError: onComplete,
    });
  } catch (e) {
    console.warn('Speech error:', e);
    if (onComplete) onComplete();
  }
}
