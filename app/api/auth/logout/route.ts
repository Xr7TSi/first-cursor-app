import { NextResponse } from "next/server";
import { deleteSession, getSessionCookieName } from "@/lib/auth";

export async function POST(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${getSessionCookieName()}=`))
    ?.replace(`${getSessionCookieName()}=`, "");

  if (token) {
    await deleteSession(token);
  }

  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  response.cookies.set({
    name: getSessionCookieName(),
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
