export default function HomeLoading() {
  return (
    <div className="min-h-dvh bg-[#050505] px-4 pt-14 text-zinc-100">
      <div className="mx-auto max-w-lg space-y-3 md:max-w-2xl">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl bg-white/[0.04]"
          />
        ))}
      </div>
    </div>
  );
}
