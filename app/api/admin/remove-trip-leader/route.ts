import { canManageRoles, getLoggedInUser, removeTripLeaderByEmail } from "@/lib/auth";

// Removes TripLeader role from the user with the provided email.
export async function POST(request: Request) {
  const currentUser = await getLoggedInUser();

  if (!currentUser) {
    return Response.redirect(new URL("/login", request.url), 303);
  }

  if (!canManageRoles(currentUser.role)) {
    return Response.redirect(new URL("/admin/users?error=Not%20authorized", request.url), 303);
  }

  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");

  try {
    await removeTripLeaderByEmail(email);
    return Response.redirect(new URL("/admin/users?success=Trip%20Leader%20removed", request.url), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not remove Trip Leader.";
    return Response.redirect(
      new URL(`/admin/users?error=${encodeURIComponent(message)}`, request.url),
      303,
    );
  }
}
