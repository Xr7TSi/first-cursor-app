import { canManageRoles, getLoggedInUser, removeMemberByEmail } from "@/lib/auth";

// Removes a Member account identified by email.
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
    await removeMemberByEmail(email);
    return Response.redirect(new URL("/admin/users?success=Member%20removed", request.url), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not remove member.";
    return Response.redirect(
      new URL(`/admin/users?error=${encodeURIComponent(message)}`, request.url),
      303,
    );
  }
}
