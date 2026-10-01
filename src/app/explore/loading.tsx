export default function ExploreLoading() {
  return (
    <div className="min-h-dvh bg-[#050505] px-4 pt-14">
      <div className="mx-auto grid max-w-lg gap-3 md:max-w-2xl md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="aspect-[16/10] animate-pulse rounded-2xl bg-white/[0.04]"
          />
        ))}
      </div>
    </div>
  );
}
