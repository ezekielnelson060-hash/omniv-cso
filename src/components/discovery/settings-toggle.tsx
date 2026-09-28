"use client";

/** Capsule switch — fixed size, no overflow */
export function SettingsToggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 overflow-hidden rounded-full transition-colors ${
        on ? "bg-omniv-gold" : "bg-zinc-600"
      }`}
    >
      <span
        className={`pointer-events-none absolute top-0.5 left-0.5 block h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
