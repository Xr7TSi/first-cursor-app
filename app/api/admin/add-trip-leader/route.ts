import { addTripLeaderByEmail, canManageRoles, getLoggedInUser } from "@/lib/auth";

// Grants TripLeader role to the user with the provided email.
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
    await addTripLeaderByEmail(email);
    return Response.redirect(new URL("/admin/users?success=Trip%20Leader%20added", request.url), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not add Trip Leader.";
    return Response.redirect(
      new URL(`/admin/users?error=${encodeURIComponent(message)}`, request.url),
      303,
    );
  }
}
