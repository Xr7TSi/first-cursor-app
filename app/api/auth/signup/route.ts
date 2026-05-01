import { NextResponse } from "next/server";
import { createSession, createUser, getSessionCookieName, getSessionDurationSeconds } from "@/lib/auth";

function redirectWithError(requestUrl: string, path: string, message: string) {
  const url = new URL(path, requestUrl);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  try {
    const user = await createUser({ username, email, password });
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup failed.";
    return redirectWithError(request.url, "/signup", message);
  }
}
