import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Brain, Target, BarChart3 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-omniv-gold/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full bg-omniv-gold/3 blur-[100px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-omniv-gold/15 glow-gold">
            <span className="text-base font-bold text-omniv-gold">O</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">Omniv</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24 pt-20 text-center md:pt-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-omniv-gold/20 bg-omniv-gold/5 px-3.5 py-1.5 text-xs font-medium text-omniv-gold">
          <Sparkles className="h-3.5 w-3.5" />
          AI Chief Strategy Officer
        </div>

        <h1 className="text-balance text-4xl font-semibold tracking-tight text-omniv-text md:text-6xl md:leading-[1.1]">
          The highest-impact move
          <br />
          <span className="text-omniv-gold">for your career.</span>
          <br />
          Every day.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-omniv-text-secondary md:text-lg">
          Omniv is not another AI content tool. It is a continuous strategy
          engine that learns your art, audience, and market — then tells you
          exactly what to do next.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="min-w-[180px] gap-2">
              Start free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="min-w-[180px]">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-5xl gap-4 px-6 pb-32 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Brain,
            title: "Artist Brain",
            desc: "Permanent AI memory of style, brand, audience and goals.",
          },
          {
            icon: Target,
            title: "Opportunity Feed",
            desc: "Trends, playlists, collabs and timing — ranked by impact.",
          },
          {
            icon: BarChart3,
            title: "Executive scores",
            desc: "Growth, momentum, release readiness — at a glance.",
          },
          {
            icon: Sparkles,
            title: "Ziki AI",
            desc: "Ask anything. It already knows your catalogue and career.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="card-elevated flex flex-col gap-3 p-5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-omniv-gold/10">
              <item.icon className="h-4 w-4 text-omniv-gold" />
            </div>
            <h3 className="text-sm font-semibold text-omniv-text">
              {item.title}
            </h3>
            <p className="text-xs leading-relaxed text-omniv-text-secondary">
              {item.desc}
            </p>
          </div>
        ))}
      </section>

      <footer className="relative z-10 border-t border-omniv-border py-8 text-center text-xs text-omniv-text-muted">
        © {new Date().getFullYear()} Omniv. Strategy for the independent era.
      </footer>
    </div>
  );
}
