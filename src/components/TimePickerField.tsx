import React from "react";

import {
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

      {showPicker && (
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
});