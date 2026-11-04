import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, Fonts, Layout } from '../constants/theme';
import { AppSettings } from '../types/workout';
import { DEFAULT_SETTINGS, saveSettings } from '../services/storage';

interface SettingsScreenProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, setSettings, onClose }) => {
  const [currentView, setCurrentView] = useState<'main' | 'sound' | 'delay'>('main');

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      saveSettings(updated);
      return updated;
    });
  };

  const updateCueToggle = (cueKey: keyof AppSettings['cueToggles'], val: boolean) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        cueToggles: { ...prev.cueToggles, [cueKey]: val },
      };
      saveSettings(updated);
      return updated;
    });
  };

  const resetDefaults = () => {
    Alert.alert('Reset Settings', 'Reset all settings to default values?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          setSettings({ ...DEFAULT_SETTINGS });
          saveSettings({ ...DEFAULT_SETTINGS });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={() => {
              if (currentView !== 'main') {
                setCurrentView('main');
              } else {
                onClose();
              }
            }}
          >
            <Text style={styles.headerTitle}>
              {currentView === 'main' ? 'SETTINGS' : currentView === 'sound' ? 'SOUND & CUES' : 'DELAYS & PREP'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.85}>
            <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <Path d="M4 4L16 16M16 4L4 16" stroke={Colors.white} strokeWidth={2.4} strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Content Views */}
        <ScrollView style={styles.content}>
          {currentView === 'main' && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.navRow}
                onPress={() => setCurrentView('sound')}
                activeOpacity={0.8}
              >
                <View>
                  <Text style={styles.navRowTitle}>SOUND & SPOKEN CUES</Text>
                  <Text style={styles.navRowSubtitle}>Voice triggers, volumes, and cues</Text>
                </View>
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navRow}
                onPress={() => setCurrentView('delay')}
                activeOpacity={0.8}
              >
                <View>
                  <Text style={styles.navRowTitle}>DELAYS & PREPARATION</Text>
                  <Text style={styles.navRowSubtitle}>Pre-workout countdown and transitions</Text>
                </View>
                <Text style={styles.arrowIcon}>›</Text>
              </TouchableOpacity>

              <View style={styles.switchRow}>
                <View style={styles.switchTextWrap}>
                  <Text style={styles.navRowTitle}>KEEP SCREEN AWAKE</Text>
                  <Text style={styles.navRowSubtitle}>Prevent device from sleeping during workout</Text>
                </View>
                <Switch
                  value={settings.keepScreenAwake}
                  onValueChange={(val) => updateSetting('keepScreenAwake', val)}
                  trackColor={{ false: '#303038', true: Colors.voltGreen }}
                  thumbColor={Colors.white}
                />
              </View>

              <TouchableOpacity style={styles.resetBtn} onPress={resetDefaults} activeOpacity={0.8}>
                <Text style={styles.resetBtnText}>RESET TO DEFAULT</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentView === 'sound' && (
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <View style={styles.switchTextWrap}>
                  <Text style={styles.navRowTitle}>MASTER AUDIO</Text>
                  <Text style={styles.navRowSubtitle}>Enable sound effects and voice</Text>
                </View>
                <Switch
                  value={settings.soundEnabled}
                  onValueChange={(val) => updateSetting('soundEnabled', val)}
                  trackColor={{ false: '#303038', true: Colors.voltGreen }}
                  thumbColor={Colors.white}
                />
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchTextWrap}>
                  <Text style={styles.navRowTitle}>COUNTDOWN BEEPS</Text>
                  <Text style={styles.navRowSubtitle}>Chimes on 3, 2, 1 before transitions</Text>
                </View>
                <Switch
                  value={settings.countdownBeeps}
                  onValueChange={(val) => updateSetting('countdownBeeps', val)}
                  trackColor={{ false: '#303038', true: Colors.voltGreen }}
                  thumbColor={Colors.white}
                />
              </View>

              <Text style={styles.groupHeader}>ACTIVE CUES</Text>
              {(['hold', 'restReps', 'restSets', 'sets', 'reps'] as const).map((cueKey) => (
                <View key={cueKey} style={styles.switchRow}>
                  <Text style={styles.cueTitle}>{settings.cueNames[cueKey].toUpperCase()}</Text>
                  <Switch
                    value={settings.cueToggles[cueKey]}
                    onValueChange={(val) => updateCueToggle(cueKey, val)}
                    trackColor={{ false: '#303038', true: Colors.voltGreen }}
                    thumbColor={Colors.white}
                  />
                </View>
              ))}
            </View>
          )}

          {currentView === 'delay' && (
            <View style={styles.section}>
              <View style={styles.stepperRow}>
                <View>
                  <Text style={styles.navRowTitle}>PREPARATION TIME</Text>
                  <Text style={styles.navRowSubtitle}>Countdown before workout begins</Text>
                </View>
                <View style={styles.stepperActions}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => updateSetting('prepTime', Math.max(0, settings.prepTime - 5))}
                  >
                    <Text style={styles.stepperBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperValText}>{settings.prepTime}s</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => updateSetting('prepTime', settings.prepTime + 5)}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.stepperRow}>
                <View>
                  <Text style={styles.navRowTitle}>WORKOUT DELAY</Text>
                  <Text style={styles.navRowSubtitle}>Rest between multi-workout tabs</Text>
                </View>
                <View style={styles.stepperActions}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => updateSetting('workoutDelay', Math.max(0, settings.workoutDelay - 10))}
                  >
                    <Text style={styles.stepperBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperValText}>{settings.workoutDelay}s</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => updateSetting('workoutDelay', settings.workoutDelay + 10)}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
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
  },
  header: {
    height: Layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    backgroundColor: Colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDark,
  },
  headerBackBtn: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 20,
  },
  headerTitle: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    letterSpacing: 1.2,
    color: Colors.white,
    textTransform: 'uppercase',
  },
  closeBtn: {
    width: 93,
    height: '100%',
    backgroundColor: Colors.headerRed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 12,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDark,
  },
  navRowTitle: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    letterSpacing: 1.2,
    color: Colors.white,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  navRowSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mutedGrey,
  },
  arrowIcon: {
    fontSize: 28,
    color: Colors.mutedGrey,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDark,
  },
  switchTextWrap: {
    flex: 1,
    paddingRight: 16,
  },
  groupHeader: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    letterSpacing: 1.2,
    color: Colors.mutedGrey,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  cueTitle: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    letterSpacing: 1.2,
    color: Colors.white,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDark,
  },
  stepperActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#1B1B1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.white,
  },
  stepperValText: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: Colors.voltGreen,
    minWidth: 44,
    textAlign: 'center',
  },
  resetBtn: {
    marginHorizontal: 20,
    marginTop: 36,
    paddingVertical: 16,
    backgroundColor: '#1B1B1F',
    alignItems: 'center',
  },
  resetBtnText: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    letterSpacing: 1.2,
    color: Colors.crimsonRed,
    textTransform: 'uppercase',
  },
});
