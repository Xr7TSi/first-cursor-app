"use client";

import { useId, useState } from "react";

type PasswordFieldProps = {
  id?: string;
  name?: string;
  label?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
};

export default function PasswordField({
  id,
  name = "password",
  label = "Password",
  required = true,
  minLength,
  autoComplete = "current-password",
}: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={showPassword ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 pr-11 outline-none focus:border-black dark:border-white/30 dark:focus:border-white"
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          aria-label={showPassword ? "Hide password" : "Show password"}
          title={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path
                d="M3 4.5L20 21M9.9 9.8A3 3 0 0 1 14.2 14M6.7 7.2C5.1 8.6 3.9 10.3 3 12c1.8 3.4 5 7 9 7 1.8 0 3.4-.7 4.8-1.8M19.8 16.8c.9-1 1.6-2.1 2.2-3.3-1.8-3.4-5-7-9-7-1 0-2 .2-2.9.6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path
                d="M2.5 12S6.5 5 12 5s9.5 7 9.5 7-4 7-9.5 7-9.5-7-9.5-7Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
