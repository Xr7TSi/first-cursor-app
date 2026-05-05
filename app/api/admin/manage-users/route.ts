import {
  addAdminByEmail,
  addMemberByEmail,
  addTripLeaderByEmail,
  canManageAdmins,
  canManageRoles,
  getLoggedInUser,
  removeAdminByEmail,
  transferOwnershipByEmail,
} from "@/lib/auth";

type AdminAction =
  | "addAdmin"
  | "addTripLeader"
  | "addMember"
  | "removeAdmin"
  | "transferOwner";

type RequestBody = {
  action?: AdminAction;
  email?: string;
};

// Handles admin role/member management actions from the dashboard UI.
export async function POST(request: Request) {
  const currentUser = await getLoggedInUser();

  if (!currentUser) {
    return Response.json({ error: "You must be logged in." }, { status: 401 });
  }

  if (!canManageRoles(currentUser.role)) {
    return Response.json({ error: "Only admins can manage users." }, { status: 403 });
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const action = body.action;
  const email = body.email ?? "";

  if (!action || !email) {
    return Response.json({ error: "Action and email are required." }, { status: 400 });
  }

  if ((action === "removeAdmin" || action === "transferOwner") && !canManageAdmins(currentUser.role)) {
    return Response.json({ error: "Only the Owner can perform that action." }, { status: 403 });
  }

  try {
    if (action === "addAdmin") await addAdminByEmail(email);
    if (action === "addTripLeader") await addTripLeaderByEmail(email);
    if (action === "addMember") await addMemberByEmail(email, currentUser.id);
    if (action === "removeAdmin") await removeAdminByEmail(email, currentUser.id);
    if (action === "transferOwner") await transferOwnershipByEmail(currentUser.id, email);

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed.";
    return Response.json({ error: message }, { status: 400 });
  }
}
