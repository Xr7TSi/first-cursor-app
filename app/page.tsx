import Link from "next/link";
import { canManageActivities, canManageRoles, getLoggedInUser } from "@/lib/auth";
import { getSignedUpActivityCards, getUpcomingActivityCards } from "@/lib/activities";
import ConfirmActionForm from "@/app/components/confirm-action-form";

// Roughly how many activity cards stay visible before scrolling (mobile-friendly).
const VISIBLE_ACTIVITY_SLOTS = 4;

export default async function Home() {
  // Reads the signed-in user (if any) to render auth actions in the header.
  const user = await getLoggedInUser();
  // Loads upcoming activities from MongoDB for the timeline cards.
  const upcomingEvents = await getUpcomingActivityCards(20, user?.id);
  const myActivities = user ? await getSignedUpActivityCards(user.id) : [];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-white/95 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-zinc-900/95">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Outdoor Club
            </p>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <p className="text-sm">Hi {user.username}</p>
              {canManageRoles(user.role) ? (
                <Link
                  href="/admin/users"
                  className="rounded-full border border-black/20 px-3 py-1.5 text-sm transition hover:bg-zinc-100 dark:border-white/30 dark:hover:bg-zinc-800"
                >
                  User management
                </Link>
              ) : null}
              {canManageActivities(user.role) ? (
                <Link
                  href="/activities/new"
                  className="rounded-full bg-black px-3 py-1.5 text-sm text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  Create Activity
                </Link>
              ) : null}
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="rounded-full border border-black/20 px-3 py-1.5 text-sm transition hover:bg-zinc-100 dark:border-white/30 dark:hover:bg-zinc-800"
                >
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <nav className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full border border-black/20 px-3 py-1.5 text-sm transition hover:bg-zinc-100 dark:border-white/30 dark:hover:bg-zinc-800"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-black px-3 py-1.5 text-sm text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Sign up
              </Link>
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        {user ? (
          <section className="mb-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900 sm:p-6">
            <h1 className="text-lg font-semibold">My Activities</h1>
            {myActivities.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                You are not signed up for any activities yet.
              </p>
            ) : (
              <div
                className="mt-4 overflow-y-auto pr-2"
                style={{ maxHeight: `${VISIBLE_ACTIVITY_SLOTS * 9}rem` }}
              >
                <ul className="space-y-3">
                  {myActivities.map((activity) => (
                    <li
                      key={activity.id}
                      className="rounded-lg border border-black/10 p-3 dark:border-white/10"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        {activity.dateLabel}
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                        {activity.timeLabel}
                      </p>
                      <p className="mt-1 text-sm font-semibold">{activity.title}</p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Trip Leader: {activity.tripLeaderName}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {activity.spotsFilled} of {activity.maxParticipants} spots filled
                      </p>
                      <div className="mt-2">
                        <ConfirmActionForm
                          action={`/api/activities/${activity.id}/cancel-signup`}
                          buttonLabel="Cancel Sign Up"
                          confirmMessage="Are you sure you want to cancel this signup?"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ) : null}

        <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900 sm:p-6">
          <h1 className="text-lg font-semibold">Upcoming Activities</h1>

          {upcomingEvents.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
              No upcoming activities yet. Once Trip Leaders add events, they will appear here.
            </p>
          ) : (
            <>
              {/* Scrollable area: shows ~4 cards on a typical phone; scrollbar for the rest. */}
              <div
                className="mt-6 overflow-y-auto pr-2"
                style={{ maxHeight: `${VISIBLE_ACTIVITY_SLOTS * 9}rem` }}
              >
                <ol className="space-y-6 border-l border-zinc-300 pl-5 dark:border-zinc-700">
                  {upcomingEvents.map((event) => (
                    <li key={event.id} className="relative">
                      <span className="absolute -left-[1.72rem] top-1.5 h-3.5 w-3.5 rounded-full border border-white bg-zinc-700 dark:border-zinc-900 dark:bg-zinc-200" />
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        {event.dateLabel}
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                        {event.timeLabel}
                      </p>
                      <p className="mt-1 inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                        {event.activityType}
                      </p>
                      <h2 className="mt-2 text-lg font-semibold">{event.title}</h2>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{event.location}</p>
                      <p className="mt-2 text-sm">{event.summary}</p>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                        Trip Leader: {event.tripLeaderName}
                      </p>
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {event.spotsFilled} of {event.maxParticipants} spots filled
                      </p>
                      {user ? (
                        <form action={`/api/activities/${event.id}/signup`} method="post" className="mt-2">
                          <button
                            type="submit"
                            disabled={event.isFull || event.isSignedUp}
                            className="rounded-full bg-black px-4 py-1.5 text-xs text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                          >
                            {event.isSignedUp ? "Signed Up" : event.isFull ? "Full" : "Sign Up"}
                          </button>
                        </form>
                      ) : (
                        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                          Log in to sign up.
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
