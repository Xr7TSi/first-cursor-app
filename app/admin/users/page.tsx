import Link from "next/link";
import { canManageRoles, getLoggedInUser, listUsersByRole } from "@/lib/auth";
import UserManagementClient from "@/app/admin/users/user-management-client";

export default async function AdminUsersPage() {
  // Resolves auth/session before showing admin-only controls.
  const currentUser = await getLoggedInUser();

  if (!currentUser) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-10">
        <div className="rounded-2xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold">Login required</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            You must be logged in to manage user roles.
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
          <h1 className="text-xl font-semibold">Restricted</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Only Admin and Owner users can access these controls.
          </p>
          <Link href="/" className="mt-4 inline-block underline">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  const [owners, admins, tripLeaders, members] = await Promise.all([
    listUsersByRole("Owner"),
    listUsersByRole("Admin"),
    listUsersByRole("TripLeader"),
    listUsersByRole("Member"),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-block rounded-full border border-black/20 px-4 py-2 text-sm transition hover:bg-zinc-100 dark:border-white/30 dark:hover:bg-zinc-800"
          >
            Home
          </Link>
        </div>
        <h1 className="text-2xl font-semibold">User management</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Manage roles in columns, remove users inline, and search quickly by username or email.
        </p>
        <UserManagementClient
          currentUserRole={currentUser.role}
          owners={owners}
          admins={admins}
          tripLeaders={tripLeaders}
          members={members}
        />
      </section>
    </main>
  );
}
