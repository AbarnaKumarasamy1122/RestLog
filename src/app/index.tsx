import React from "react";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import TimePickerField from "../components/TimePickerField";
import SleepQuality from "../components/SleepQuality";

import colors from "../constants/colors";

import {
  addSleepEntry,
} from "../services/storage";

import {
  calculateSleepDuration,
  formatDuration,
} from "../utils/sleep";

import {
  getDateKey,
} from "../utils/date";

import { SleepEntry } from "../types/sleep";

export default function LogSleepScreen() {
  const [bedtime, setBedtime] =
    React.useState(() => {
      const date = new Date();

      date.setHours(22, 0, 0, 0);

      return date;
    });

  const [wakeTime, setWakeTime] =
    React.useState(() => {
      const date = new Date();

      date.setHours(6, 30, 0, 0);

      return date;
    });

  const [quality, setQuality] =
    React.useState(0);

  const [note, setNote] =
    React.useState("");

  const [isSaving, setIsSaving] =
    React.useState(false);

  const [showSuccess, setShowSuccess] =
    React.useState(false);

  const durationMinutes =
    calculateSleepDuration(
      bedtime,
      wakeTime
    );

  const handleSave = async () => {
    if (quality === 0) {
      Alert.alert(
        "Sleep quality required",
        "Please rate your sleep from 1 to 5."
      );

      return;
    }

    if (durationMinutes <= 0) {
      Alert.alert(
        "Invalid sleep duration",
        "Please select valid bedtime and wake-up times."
      );

      return;
    }

    try {
      setIsSaving(true);

      const entry: SleepEntry = {
        id: Date.now().toString(),

        date: getDateKey(
          new Date()
        ),

        bedtime:
          bedtime.toISOString(),

        wakeTime:
          wakeTime.toISOString(),

        durationMinutes,

        quality,

        note: note.trim(),
      };

      const result =
        await addSleepEntry(entry);

      if (!result) {
        Alert.alert(
          "Save failed",
          "We couldn't save your sleep entry. Please try again."
        );

        return;
      }

      setNote("");
      setQuality(0);

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Save error:",
        error
      );

      Alert.alert(
        "Something went wrong",
        "Unable to save your sleep entry."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              RESTLOG
            </Text>

            <Text style={styles.title}>
              Log Sleep
            </Text>

            <Text style={styles.subtitle}>
              Track how well you rested.
            </Text>
          </View>

          <View style={styles.moonContainer}>
            <Text style={styles.moon}>
              🌙
            </Text>
          </View>
        </View>

        {showSuccess && (
          <View style={styles.successBox}>
            <View
              style={styles.successIcon}
            >
              <Text>✓</Text>
            </View>

            <View style={styles.successTextContainer}>
              <Text
                style={styles.successTitle}
              >
                Sleep saved
              </Text>

              <Text
                style={styles.successMessage}
              >
                Your sleep entry was saved
                successfully.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.durationCard}>
          <Text style={styles.durationLabel}>
            SLEEP DURATION
          </Text>

          <Text style={styles.duration}>
            {formatDuration(
              durationMinutes
            )}
          </Text>

          <Text style={styles.durationHint}>
            Based on your bedtime and
            wake-up time
          </Text>
        </View>

        <View style={styles.section}>
          <TimePickerField
            label="Bedtime"
            value={bedtime}
            onChange={setBedtime}
            icon="🌙"
          />

          <TimePickerField
            label="Wake-up time"
            value={wakeTime}
            onChange={setWakeTime}
            icon="☀️"
          />
        </View>

        <View style={styles.section}>
          <SleepQuality
            value={quality}
            onChange={setQuality}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.inputLabel}>
            Note
          </Text>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="How did you sleep?"
            placeholderTextColor={
              colors.textSecondary
            }
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={200}
            style={styles.noteInput}
          />

          <Text style={styles.characterCount}>
            {note.length}/200
          </Text>
        </View>

        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={[
            styles.saveButton,
            isSaving &&
              styles.saveButtonDisabled,
          ]}
        >
          <Text style={styles.saveButtonText}>
            {isSaving
              ? "Saving..."
              : "Save Sleep"}
          </Text>
        </Pressable>

        <Text style={styles.footerText}>
          Your sleep data is stored
          securely on this device.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    color: colors.primary,
    marginBottom: 5,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: colors.textSecondary,
  },

  moonContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EEEAFB",
    alignItems: "center",
    justifyContent: "center",
  },

  moon: {
    fontSize: 25,
  },

  successBox: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#EAF7EF",

    borderWidth: 1,
    borderColor: "#CBEBD8",

    borderRadius: 14,

    padding: 14,

    marginBottom: 18,
  },

  successIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: colors.success,

    marginRight: 12,
  },

  successTextContainer: {
    flex: 1,
  },

  successTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#267A4B",
  },

  successMessage: {
    marginTop: 2,
    fontSize: 13,
    color: "#438060",
  },

  durationCard: {
    backgroundColor: colors.primary,

    borderRadius: 20,

    padding: 22,

    marginBottom: 26,

    alignItems: "center",
  },

  durationLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#DCD7FF",
  },

  duration: {
    marginTop: 6,
    fontSize: 38,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  durationHint: {
    marginTop: 5,
    fontSize: 12,
    color: "#DCD7FF",
  },

  section: {
    marginBottom: 8,
  },

  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 10,
  },

  noteInput: {
    minHeight: 110,

    borderWidth: 1,
    borderColor: colors.border,

    borderRadius: 14,

    backgroundColor: colors.surface,

    padding: 15,

    fontSize: 15,
    color: colors.text,

    lineHeight: 21,
  },

  characterCount: {
    alignSelf: "flex-end",
    marginTop: 5,
    fontSize: 12,
    color: colors.textSecondary,
  },

  saveButton: {
    height: 56,

    borderRadius: 16,

    backgroundColor: colors.primary,

    alignItems: "center",
    justifyContent: "center",

    marginTop: 12,

    elevation: 2,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  footerText: {
    textAlign: "center",
    marginTop: 15,
    fontSize: 12,
    color: colors.textSecondary,
  },
});