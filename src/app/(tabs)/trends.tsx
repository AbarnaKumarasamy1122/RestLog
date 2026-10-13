import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { BarChart, LineChart } from "react-native-chart-kit";

import colors from "../../constants/colors";
import { getSleepEntries } from "../../services/storage";
import { formatDuration } from "../../utils/sleep";
import type { SleepEntry } from "../../types/sleep";

const screenWidth = Dimensions.get("window").width;

const chartWidth = Math.max(280, Math.min(screenWidth - 48, 700));

const chartConfig = {
  backgroundGradientFrom: colors.surface,
  backgroundGradientTo: colors.surface,
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(119, 116, 129, ${opacity})`,
  propsForBackgroundLines: {
    stroke: colors.border,
    strokeDasharray: "",
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: colors.primary,
  },
};

type DayData = {
  key: string;
  label: string;
  hours: number;
  quality: number;
  entries: number;
};

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentWeek(): DayData[] {
  const today = new Date();
  const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const dayOfWeek = monday.getDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  monday.setDate(monday.getDate() - daysSinceMonday);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      key: getLocalDateKey(date),
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      hours: 0,
      quality: 0,
      entries: 0,
    };
  });
}

function buildWeeklyData(entries: SleepEntry[]): DayData[] {
  const days = getCurrentWeek();
  const dayMap = new Map(days.map((day) => [day.key, day]));

  entries.forEach((entry) => {
    const day = dayMap.get(entry.date);

    if (day) {
      day.hours += entry.durationMinutes / 60;
      day.quality += entry.quality;
      day.entries += 1;
    }
  });

  return days.map((day) => ({
    ...day,
    quality:
      day.entries > 0 ? Number((day.quality / day.entries).toFixed(1)) : 0,
    hours: Number(day.hours.toFixed(1)),
  }));
}

export default function TrendsScreen() {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const loadEntries = useCallback(async () => {
    try {
      setLoadError(false);
      const savedEntries = await getSleepEntries();
      setEntries(savedEntries);
    } catch (error) {
      console.error("Failed to load sleep trends:", error);
      setLoadError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries]),
  );

  const weeklyData = buildWeeklyData(entries);

  const totalMinutes = entries.reduce(
    (total, entry) => total + entry.durationMinutes,
    0,
  );

  const averageMinutes =
    entries.length > 0 ? Math.round(totalMinutes / entries.length) : 0;

  const averageQuality =
    entries.length > 0
      ? entries.reduce((total, entry) => total + entry.quality, 0) /
        entries.length
      : 0;

  const longestSleep = entries.reduce<SleepEntry | null>(
    (longest, entry) =>
      !longest || entry.durationMinutes > longest.durationMinutes
        ? entry
        : longest,
    null,
  );

  const recordedDays = weeklyData.filter((day) => day.entries > 0).length;

  const bestQualityDay = weeklyData
    .filter((day) => day.entries > 0)
    .reduce<DayData | null>(
      (best, day) => (!best || day.quality > best.quality ? day : best),
      null,
    );

  const totalWeeklyHours = weeklyData.reduce(
    (total, day) => total + day.hours,
    0,
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your sleep insights...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadEntries();
          }}
          tintColor={colors.primary}
        />
      }
    >
      <Text style={styles.title}>Trends & Insights</Text>
      <Text style={styles.subtitle}>
        Understand your sleep habits, one night at a time.
      </Text>

      {loadError ? (
        <View style={styles.card}>
          <Text style={styles.emptyTitle}>Could not load sleep records</Text>
          <Text style={styles.emptyText}>Pull down to try again.</Text>
        </View>
      ) : null}

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🌙</Text>
          <Text style={styles.statValue}>
            {entries.length > 0 ? formatDuration(averageMinutes) : "--"}
          </Text>
          <Text style={styles.statLabel}>Average sleep</Text>
          <Text style={styles.statHint}>Across saved entries</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⭐</Text>
          <Text style={styles.statValue}>
            {entries.length > 0 ? `${averageQuality.toFixed(1)}/5` : "--"}
          </Text>
          <Text style={styles.statLabel}>Average quality</Text>
          <Text style={styles.statHint}>Your sleep ratings</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📚</Text>
          <Text style={styles.statValue}>{entries.length}</Text>
          <Text style={styles.statLabel}>Total entries</Text>
          <Text style={styles.statHint}>Sleep records saved</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📅</Text>
          <Text style={styles.statValue}>{recordedDays}/7</Text>
          <Text style={styles.statLabel}>Days logged</Text>
          <Text style={styles.statHint}>This week</Text>
        </View>
      </View>

      {entries.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyIcon}>🌱</Text>
          <Text style={styles.emptyTitle}>Your sleep story starts here</Text>
          <Text style={styles.emptyText}>
            Add a sleep entry in Log Sleep. Your weekly charts and personal
            insights will appear here automatically.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Weekly sleep duration</Text>
            <Text style={styles.sectionSubtitle}>
              Total hours recorded for each day, Monday to Sunday.
            </Text>

            {totalWeeklyHours > 0 ? (
              <BarChart
                data={{
                  labels: weeklyData.map((day) => day.label),
                  datasets: [
                    {
                      data: weeklyData.map((day) => day.hours),
                    },
                  ],
                }}
                width={chartWidth}
                height={230}
                yAxisLabel=""
                yAxisSuffix="h"
                fromZero
                showValuesOnTopOfBars
                chartConfig={chartConfig}
                style={styles.chart}
                verticalLabelRotation={0}
              />
            ) : (
              <Text style={styles.emptyText}>
                No sleep entries recorded for this week yet.
              </Text>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Sleep quality this week</Text>
            <Text style={styles.sectionSubtitle}>
              Average quality rating per day, from 1 to 5.
            </Text>

            {weeklyData.some((day) => day.entries > 0) ? (
              <LineChart
                data={{
                  labels: weeklyData.map((day) => day.label),
                  datasets: [
                    {
                      data: weeklyData.map((day) => day.quality),
                    },
                  ],
                }}
                width={chartWidth}
                height={230}
                fromZero
                yAxisSuffix="/5"
                yAxisInterval={1}
                chartConfig={chartConfig}
                style={styles.chart}
                bezier
                withDots
              />
            ) : (
              <Text style={styles.emptyText}>
                Add a sleep rating to see your quality trend.
              </Text>
            )}

            <Text style={styles.chartFootnote}>
              Days without a record are shown as zero.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Your insights</Text>

            <View style={styles.insightRow}>
              <Text style={styles.insightIcon}>🏆</Text>
              <View style={styles.insightBody}>
                <Text style={styles.insightTitle}>Longest sleep</Text>
                <Text style={styles.insightDescription}>
                  {longestSleep
                    ? `${formatDuration(
                        longestSleep.durationMinutes,
                      )} on ${longestSleep.date}`
                    : "No sleep data yet"}
                </Text>
              </View>
            </View>

            <View style={styles.insightRow}>
              <Text style={styles.insightIcon}>✨</Text>
              <View style={styles.insightBody}>
                <Text style={styles.insightTitle}>
                  Best-rated day this week
                </Text>
                <Text style={styles.insightDescription}>
                  {bestQualityDay
                    ? `${bestQualityDay.label}: ${bestQualityDay.quality.toFixed(
                        1,
                      )}/5 average quality`
                    : "No ratings recorded this week"}
                </Text>
              </View>
            </View>

            <View style={styles.insightRow}>
              <Text style={styles.insightIcon}>📈</Text>
              <View style={styles.insightBody}>
                <Text style={styles.insightTitle}>Weekly sleep total</Text>
                <Text style={styles.insightDescription}>
                  {formatDuration(Math.round(totalWeeklyHours * 60))} recorded
                  this week.
                </Text>
              </View>
            </View>
          </View>
        </>
      )}

      <Text style={styles.footer}>
        Keep logging consistently to discover your sleep patterns.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "44%",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginTop: 5,
  },
  statHint: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 5,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
    alignSelf: "center",
    marginLeft: -8,
  },
  chartFootnote: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 8,
  },
  emptyIcon: {
    fontSize: 36,
    textAlign: "center",
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  insightIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  insightBody: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  insightDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 4,
  },
  footer: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
});
