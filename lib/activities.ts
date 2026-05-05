import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

import { ACTIVITY_TYPES, type ActivityType } from "@/lib/activity-types";

type ActivityDoc = {
  _id?: ObjectId;
  title: string;
  activityType: ActivityType;
  startAt: Date;
  endAt: Date;
  location: string;
  summary: string;
  maxParticipants: number;
  tripLeaderId: ObjectId;
  participantIds: ObjectId[];
  waitlistIds: ObjectId[];
  createdAt: Date;
};

export type ActivityCard = {
  id: string;
  title: string;
  activityType: ActivityType;
  dateLabel: string;
  timeLabel: string;
  location: string;
  summary: string;
  maxParticipants: number;
};

export type CreateActivityInput = {
  title: string;
  activityType: string;
  startAt: string;
  endAt: string;
  location: string;
  summary: string;
  maxParticipants: number;
  tripLeaderId: string;
};

// Returns the default MongoDB database from the shared client.
async function getDb() {
  const client = await clientPromise;
  return client.db();
}

// Formats a date into a short weekday/month/day label for the timeline.
function formatDateLabel(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(value);
}

// Formats event start/end times in a simple local time range.
function formatTimeLabel(startAt: Date, endAt: Date) {
  const start = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(startAt);

  const end = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(endAt);

  return `${start} - ${end}`;
}

// Converts an activity document into the UI card shape.
function toActivityCard(activity: ActivityDoc): ActivityCard {
  return {
    id: activity._id!.toString(),
    title: activity.title,
    activityType: activity.activityType,
    dateLabel: formatDateLabel(activity.startAt),
    timeLabel: formatTimeLabel(activity.startAt, activity.endAt),
    location: activity.location,
    summary: activity.summary,
    maxParticipants: activity.maxParticipants,
  };
}

// Reads future activities sorted by start time for the home page.
export async function getUpcomingActivityCards(limit = 20) {
  const db = await getDb();
  const activities = db.collection<ActivityDoc>("activities");

  const upcoming = await activities
    .find({ startAt: { $gte: new Date() } })
    .sort({ startAt: 1 })
    .limit(limit)
    .toArray();

  return upcoming.map(toActivityCard);
}

// Validates and inserts a new activity document in MongoDB.
export async function createActivity(input: CreateActivityInput) {
  const title = input.title.trim();
  const activityType = input.activityType.trim();
  const location = input.location.trim();
  const summary = input.summary.trim();
  const startAt = new Date(input.startAt);
  const endAt = new Date(input.endAt);
  const maxParticipants = Number(input.maxParticipants);

  if (!title || !activityType || !location || !summary) {
    throw new Error("Title, activity type, location, and summary are required.");
  }

  if (!ACTIVITY_TYPES.includes(activityType as ActivityType)) {
    throw new Error("Activity type is invalid.");
  }

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    throw new Error("Start and end times must be valid dates.");
  }

  if (endAt <= startAt) {
    throw new Error("End time must be after start time.");
  }

  if (!Number.isInteger(maxParticipants) || maxParticipants < 1) {
    throw new Error("Max participants must be a whole number greater than 0.");
  }

  const db = await getDb();
  const activities = db.collection<ActivityDoc>("activities");

  const result = await activities.insertOne({
    title,
    activityType: activityType as ActivityType,
    startAt,
    endAt,
    location,
    summary,
    maxParticipants,
    tripLeaderId: new ObjectId(input.tripLeaderId),
    participantIds: [] as ObjectId[],
    waitlistIds: [] as ObjectId[],
    createdAt: new Date(),
  });

  return { id: result.insertedId.toString() };
}
