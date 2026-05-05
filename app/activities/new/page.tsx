import Link from "next/link";
import { canManageActivities, getLoggedInUser } from "@/lib/auth";
import CreateActivityForm from "@/app/activities/new/create-activity-form";

export default async function CreateActivityPage() {
  // Reads user/session so activity creation is restricted by role.
  const user = await getLoggedInUser();

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-10">
        <div className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold">Login required</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            You must be logged in to create activities.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-full bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
          >
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  if (!canManageActivities(user.role)) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-10">
        <div className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold">Insufficient permissions</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Only Trip Leaders and Admins can create activities.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full border border-black/20 px-4 py-2 text-sm dark:border-white/30"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold">Create Activity</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Add a new event for members to view and join.
        </p>
        <CreateActivityForm />
      </div>
    </main>
  );
}
