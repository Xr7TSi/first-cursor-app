import Link from "next/link";
import { canManageActivities, canManageRoles, getLoggedInUser } from "@/lib/auth";
import { getUpcomingActivityCards } from "@/lib/activities";

// Roughly how many activity cards stay visible before scrolling (mobile-friendly).
const VISIBLE_ACTIVITY_SLOTS = 4;

export default async function Home() {
  // Reads the signed-in user (if any) to render auth actions in the header.
  const user = await getLoggedInUser();
  // Loads upcoming activities from MongoDB for the timeline cards.
  const upcomingEvents = await getUpcomingActivityCards();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-white/95 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-zinc-900/95">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Outdoor Club
            </p>
            <h1 className="text-lg font-semibold">Upcoming Activities</h1>
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
        <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900 sm:p-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            A mobile-friendly vertical calendar view of planned club events.
          </p>

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
                      <h2 className="mt-1 text-lg font-semibold">{event.title}</h2>
                      <p className="mt-1 inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                        {event.activityType}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300">{event.timeLabel}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300">{event.location}</p>
                      <p className="mt-2 text-sm">{event.summary}</p>
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        Capacity: {event.maxParticipants}
                      </p>
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
