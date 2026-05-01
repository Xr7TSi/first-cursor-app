import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { randomBytes } from "node:crypto";
import clientPromise from "@/lib/mongodb";

const SESSION_COOKIE_NAME = "session_token";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

type UserDoc = {
  _id: ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

type SessionDoc = {
  _id?: ObjectId;
  token: string;
  userId: ObjectId;
  expiresAt: Date;
  createdAt: Date;
};

async function getDb() {
  const client = await clientPromise;
  return client.db();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function getSessionDurationSeconds() {
  return Math.floor(SESSION_DURATION_MS / 1000);
}

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
    createdAt: new Date(),
  });

  return {
    userId: result.insertedId,
    username,
  };
}

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
  };
}

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

export async function deleteSession(token: string) {
  if (!token) return;
  const db = await getDb();
  const sessions = db.collection<SessionDoc>("sessions");
  await sessions.deleteOne({ token });
}

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
  };
}
