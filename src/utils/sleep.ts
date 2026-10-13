export function calculateSleepDuration(
  bedtime: Date,
  wakeTime: Date
): number {
  let difference =
    wakeTime.getTime() - bedtime.getTime();

  // If wake-up time is earlier than or equal to
  // bedtime, assume the user woke up the next day.
  if (difference <= 0) {
    difference += 24 * 60 * 60 * 1000;
  }

  return Math.round(
    difference / (1000 * 60)
  );
}

export function formatDuration(
  totalMinutes: number
): string {
  const hours = Math.floor(
    totalMinutes / 60
  );

  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}