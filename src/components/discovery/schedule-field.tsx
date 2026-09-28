"use client";

type Props = {
  value: string;
  onChange: (v: string) => void;
  labelClassName?: string;
  inputClassName?: string;
};

export function ScheduleField({
  value,
  onChange,
  labelClassName = "text-[12px] font-medium text-zinc-400",
  inputClassName = "mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40",
}: Props) {
  return (
    <div className="mt-5">
      <p className={labelClassName}>Schedule publish (optional)</p>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClassName}
      />
      <p className="mt-1.5 text-[11px] text-zinc-600">
        Leave empty to publish now. A future time is stored as scheduled and
        goes live automatically.
      </p>
      {value && (
        <p className="mt-1 text-[12px] text-omniv-gold">
          Goes live{" "}
          {new Date(value).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      )}
    </div>
  );
}
