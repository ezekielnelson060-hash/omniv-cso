"use client";

/** iOS-style capsule — fixed geometry so the knob never clips */
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
      className="relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full p-[2px] transition-colors duration-200"
      style={{ backgroundColor: on ? "#C9A227" : "#3f3f46" }}
    >
      <span
        className="block h-[27px] w-[27px] rounded-full bg-white shadow-md transition-transform duration-200 ease-out"
        style={{
          transform: on ? "translateX(20px)" : "translateX(0)",
        }}
      />
    </button>
  );
}
