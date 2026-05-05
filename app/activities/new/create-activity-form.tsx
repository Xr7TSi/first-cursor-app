"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ACTIVITY_TYPES } from "@/lib/activity-types";

type FormState = {
  title: string;
  activityType: string;
  startAt: string;
  endAt: string;
  location: string;
  summary: string;
  maxParticipants: string;
};

const initialState: FormState = {
  title: "",
  activityType: ACTIVITY_TYPES[0],
  startAt: "",
  endAt: "",
  location: "",
  summary: "",
  maxParticipants: "12",
};

export default function CreateActivityForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sends validated form data to the activities API and returns home on success.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          activityType: form.activityType,
          startAt: form.startAt,
          endAt: form.endAt,
          location: form.location,
          summary: form.summary,
          maxParticipants: Number(form.maxParticipants),
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setErrorMessage(payload.error ?? "Unable to create activity.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setErrorMessage("Unable to create activity right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="space-y-1">
        <label htmlFor="title" className="block text-sm font-medium">
          Activity title
        </label>
        <input
          id="title"
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          required
          className="w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 outline-none focus:border-black dark:border-white/30 dark:focus:border-white"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="activityType" className="block text-sm font-medium">
          Activity type
        </label>
        <select
          id="activityType"
          value={form.activityType}
          onChange={(event) =>
            setForm((current) => ({ ...current, activityType: event.target.value }))
          }
          className="w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 outline-none focus:border-black dark:border-white/30 dark:focus:border-white"
        >
          {ACTIVITY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="startAt" className="block text-sm font-medium">
            Start time
          </label>
          <input
            id="startAt"
            type="datetime-local"
            value={form.startAt}
            onChange={(event) => setForm((current) => ({ ...current, startAt: event.target.value }))}
            required
            className="w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 outline-none focus:border-black dark:border-white/30 dark:focus:border-white"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="endAt" className="block text-sm font-medium">
            End time
          </label>
          <input
            id="endAt"
            type="datetime-local"
            value={form.endAt}
            onChange={(event) => setForm((current) => ({ ...current, endAt: event.target.value }))}
            required
            className="w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 outline-none focus:border-black dark:border-white/30 dark:focus:border-white"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="location" className="block text-sm font-medium">
          Location
        </label>
        <input
          id="location"
          value={form.location}
          onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
          required
          className="w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 outline-none focus:border-black dark:border-white/30 dark:focus:border-white"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="summary" className="block text-sm font-medium">
          Summary
        </label>
        <textarea
          id="summary"
          value={form.summary}
          onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
          rows={3}
          required
          className="w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 outline-none focus:border-black dark:border-white/30 dark:focus:border-white"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="maxParticipants" className="block text-sm font-medium">
          Max participants
        </label>
        <input
          id="maxParticipants"
          type="number"
          min={1}
          value={form.maxParticipants}
          onChange={(event) =>
            setForm((current) => ({ ...current, maxParticipants: event.target.value }))
          }
          required
          className="w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 outline-none focus:border-black dark:border-white/30 dark:focus:border-white"
        />
      </div>

      {errorMessage ? (
        <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-black px-5 py-2 text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {isSubmitting ? "Creating..." : "Create activity"}
      </button>
    </form>
  );
}
