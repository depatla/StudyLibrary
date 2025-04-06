import { DateTime } from "luxon";

export function getDaysDifference(dateStr: string | undefined): number {
  if (!dateStr) return 0;
  // Parse the input date from an ISO string
  const inputDate = DateTime.fromISO(dateStr);

  // Get the current date and time
  const currentDate = DateTime.now();

  // Calculate the difference in days
  const diff = inputDate.diff(currentDate, "days").days;

  // Optionally, round the difference if an integer value is preferred
  return Math.floor(diff);
}
