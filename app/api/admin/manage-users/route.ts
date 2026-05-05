import {
  addAdminByEmail,
  addMemberByEmail,
  addTripLeaderByEmail,
  canManageRoles,
  getLoggedInUser,
  removeAdminByEmail,
  removeMemberByEmail,
  removeTripLeaderByEmail,
} from "@/lib/auth";

type AdminAction =
  | "addAdmin"
  | "removeAdmin"
  | "addTripLeader"
  | "removeTripLeader"
  | "addMember"
  | "removeMember";

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

  try {
    if (action === "addAdmin") await addAdminByEmail(email);
    if (action === "removeAdmin") await removeAdminByEmail(email, currentUser.id);
    if (action === "addTripLeader") await addTripLeaderByEmail(email);
    if (action === "removeTripLeader") await removeTripLeaderByEmail(email);
    if (action === "addMember") await addMemberByEmail(email, currentUser.id);
    if (action === "removeMember") await removeMemberByEmail(email);

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed.";
    return Response.json({ error: message }, { status: 400 });
  }
}
