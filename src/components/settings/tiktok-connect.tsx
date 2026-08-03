"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

export function TikTokConnect({ connectedName }: { connectedName?: string | null }) {
  const params = useSearchParams();
  const status = params.get("tiktok");
  const name = params.get("name");

  const label =
    status === "connected"
      ? `Connected${name ? `: ${name}` : ""}`
      : connectedName
        ? `Connected: ${connectedName}`
        : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-omniv-border bg-omniv-elevated/40 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-omniv-text">TikTok</p>
        <p className="text-[11px] text-omniv-text-muted">
          Login Kit — basic profile for strategy context
        </p>
        {label && (
          <Badge variant="success" className="mt-1.5">
            {label}
          </Badge>
        )}
        {status === "denied" && (
          <p className="mt-1 text-xs text-omniv-danger">Authorization denied</p>
        )}
        {status === "token_failed" && (
          <p className="mt-1 text-xs text-omniv-danger">
            Token exchange failed — check redirect URI & env keys
          </p>
        )}
        {status === "not_configured" && (
          <p className="mt-1 text-xs text-omniv-danger">
            Server missing TIKTOK_CLIENT_KEY / SECRET
          </p>
        )}
      </div>
      <a href="/api/auth/tiktok">
        <Button size="sm" variant="outline" className="gap-1.5">
          {label ? "Reconnect" : "Connect TikTok"}
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </a>
    </div>
  );
}
