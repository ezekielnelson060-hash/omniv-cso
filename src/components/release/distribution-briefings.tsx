"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  PlaylistSignal,
  EditorialSignal,
  AppleRadioSignal,
  TikTokSignal,
} from "@/lib/strategy/distribution-signals";
import { ListMusic, Video, Newspaper, Radio } from "lucide-react";

export function DistributionBriefings(props: {
  playlist: PlaylistSignal | null;
  editorial: EditorialSignal | null;
  appleRadio: AppleRadioSignal | null;
  tiktok: TikTokSignal | null;
}) {
  const { playlist, editorial, appleRadio, tiktok } = props;
  if (!playlist && !editorial && !appleRadio && !tiktok) return null;

  return (
    <div className="space-y-4">
      {playlist && (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ListMusic className="h-4 w-4 text-omniv-gold" />
              <p className="text-sm font-medium">Algorithmic playlist path</p>
            </div>
            <Badge variant="gold">
              {playlist.score} · {playlist.tierFocus.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-[11px] text-omniv-text-muted">
            Algos respond to early saves/completion — not pitch emails to Discover
            Weekly.
          </p>
          <ul className="mt-3 space-y-1.5">
            {playlist.path.map((p) => (
              <li key={p} className="text-xs text-omniv-text-secondary">
                · {p}
              </li>
            ))}
          </ul>
          {playlist.avoid[0] && (
            <p className="mt-3 text-xs text-omniv-danger">Avoid: {playlist.avoid[0]}</p>
          )}
        </Card>
      )}

      {editorial && (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-omniv-gold" />
              <p className="text-sm font-medium">Spotify editorial curation</p>
            </div>
            <Badge variant="gold">
              {editorial.score} · {editorial.likelihood}
            </Badge>
          </div>
          <p className="text-xs text-omniv-text-secondary">{editorial.realism}</p>
          <p className="mt-3 text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
            What editors weigh
          </p>
          <ul className="mt-1.5 space-y-1">
            {editorial.whatEditorsWeigh.map((w) => (
              <li key={w} className="text-xs text-omniv-text-secondary">
                · {w}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
            Submit path
          </p>
          <ul className="mt-1.5 space-y-1">
            {editorial.submitPath.map((s) => (
              <li key={s} className="text-xs text-omniv-text-secondary">
                · {s}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {appleRadio && (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-omniv-gold" />
              <p className="text-sm font-medium">Apple Music algorithmic radio</p>
            </div>
            <Badge variant="gold">{appleRadio.score}</Badge>
          </div>
          <p className="text-[11px] text-omniv-text-muted">{appleRadio.note}</p>
          <ul className="mt-3 space-y-1.5">
            {appleRadio.path.map((p) => (
              <li key={p} className="text-xs text-omniv-text-secondary">
                · {p}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tiktok && (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-omniv-gold" />
              <p className="text-sm font-medium">TikTok / short-form mechanics</p>
            </div>
            <Badge variant="gold">viral readiness {tiktok.viralReadiness}</Badge>
          </div>
          <ul className="mt-2 space-y-1.5">
            {tiktok.mechanics.slice(0, 4).map((m) => (
              <li key={m} className="text-xs text-omniv-text-secondary">
                · {m}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
            Test plan
          </p>
          <ul className="mt-1.5 space-y-1">
            {tiktok.testPlan.map((t) => (
              <li key={t} className="text-xs text-omniv-text-secondary">
                · {t}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
