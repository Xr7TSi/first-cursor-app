import Link from "next/link";
import { canManageRoles, getLoggedInUser } from "@/lib/auth";

type AdminUsersPageProps = {
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  // Resolves auth/session before showing admin-only controls.
  const currentUser = await getLoggedInUser();
  const params = await searchParams;

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
          <h1 className="text-xl font-semibold">Admin only</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Only Admin users can access these controls.
          </p>
          <Link href="/" className="mt-4 inline-block underline">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
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
          Use these forms to manage Admin and Trip Leader roles, and remove Member accounts.
        </p>

        {params.success ? (
          <p className="mt-4 rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
            {params.success}
          </p>
        ) : null}

        {params.error ? (
          <p className="mt-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {params.error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/admin/users/members"
            className="rounded-full border border-black/20 px-4 py-2 text-sm transition hover:bg-zinc-100 dark:border-white/30 dark:hover:bg-zinc-800"
          >
            See All Members
          </Link>
          <Link
            href="/admin/users/trip-leaders"
            className="rounded-full border border-black/20 px-4 py-2 text-sm transition hover:bg-zinc-100 dark:border-white/30 dark:hover:bg-zinc-800"
          >
            See All Trip Leaders
          </Link>
          <Link
            href="/admin/users/admins"
            className="rounded-full border border-black/20 px-4 py-2 text-sm transition hover:bg-zinc-100 dark:border-white/30 dark:hover:bg-zinc-800"
          >
            See All Admins
          </Link>
        </div>

        <div className="mt-6 space-y-6">
          <form action="/api/admin/add-admin" method="post" className="space-y-2">
            <label htmlFor="add-admin-email" className="block text-sm font-medium">
              Add admin (email)
            </label>
            <div className="flex gap-2">
              <input
                id="add-admin-email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 outline-none focus:border-black dark:border-white/30 dark:focus:border-white"
              />
              <button type="submit" className="rounded-full bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black">
                Add admin
              </button>
            </div>
          </form>

          <form action="/api/admin/remove-admin" method="post" className="space-y-2">
            <label htmlFor="remove-admin-email" className="block text-sm font-medium">
              Remove admin (email)
            </label>
            <div className="flex gap-2">
              <input
                id="remove-admin-email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 outline-none focus:border-black dark:border-white/30 dark:focus:border-white"
              />
              <button type="submit" className="rounded-full border border-black/20 px-4 py-2 text-sm dark:border-white/30">
                Remove admin
              </button>
            </div>
          </form>

          <form action="/api/admin/add-trip-leader" method="post" className="space-y-2">
            <label htmlFor="add-trip-leader-email" className="block text-sm font-medium">
              Add Trip Leader (email)
            </label>
            <div className="flex gap-2">
              <input
                id="add-trip-leader-email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 outline-none focus:border-black dark:border-white/30 dark:focus:border-white"
              />
              <button type="submit" className="rounded-full bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black">
                Add Trip Leader
              </button>
            </div>
          </form>

          <form action="/api/admin/remove-trip-leader" method="post" className="space-y-2">
            <label htmlFor="remove-trip-leader-email" className="block text-sm font-medium">
              Remove Trip Leader (email)
            </label>
            <div className="flex gap-2">
              <input
                id="remove-trip-leader-email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 outline-none focus:border-black dark:border-white/30 dark:focus:border-white"
              />
              <button type="submit" className="rounded-full border border-black/20 px-4 py-2 text-sm dark:border-white/30">
                Remove Trip Leader
              </button>
            </div>
          </form>

          <form action="/api/admin/remove-member" method="post" className="space-y-2">
            <label htmlFor="remove-member-email" className="block text-sm font-medium">
              Remove member (email)
            </label>
            <div className="flex gap-2">
              <input
                id="remove-member-email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 outline-none focus:border-black dark:border-white/30 dark:focus:border-white"
              />
              <button
                type="submit"
                className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700 dark:border-red-700 dark:text-red-300"
              >
                Remove member
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
