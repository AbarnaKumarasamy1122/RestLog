import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useFocusEffect,
} from "expo-router";

import colors from "../../constants/colors";

import {
  getSleepEntries,
  deleteSleepEntry,
} from "../../services/storage";

import {
  formatDuration,
} from "../../utils/sleep";

import {
  formatTime,
} from "../../utils/date";

import { SleepEntry } from "../../types/sleep";

export default function HistoryScreen() {
  const [entries, setEntries] =
    useState<SleepEntry[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [entryPendingDeletion, setEntryPendingDeletion] =
    useState<SleepEntry | null>(null);

  // Load entries whenever this screen
  // becomes active.
  const loadEntries = useCallback(
    async () => {
      try {
        const savedEntries =
          await getSleepEntries();

        const sortedEntries =
          [...savedEntries].sort(
            (a, b) =>
              new Date(b.date).getTime() -
              new Date(a.date).getTime()
          );

        setEntries(sortedEntries);
      } catch (error) {
        console.error(
          "Failed to load history:",
          error
        );

        Alert.alert(
          "Unable to load history",
          "Please try opening History again."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  // Support pull-to-refresh.
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadEntries();
  };

  const confirmDelete = (
    entry: SleepEntry
  ) => {
    setEntryPendingDeletion(entry);
  };

  const cancelDelete = () => {
    setEntryPendingDeletion(null);
  };

  const confirmPendingDelete = () => {
    if (!entryPendingDeletion) {
      return;
    }

    const entryId = entryPendingDeletion.id;

    setEntryPendingDeletion(null);
    void handleDelete(entryId);
  };

  // Delete the entry from persistent storage.
  const handleDelete = async (
    entryId: string
  ) => {
    if (deletingId !== null) {
      return;
    }

    setDeletingId(entryId);

    try {
      const updatedEntries =
        await deleteSleepEntry(entryId);

      if (updatedEntries === null) {
        Alert.alert(
          "Delete failed",
          "The entry could not be deleted. Please try again."
        );

        return;
      }

      const sortedEntries =
        [...updatedEntries].sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
        );

      setEntries(sortedEntries);
    } catch (error) {
      console.error(
        "Failed to delete entry:",
        error
      );

      Alert.alert(
        "Something went wrong",
        "Unable to delete this sleep entry."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Format a YYYY-MM-DD date without
  // accidentally shifting it to another day.
  const formatEntryDate = (
    dateString: string
  ) => {
    const date = new Date(
      `${dateString}T12:00:00`
    );

    return date.toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const renderEntry = ({
    item,
  }: {
    item: SleepEntry;
  }) => {
    const isDeleting =
      deletingId === item.id;

    return (
      <View style={styles.entryCard}>
        {/* Entry date */}
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <View style={styles.dateIcon}>
              <Text style={styles.dateEmoji}>
                🌙
              </Text>
            </View>

            <View style={styles.dateTextContainer}>
              <Text style={styles.entryDate}>
                {formatEntryDate(item.date)}
              </Text>

              <Text style={styles.dateCaption}>
                Sleep record
              </Text>
            </View>
          </View>

          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>
              ★ {item.quality}/5
            </Text>
          </View>
        </View>

        {/* Sleep duration */}
        <View style={styles.durationSection}>
          <Text style={styles.durationValue}>
            {formatDuration(
              item.durationMinutes
            )}
          </Text>

          <Text style={styles.durationCaption}>
            Total sleep
          </Text>
        </View>

        {/* Bedtime and wake-up time */}
        <View style={styles.timeRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeIcon}>
              🌙
            </Text>

            <View>
              <Text style={styles.timeLabel}>
                Bedtime
              </Text>

              <Text style={styles.timeValue}>
                {formatTime(item.bedtime)}
              </Text>
            </View>
          </View>

          <View style={styles.timeDivider} />

          <View style={styles.timeBlock}>
            <Text style={styles.timeIcon}>
              ☀️
            </Text>

            <View>
              <Text style={styles.timeLabel}>
                Wake-up
              </Text>

              <Text style={styles.timeValue}>
                {formatTime(item.wakeTime)}
              </Text>
            </View>
          </View>
        </View>

        {/* Sleep quality */}
        <View style={styles.qualitySection}>
          <Text style={styles.sectionLabel}>
            Sleep quality
          </Text>

          <View style={styles.qualityRow}>
            <Text style={styles.stars}>
              {"★".repeat(item.quality)}
              <Text style={styles.emptyStars}>
                {"☆".repeat(
                  5 - item.quality
                )}
              </Text>
            </Text>

            <Text style={styles.qualityValue}>
              {item.quality === 5
                ? "Excellent"
                : item.quality === 4
                  ? "Good"
                  : item.quality === 3
                    ? "Average"
                    : item.quality === 2
                      ? "Fair"
                      : "Poor"}
            </Text>
          </View>
        </View>

        {/* Optional note */}
        {item.note.trim().length > 0 && (
          <View style={styles.noteSection}>
            <Text style={styles.sectionLabel}>
              Your note
            </Text>

            <Text style={styles.noteText}>
              {item.note}
            </Text>
          </View>
        )}

        {/* Delete action */}
        <Pressable
          onPress={() =>
            confirmDelete(item)
          }
          disabled={deletingId !== null}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressed,
            deletingId !== null &&
              styles.disabledButton,
          ]}
        >
          <Text style={styles.deleteIcon}>
            🗑
          </Text>

          <Text style={styles.deleteText}>
            {isDeleting
              ? "Deleting..."
              : "Delete entry"}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <View style={styles.container}>
        {/* Screen header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              YOUR SLEEP JOURNEY
            </Text>

            <Text style={styles.title}>
              History
            </Text>

            <Text style={styles.subtitle}>
              Review your sleep records.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Text style={styles.headerEmoji}>
              📋
            </Text>
          </View>
        </View>

        {/* Record count */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryTitle}>
            Your records
          </Text>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {entries.length}
            </Text>
          </View>
        </View>

        {/* Loading state */}
        {isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />

            <Text style={styles.loadingText}>
              Loading your sleep history...
            </Text>
          </View>
        ) : (
          <FlatList
            data={entries}
            renderItem={renderEntry}
            keyExtractor={(item) => item.id}
            contentContainerStyle={
              entries.length === 0
                ? styles.emptyList
                : styles.listContent
            }
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Text style={styles.emptyEmoji}>
                    🌙
                  </Text>
                </View>

                <Text style={styles.emptyTitle}>
                  No sleep records yet
                </Text>

                <Text style={styles.emptyDescription}>
                  Your saved sleep entries will
                  appear here. Start tracking
                  your sleep to build your history.
                </Text>
              </View>
            }
          />
        )}
      </View>

      <Modal
        visible={entryPendingDeletion !== null}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>
              Delete sleep entry?
            </Text>

            <Text style={styles.confirmationMessage}>
              Are you sure you want to delete this sleep
              history? This action cannot be undone.
            </Text>

            <View style={styles.confirmationActions}>
              <Pressable
                onPress={cancelDelete}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={confirmPendingDelete}
                style={({ pressed }) => [
                  styles.confirmDeleteButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.confirmDeleteText}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 24,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: colors.primary,
    marginBottom: 5,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: colors.textSecondary,
  },

  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#EEEAFB",
    alignItems: "center",
    justifyContent: "center",
  },

  headerEmoji: {
    fontSize: 25,
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },

  countBadge: {
    marginLeft: 10,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EEEAFB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  countText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },

  listContent: {
    paddingBottom: 24,
  },

  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 30,
  },

  entryCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,

    borderWidth: 1,
    borderColor: colors.border,

    elevation: 2,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  dateIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F0EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  dateEmoji: {
    fontSize: 21,
  },

  dateTextContainer: {
    flex: 1,
  },

  entryDate: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  dateCaption: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },

  scoreBadge: {
    backgroundColor: "#FFF5DB",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginLeft: 8,
  },

  scoreText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9A6B00",
  },

  durationSection: {
    alignItems: "center",
    paddingVertical: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },

  durationValue: {
    fontSize: 34,
    fontWeight: "800",
    color: colors.primary,
  },

  durationCaption: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },

  timeBlock: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  timeIcon: {
    fontSize: 22,
    marginRight: 9,
  },

  timeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },

  timeValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  timeDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
    marginHorizontal: 12,
  },

  qualitySection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: colors.border,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },

  qualityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  stars: {
    fontSize: 22,
    color: colors.star,
    letterSpacing: 1,
  },

  emptyStars: {
    color: colors.border,
  },

  qualityValue: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  noteSection: {
    marginTop: 18,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
  },

  noteText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginTop: 18,
    paddingVertical: 12,

    borderRadius: 12,

    borderWidth: 1,
    borderColor: "#F2D6D5",

    backgroundColor: "#FFF7F6",
  },

  deleteIcon: {
    fontSize: 15,
    marginRight: 8,
  },

  deleteText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.danger,
  },

  pressed: {
    opacity: 0.7,
  },

  disabledButton: {
    opacity: 0.5,
  },

  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(18, 16, 39, 0.45)",
  },

  confirmationModal: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 24,
  },

  confirmationTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  confirmationMessage: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },

  confirmationActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 24,
  },

  cancelButton: {
    minWidth: 90,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  confirmDeleteButton: {
    minWidth: 90,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colors.danger,
    paddingHorizontal: 16,
  },

  confirmDeleteText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },

  emptyState: {
    alignItems: "center",
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: "#EEEAFB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  emptyEmoji: {
    fontSize: 42,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },

  emptyDescription: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    color: colors.textSecondary,
  },
});