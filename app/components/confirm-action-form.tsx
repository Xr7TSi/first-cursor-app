"use client";

type ConfirmActionFormProps = {
  action: string;
  buttonLabel: string;
  confirmMessage: string;
};

export default function ConfirmActionForm({
  action,
  buttonLabel,
  confirmMessage,
}: ConfirmActionFormProps) {
  return (
    <form
      action={action}
      method="post"
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-full border border-red-300 px-4 py-1.5 text-xs text-red-700 transition hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/30"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
