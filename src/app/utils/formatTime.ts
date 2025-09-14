/**
 * Formats time in seconds to "minutes:seconds" format
 * @param time Time in seconds
 * @returns Formatted time string (e.g. "3:45")
 */
export function formatTime(time: number): string {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
} 