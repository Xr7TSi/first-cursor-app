export const ACTIVITY_TYPES = [
  "Mountain Biking",
  "Road Cycling",
  "Path Cycling",
  "Hiking",
  "Backpacking",
  "Running",
  "Camping",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

