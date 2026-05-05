import Link from "next/link";
import { canManageRoles, getLoggedInUser, listUsersByRole, type UserRole } from "@/lib/auth";

type GroupPageProps = {
  params: Promise<{ group: string }>;
};

const groupMap: Record<string, { role: UserRole; heading: string }> = {
  members: { role: "Member", heading: "All Members" },
  "trip-leaders": { role: "TripLeader", heading: "All Trip Leaders" },
  admins: { role: "Admin", heading: "All Admins" },
};

export default async function UserGroupPage({ params }: GroupPageProps) {
  // Resolves auth/session and route params before loading role-based user lists.
  const currentUser = await getLoggedInUser();
  const { group } = await params;
  const config = groupMap[group];

  if (!currentUser) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-10">
        <div className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold">Login required</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            You must be logged in to view user lists.
          </p>
          <Link href="/login" className="mt-4 inline-block underline">
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  if (!canManageRoles(currentUser.role)) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-10">
        <div className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold">Admin only</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Only Admin users can view role group lists.
          </p>
          <Link href="/" className="mt-4 inline-block underline">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  if (!config) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-10">
        <div className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold">Unknown group</h1>
          <Link href="/admin/users" className="mt-4 inline-block underline">
            Back to user management
          </Link>
        </div>
      </main>
    );
  }

  const users = await listUsersByRole(config.role);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-4">
          <Link
            href="/admin/users"
            className="inline-block rounded-full border border-black/20 px-4 py-2 text-sm transition hover:bg-zinc-100 dark:border-white/30 dark:hover:bg-zinc-800"
          >
            Back
          </Link>
        </div>

        <h1 className="text-2xl font-semibold">{config.heading}</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Username and email list for the {config.role} role.
        </p>

        {users.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-zinc-300 p-3 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
            No users found in this group.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {users.map((user) => (
              <li
                key={user.id}
                className="rounded-lg border border-black/10 px-4 py-3 dark:border-white/10"
              >
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">{user.email}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
