"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, MapPin, ExternalLink, Loader2 } from "lucide-react";

type Audit = {
  id: string;
  share_slug: string;
  source_type: string;
  artist_name: string | null;
  headline: string | null;
  overall_score: number;
  created_at: string;
};

type City = { city: string; fans: number; ready: number };

export default function DiscoverPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/discover");
        const json = await res.json();
        setAudits(json.audits || []);
        setCities(json.cities || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <div>
          <p className="font-data text-[11px] uppercase tracking-[0.16em] text-omniv-gold">
            Discovery
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Compass className="h-6 w-6 text-omniv-gold" />
            Marketplace signal
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-omniv-text-secondary">
            Public relevance audits and anonymized city density across Omniv.
            Labels and managers use this to find who is rising and where rooms
            will fill — without scraping private fan emails.
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-omniv-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading signals…
          </div>
        )}

        <section>
          <h2 className="text-sm font-semibold tracking-tight">
            Top public audits
          </h2>
          <p className="mt-1 text-xs text-omniv-text-muted">
            Shareable scans ranked by overall score.
          </p>
          <ul className="mt-4 space-y-2">
            {audits.length === 0 && !loading && (
              <li className="text-sm text-omniv-text-muted">
                No public audits yet. Artists run a free scan from /audit.
              </li>
            )}
            {audits.map((a) => (
              <li key={a.id}>
                <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {a.artist_name || "Unknown artist"}
                    </p>
                    <p className="truncate text-xs text-omniv-text-muted">
                      {a.headline || a.source_type} · score {a.overall_score}
                    </p>
                  </div>
                  <Link href={`/audit/${a.share_slug}`} target="_blank">
                    <Button size="sm" variant="outline" className="gap-1">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open
                    </Button>
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold tracking-tight">City density</h2>
          <p className="mt-1 text-xs text-omniv-text-muted">
            Where Omniv fans cluster (counts only — no personal data).
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {cities.map((c) => (
              <li key={c.city}>
                <Card className="flex items-center justify-between p-3">
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-omniv-gold" />
                    {c.city}
                  </span>
                  <span className="text-xs text-omniv-text-muted">
                    {c.fans} fans · {c.ready} would attend
                  </span>
                </Card>
              </li>
            ))}
            {cities.length === 0 && !loading && (
              <li className="text-sm text-omniv-text-muted">
                City signal grows as artists fill Fan Gates.
              </li>
            )}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
