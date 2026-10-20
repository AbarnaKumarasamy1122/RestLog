import React from "react";

import {
  Platform,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import colors from "../constants/colors";

interface TimePickerFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  icon: string;
}

export default function TimePickerField({
  label,
  value,
  onChange,
  icon,
}: TimePickerFieldProps) {
  const [showPicker, setShowPicker] =
    React.useState(false);

  const handleChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowPicker(false);

    if (
      event.type === "set" &&
      selectedDate
    ) {
      onChange(selectedDate);
    }
  };

  const handleWebChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const [hours, minutes] =
      event.target.value.split(":").map(Number);

    if (
      Number.isInteger(hours) &&
      Number.isInteger(minutes)
    ) {
      const nextDate = new Date(value);

      nextDate.setHours(hours, minutes, 0, 0);
      onChange(nextDate);
    }
  };

  const webTimeValue = [
    value.getHours().toString().padStart(2, "0"),
    value.getMinutes().toString().padStart(2, "0"),
  ].join(":");

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
      </Text>

      <Pressable
        style={styles.field}
        onPress={() =>
          setShowPicker(true)
        }
      >
        <Text style={styles.icon}>
          {icon}
        </Text>

        <Text style={styles.value}>
          {value.toLocaleTimeString(
            "en-US",
            {
              hour: "numeric",
              minute: "2-digit",
            }
          )}
        </Text>

        <Text style={styles.change}>
          Change
        </Text>
      </Pressable>

      {showPicker && Platform.OS === "web" && (
        <View style={styles.webPickerContainer}>
          {React.createElement("input", {
            type: "time",
            value: webTimeValue,
            onChange: handleWebChange,
            "aria-label": `Select ${label.toLowerCase()}`,
            autoFocus: true,
            style: styles.webInput,
          })}
        </View>
      )}

      {showPicker && Platform.OS !== "web" && (
        <DateTimePicker
          value={value}
          mode="time"
          is24Hour={false}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 10,
  },

  field: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 16,
  },

  icon: {
    fontSize: 22,
    marginRight: 12,
  },

  value: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },

  change: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },

  webPickerContainer: {
    marginTop: 8,
  },

  webInput: {
    width: "100%",
    minHeight: 44,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 12,
  },
});