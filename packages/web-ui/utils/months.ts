import { faroeParts } from "./time";

/** The current month in Faroese time. */
export function getCurrentMonth() {
  const { year, month } = faroeParts(new Date());
  return { year, month };
}

export function getLastCompletedMonth() {
  const { year, month } = getCurrentMonth();
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
