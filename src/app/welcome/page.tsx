import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Welcome · Omniv",
  description: "Discover what's next. One person. Multiple identities.",
};

/** Mockup screen 1 — Launch / Welcome */
export default function WelcomePage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#050505] px-6 text-center">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(212,175,55,0.18),transparent_55%)]" />

      <div className="relative z-10 flex max-w-sm flex-col items-center">
        <Image
          src="/logo.svg"
          alt="Omniv"
          width={72}
          height={72}
          className="rounded-2xl"
          priority
        />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">
          OMNIV
        </h1>
        <p className="mt-2 text-[15px] text-zinc-400">Discover what's next.</p>

        <p className="mt-8 text-[14px] leading-relaxed text-zinc-500">
          One person. Multiple identities. Publish as yourself, a company,
          artist, or brand — then get discovered.
        </p>

        <Link
          href="/signup"
          className="mt-10 flex h-12 w-full max-w-xs items-center justify-center rounded-full bg-omniv-gold text-[15px] font-semibold text-black"
        >
          Create Account
        </Link>

        <Link
          href="/signup"
          className="mt-3 flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full bg-white/[0.06] text-[14px] font-medium text-white ring-1 ring-white/15"
        >
          <span className="text-[16px]">G</span>
          Continue with Google
        </Link>

        <p className="mt-6 text-[13px] text-zinc-600">
          Already have an account?{" "}
          <Link href="/login" className="text-omniv-gold hover:underline">
            Log in
          </Link>
        </p>

        <Link
          href="/home"
          className="mt-10 text-[13px] text-zinc-500 hover:text-white"
        >
          Skip · Explore feed →
        </Link>
      </div>

      <p className="absolute bottom-6 text-[11px] text-zinc-700">
        Publish · Discover · Connect · Transact
      </p>
    </div>
  );
}
