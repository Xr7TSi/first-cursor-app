import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { randomBytes } from "node:crypto";
import clientPromise from "@/lib/mongodb";

const SESSION_COOKIE_NAME = "session_token";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
const DEFAULT_ROLE: UserRole = "Member";

export const USER_ROLES = ["Member", "TripLeader", "Admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const ROLE_RANK: Record<UserRole, number> = {
  Member: 1,
  TripLeader: 2,
  Admin: 3,
};

type UserDoc = {
  _id: ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
};

type SessionDoc = {
  _id?: ObjectId;
  token: string;
  userId: ObjectId;
  expiresAt: Date;
  createdAt: Date;
};

type ActivityDoc = {
  _id: ObjectId;
  participantIds: ObjectId[];
  waitlistIds: ObjectId[];
};

// Returns the default MongoDB database from the shared client.
async function getDb() {
  const client = await clientPromise;
  return client.db();
}

// Normalizes email input for consistent storage and lookups.
function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

// Converts stored role values into a known app role.
function toUserRole(role: string | undefined): UserRole {
  if (!role) return DEFAULT_ROLE;
  if (USER_ROLES.includes(role as UserRole)) return role as UserRole;
  return DEFAULT_ROLE;
}

// Checks whether the user's role meets or exceeds a minimum role.
export function hasRequiredRole(userRole: UserRole, minimumRole: UserRole) {
  return ROLE_RANK[userRole] >= ROLE_RANK[minimumRole];
}

// Returns true for users allowed to create/edit/delete activities.
export function canManageActivities(userRole: UserRole) {
  return hasRequiredRole(userRole, "TripLeader");
}

// Returns true for users allowed to assign roles.
export function canManageRoles(userRole: UserRole) {
  return hasRequiredRole(userRole, "Admin");
}

// Exposes the cookie key used to store the session token.
export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

// Converts the session lifetime to seconds for cookie maxAge.
export function getSessionDurationSeconds() {
  return Math.floor(SESSION_DURATION_MS / 1000);
}

// Validates signup input, hashes password, and creates a new user.
export async function createUser(params: {
  username: string;
  email: string;
  password: string;
}) {
  const username = params.username.trim();
  const email = normalizeEmail(params.email);
  const password = params.password;

  if (!username || !email || !password) {
    throw new Error("Username, email, and password are required.");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const db = await getDb();
  const users = db.collection<UserDoc>("users");

  const existingUser = await users.findOne({ email });
  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await users.insertOne({
    username,
    email,
    passwordHash,
    role: DEFAULT_ROLE,
    createdAt: new Date(),
  });

  return {
    userId: result.insertedId,
    username,
    role: DEFAULT_ROLE,
  };
}

// Verifies login credentials and returns basic user info on success.
export async function authenticateUser(emailInput: string, password: string) {
  const email = normalizeEmail(emailInput);
  const db = await getDb();
  const users = db.collection<UserDoc>("users");
  const user = await users.findOne({ email });

  if (!user) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return null;
  }

  return {
    userId: user._id,
    username: user.username,
    role: toUserRole(user.role),
  };
}

// Updates a user's role; intended for admin-only flows.
export async function setUserRole(userId: string, role: UserRole) {
  const db = await getDb();
  const users = db.collection<UserDoc>("users");
  await users.updateOne({ _id: new ObjectId(userId) }, { $set: { role } });
}

// Grants Admin role to the account that matches the provided email.
export async function addAdminByEmail(emailInput: string) {
  const email = normalizeEmail(emailInput);
  const db = await getDb();
  const users = db.collection<UserDoc>("users");
  const user = await users.findOne({ email });

  if (!user) {
    throw new Error("No user found with that email.");
  }

  if (toUserRole(user.role) === "Admin") {
    throw new Error("That user is already an Admin.");
  }

  await users.updateOne({ _id: user._id }, { $set: { role: "Admin" } });
}

// Removes Admin role from a user and sets their role back to Member.
export async function removeAdminByEmail(emailInput: string, actingAdminId: string) {
  const email = normalizeEmail(emailInput);
  const db = await getDb();
  const users = db.collection<UserDoc>("users");
  const user = await users.findOne({ email });

  if (!user) {
    throw new Error("No user found with that email.");
  }

  if (toUserRole(user.role) !== "Admin") {
    throw new Error("That user is not an Admin.");
  }

  if (user._id.toString() === actingAdminId) {
    throw new Error("You cannot remove your own Admin role.");
  }

  await users.updateOne({ _id: user._id }, { $set: { role: "Member" } });
}

// Removes a Member account and its active sessions from the database.
export async function removeMemberByEmail(emailInput: string) {
  const email = normalizeEmail(emailInput);
  const db = await getDb();
  const users = db.collection<UserDoc>("users");
  const sessions = db.collection<SessionDoc>("sessions");
  const activities = db.collection<ActivityDoc>("activities");
  const user = await users.findOne({ email });

  if (!user) {
    throw new Error("No user found with that email.");
  }

  if (toUserRole(user.role) !== "Member") {
    throw new Error("Only users with Member role can be removed here.");
  }

  await users.deleteOne({ _id: user._id });
  await sessions.deleteMany({ userId: user._id });
  await activities.updateMany(
    {},
    {
      $pull: {
        participantIds: user._id,
        waitlistIds: user._id,
      },
    },
  );
}

// Grants TripLeader role to the account that matches the provided email.
export async function addTripLeaderByEmail(emailInput: string) {
  const email = normalizeEmail(emailInput);
  const db = await getDb();
  const users = db.collection<UserDoc>("users");
  const user = await users.findOne({ email });

  if (!user) {
    throw new Error("No user found with that email.");
  }

  if (toUserRole(user.role) === "TripLeader") {
    throw new Error("That user is already a Trip Leader.");
  }

  if (toUserRole(user.role) === "Admin") {
    throw new Error("Admins already have Trip Leader permissions.");
  }

  await users.updateOne({ _id: user._id }, { $set: { role: "TripLeader" } });
}

// Removes TripLeader role from a user and sets their role back to Member.
export async function removeTripLeaderByEmail(emailInput: string) {
  const email = normalizeEmail(emailInput);
  const db = await getDb();
  const users = db.collection<UserDoc>("users");
  const user = await users.findOne({ email });

  if (!user) {
    throw new Error("No user found with that email.");
  }

  if (toUserRole(user.role) !== "TripLeader") {
    throw new Error("That user is not a Trip Leader.");
  }

  await users.updateOne({ _id: user._id }, { $set: { role: "Member" } });
}

// Creates a new session record and returns its token and expiry.
export async function createSession(userId: ObjectId) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const db = await getDb();
  const sessions = db.collection<SessionDoc>("sessions");

  await sessions.insertOne({
    token,
    userId,
    expiresAt,
    createdAt: new Date(),
  });

  return {
    token,
    expiresAt,
  };
}

// Deletes a session by token (used during logout/cleanup).
export async function deleteSession(token: string) {
  if (!token) return;
  const db = await getDb();
  const sessions = db.collection<SessionDoc>("sessions");
  await sessions.deleteOne({ token });
}

// Resolves the current user from the session cookie, if valid.
export async function getLoggedInUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const db = await getDb();
  const sessions = db.collection<SessionDoc>("sessions");
  const users = db.collection<UserDoc>("users");

  const session = await sessions.findOne({ token });
  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await sessions.deleteOne({ token });
    return null;
  }

  const user = await users.findOne({ _id: session.userId });
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: toUserRole(user.role),
  };
}
