import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getLoggedInUser } from "@/lib/auth";
import { signupForActivity } from "@/lib/activities";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// Signs up the logged-in user for a future activity when capacity allows.
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
    await signupForActivity(id, user.id);
  } catch {
    // Keep UX simple for form posts: return user to page even on validation errors.
  }

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
