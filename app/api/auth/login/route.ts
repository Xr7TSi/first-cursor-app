import { NextResponse } from "next/server";
import {
  authenticateUser,
  createSession,
  getSessionCookieName,
  getSessionDurationSeconds,
} from "@/lib/auth";

function redirectWithError(requestUrl: string, path: string, message: string) {
  const url = new URL(path, requestUrl);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return redirectWithError(request.url, "/login", "Email and password are required.");
  }

  const user = await authenticateUser(email, password);
  if (!user) {
    return redirectWithError(request.url, "/login", "Invalid email or password.");
  }

  const session = await createSession(user.userId);
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });

  response.cookies.set({
    name: getSessionCookieName(),
    value: session.token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionDurationSeconds(),
  });

  return response;
}
