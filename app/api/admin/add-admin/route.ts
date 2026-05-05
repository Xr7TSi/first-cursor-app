import { addAdminByEmail, canManageRoles, getLoggedInUser } from "@/lib/auth";

// Adds Admin role to a user identified by email.
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
    await addAdminByEmail(email);
    return Response.redirect(new URL("/admin/users?success=Admin%20added", request.url), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not add admin.";
    return Response.redirect(
      new URL(`/admin/users?error=${encodeURIComponent(message)}`, request.url),
      303,
    );
  }
}
