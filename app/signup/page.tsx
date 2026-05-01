import Link from "next/link";
import PasswordField from "@/app/components/password-field";

type SignupPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <main className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Use at least 8 characters for your password.
        </p>

        {params.error ? (
          <p className="mt-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {params.error}
          </p>
        ) : null}

        <form action="/api/auth/signup" method="post" className="mt-6 space-y-4">
          <div className="space-y-1">
            <label htmlFor="username" className="block text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 outline-none focus:border-black dark:border-white/30 dark:focus:border-white"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 outline-none focus:border-black dark:border-white/30 dark:focus:border-white"
            />
          </div>

          <PasswordField id="password" minLength={8} autoComplete="new-password" />

          <button
            type="submit"
            className="w-full rounded-full bg-black px-4 py-2 text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Sign up
          </button>
        </form>

        <p className="mt-5 text-sm text-zinc-600 dark:text-zinc-300">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Login
          </Link>
        </p>
      </main>
    </div>
  );
}
