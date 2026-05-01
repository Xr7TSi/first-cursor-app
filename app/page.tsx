import Link from "next/link";
import { getLoggedInUser } from "@/lib/auth";

export default async function Home() {
  const user = await getLoggedInUser();

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <main className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-10 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <h1 className="text-3xl font-semibold">Welcome</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          Start by creating an account or logging in.
        </p>

        {user ? (
          <div className="mt-8 space-y-4">
            <p className="text-lg">
              Hi {user.username}
            </p>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="rounded-full bg-black px-5 py-2 text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Logout
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-8 flex gap-3">
            <Link
              href="/login"
              className="rounded-full bg-black px-5 py-2 text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-black/20 px-5 py-2 transition hover:bg-zinc-100 dark:border-white/30 dark:hover:bg-zinc-800"
            >
              Sign up
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
