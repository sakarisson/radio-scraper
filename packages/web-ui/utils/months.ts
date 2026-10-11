export function getLastCompletedMonth() {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed, so this is already "previous month"
  if (month === 0) {
    return { year: now.getFullYear() - 1, month: 12 };
  }
  return { year: now.getFullYear(), month };
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
