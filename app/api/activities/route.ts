import { canManageActivities, getLoggedInUser } from "@/lib/auth";
import { createActivity, getActivitiesWithTripLeader } from "@/lib/activities";

type CreateActivityRequestBody = {
  title?: string;
  activityType?: string;
  startAt?: string;
  endAt?: string;
  location?: string;
  summary?: string;
  maxParticipants?: number;
};

// Returns activities with the trip leader name included in each record.
export async function GET() {
  try {
    const activities = await getActivitiesWithTripLeader();
    return Response.json({ ok: true, activities });
  } catch {
    return Response.json({ error: "Unable to fetch activities." }, { status: 500 });
  }
}

// Creates a new activity; only Trip Leaders and Admins are allowed.
export async function POST(request: Request) {
  const user = await getLoggedInUser();

  if (!user) {
    return Response.json({ error: "You must be logged in." }, { status: 401 });
  }

  if (!canManageActivities(user.role)) {
    return Response.json({ error: "Only Trip Leaders or Admins can create activities." }, { status: 403 });
  }

  let body: CreateActivityRequestBody;
  try {
    body = (await request.json()) as CreateActivityRequestBody;
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  try {
    const activity = await createActivity({
      title: body.title ?? "",
      activityType: body.activityType ?? "",
      startAt: body.startAt ?? "",
      endAt: body.endAt ?? "",
      location: body.location ?? "",
      summary: body.summary ?? "",
      maxParticipants: body.maxParticipants ?? 0,
      tripLeaderId: user.id,
    });

    return Response.json({ ok: true, activityId: activity.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create activity.";
    return Response.json({ error: message }, { status: 400 });
  }
}
