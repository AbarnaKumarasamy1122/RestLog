import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import colors from "../constants/colors";

interface SleepQualityProps {
  value: number;
  onChange: (value: number) => void;
}

export default function SleepQuality({
  value,
  onChange,
}: SleepQualityProps) {
  return (
    <View>
      <Text style={styles.label}>
        Sleep quality
      </Text>

      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map(
          (rating) => (
            <Pressable
              key={rating}
              onPress={() =>
                onChange(rating)
              }
              style={styles.starButton}
            >
              <Text
                style={[
                  styles.star,
                  rating <= value &&
                    styles.selectedStar,
                ]}
              >
                {rating <= value
                  ? "★"
                  : "☆"}
              </Text>
            </Pressable>
          )
        )}
      </View>

      <Text style={styles.ratingText}>
        {value === 0
          ? "Select your sleep quality"
          : `${value} / 5`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 10,
  },

  stars: {
    flexDirection: "row",
    alignItems: "center",
  },

  starButton: {
    paddingRight: 8,
  },

  star: {
    fontSize: 34,
    color: colors.border,
  },

  selectedStar: {
    color: colors.star,
  },

  ratingText: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
});