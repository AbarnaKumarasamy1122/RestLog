import AsyncStorage from "@react-native-async-storage/async-storage";

import { SleepEntry } from "../types/sleep";

const STORAGE_KEY = "@restlog_sleep_entries";

export async function getSleepEntries(): Promise<
  SleepEntry[]
> {
  try {
    const storedData =
      await AsyncStorage.getItem(STORAGE_KEY);

    if (!storedData) {
      return [];
    }

    return JSON.parse(storedData) as SleepEntry[];
  } catch (error) {
    console.error(
      "Failed to load sleep entries:",
      error
    );

    return [];
  }
}

export async function saveSleepEntries(
  entries: SleepEntry[]
): Promise<boolean> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(entries)
    );

    return true;
  } catch (error) {
    console.error(
      "Failed to save sleep entries:",
      error
    );

    return false;
  }
}

export async function addSleepEntry(
  entry: SleepEntry
): Promise<SleepEntry[] | null> {
  try {
    const existingEntries =
      await getSleepEntries();

    const updatedEntries = [
      entry,
      ...existingEntries,
    ];

    const saved =
      await saveSleepEntries(
        updatedEntries
      );

    if (!saved) {
      return null;
    }

    return updatedEntries;
  } catch (error) {
    console.error(
      "Failed to add sleep entry:",
      error
    );

    return null;
  }
}

export async function deleteSleepEntry(
  entryId: string
): Promise<SleepEntry[] | null> {
  try {
    const existingEntries =
      await getSleepEntries();

    const updatedEntries =
      existingEntries.filter(
        (entry) => entry.id !== entryId
      );

    const saved =
      await saveSleepEntries(
        updatedEntries
      );

    if (!saved) {
      return null;
    }

    return updatedEntries;
  } catch (error) {
    console.error(
      "Failed to delete sleep entry:",
      error
    );

    return null;
  }
}