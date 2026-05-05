import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getLoggedInUser } from "@/lib/auth";
import { cancelSignupForActivity } from "@/lib/activities";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// Cancels the logged-in user's signup for an activity.
export async function POST(request: Request, context: RouteContext) {
  const redirectTo = request.headers.get("referer") ?? "/";
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { id } = await context.params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  try {
    await cancelSignupForActivity(id, user.id);
  } catch {
    // Keep UX simple for form posts: return user to page even on validation errors.
  }

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
