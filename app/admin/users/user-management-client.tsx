"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ManagedUser } from "@/lib/auth";

type AdminAction =
  | "addAdmin"
  | "removeAdmin"
  | "addTripLeader"
  | "removeTripLeader"
  | "addMember"
  | "removeMember";

type UserManagementClientProps = {
  admins: ManagedUser[];
  tripLeaders: ManagedUser[];
  members: ManagedUser[];
};

type RoleColumnProps = {
  title: string;
  createLabel: string;
  users: ManagedUser[];
  addAction: AdminAction;
  removeAction: AdminAction;
  addButtonLabel: string;
  removeButtonLabel: string;
  removeConfirmMessage: string;
  onAction: (action: AdminAction, email: string, options?: { confirmMessage?: string }) => Promise<void>;
};

const MOBILE_VISIBLE_USERS = 6;

// Renders one role column with add input and remove buttons.
function RoleColumn({
  title,
  createLabel,
  users,
  addAction,
  removeAction,
  addButtonLabel,
  removeButtonLabel,
  removeConfirmMessage,
  onAction,
}: RoleColumnProps) {
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  // Highlights users whose username/email matches this column's search text.
  const highlightedUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return users.map((user) => ({ user, isMatch: false }));
    }

    return users.map((user) => ({
      user,
      isMatch:
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    }));
  }, [users, search]);

  // Keeps the first search match visible by scrolling it into view.
  useEffect(() => {
    const firstMatch = highlightedUsers.find((entry) => entry.isMatch);
    if (!firstMatch || !search.trim()) return;

    const listElement = itemRefs.current[firstMatch.user.id];
    const listContainer = listContainerRef.current;
    if (!listElement || !listContainer) return;

    listElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightedUsers, search]);

  return (
    <section className="rounded-xl border border-black/10 p-4 dark:border-white/10">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{users.length} users</p>

      <div className="mt-3 space-y-1">
        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
          Search {title}
        </label>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={`Search ${title.toLowerCase()}`}
          className="w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:border-white/30 dark:focus:border-white"
        />
      </div>

      <div className="mt-3 flex gap-2">
        <div className="w-full">
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-300">
            {createLabel}
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="user@email.com"
              className="w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:border-white/30 dark:focus:border-white"
            />
            <button
              type="button"
              onClick={async () => {
                await onAction(addAction, email);
                setEmail("");
              }}
              className="rounded-full bg-black px-3 py-2 text-xs text-white dark:bg-white dark:text-black"
            >
              {addButtonLabel}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-dashed border-black/20 pt-4 dark:border-white/20">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Current {title}
        </p>
        <div
          ref={listContainerRef}
          className="overflow-y-auto pr-1"
          style={{ maxHeight: `${MOBILE_VISIBLE_USERS * 4.5}rem` }}
        >
          <ul className="space-y-2">
          {highlightedUsers.map(({ user, isMatch }) => (
            <li
              key={user.id}
              ref={(element) => {
                itemRefs.current[user.id] = element;
              }}
              className={`flex items-start justify-between gap-2 rounded-lg border px-3 py-2 ${
                isMatch
                  ? "border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/30"
                  : "border-black/10 dark:border-white/10"
              }`}
            >
              <div>
                <p className="text-sm font-medium">{user.username}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-300">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  onAction(removeAction, user.email, {
                    confirmMessage: removeConfirmMessage.replace("{email}", user.email),
                  })
                }
                className="rounded-full border border-red-300 px-2.5 py-1 text-xs text-red-700 dark:border-red-700 dark:text-red-300"
              >
                {removeButtonLabel}
              </button>
            </li>
          ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function UserManagementClient({
  admins,
  tripLeaders,
  members,
}: UserManagementClientProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sends an admin action request then refreshes server-rendered lists.
  async function handleAction(
    action: AdminAction,
    email: string,
    options?: { confirmMessage?: string },
  ) {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter an email first.");
      setSuccessMessage(null);
      return;
    }

    if (options?.confirmMessage && !window.confirm(options.confirmMessage)) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/admin/manage-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, email: cleanEmail }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setErrorMessage(payload.error ?? "Request failed.");
        return;
      }

      setSuccessMessage("Update successful.");
      router.refresh();
    } catch {
      setErrorMessage("Unable to complete the request right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-4">
      {successMessage ? (
        <p className="mb-3 rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
          {successMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="mb-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <RoleColumn
          title="Admins"
          createLabel="Create Admin"
          users={admins}
          addAction="addAdmin"
          removeAction="removeAdmin"
          addButtonLabel="Add"
          removeButtonLabel="Remove"
          removeConfirmMessage="Are you sure you want to remove Admin role from {email}?"
          onAction={handleAction}
        />
        <RoleColumn
          title="Trip Leaders"
          createLabel="Create Trip Leader"
          users={tripLeaders}
          addAction="addTripLeader"
          removeAction="removeTripLeader"
          addButtonLabel="Add"
          removeButtonLabel="Remove"
          removeConfirmMessage="Are you sure you want to remove Trip Leader role from {email}?"
          onAction={handleAction}
        />
        <RoleColumn
          title="Members"
          createLabel="Create Member"
          users={members}
          addAction="addMember"
          removeAction="removeMember"
          addButtonLabel="Add"
          removeButtonLabel="Delete"
          removeConfirmMessage="Are you sure you want to delete member account {email}?"
          onAction={handleAction}
        />
      </div>

      {isSubmitting ? (
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Applying changes...</p>
      ) : null}
    </div>
  );
}
