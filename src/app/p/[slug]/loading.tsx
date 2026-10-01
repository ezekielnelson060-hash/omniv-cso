export default function PublicationLoading() {
  return (
    <div className="min-h-dvh bg-[#050505]">
      <div className="h-72 animate-pulse bg-zinc-900" />
      <div className="mx-auto max-w-2xl space-y-3 px-4 pt-6">
        <div className="h-6 w-2/3 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-4 w-full animate-pulse rounded bg-white/[0.04]" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-white/[0.04]" />
      </div>
    </div>
  );
}
