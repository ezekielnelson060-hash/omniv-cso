"use client";

import type { CatalogueRelease, ReleaseStatus, ReleaseType } from "@/types";

const KEY = "omniv_catalogue_releases_v1";

function uid() {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2, 12);
}

export function loadReleases(): CatalogueRelease[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CatalogueRelease[];
  } catch {
    return [];
  }
}

export function saveReleases(list: CatalogueRelease[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function addRelease(input: {
  title: string;
  releaseType: ReleaseType;
  status: ReleaseStatus;
  releaseDate?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  primaryGenre?: string;
}): CatalogueRelease {
  const row: CatalogueRelease = {
    id: uid(),
    userId: "local",
    title: input.title.trim(),
    releaseType: input.releaseType,
    status: input.status,
    releaseDate: input.releaseDate || null,
    spotifyUrl: input.spotifyUrl || null,
    youtubeUrl: input.youtubeUrl || null,
    primaryGenre: input.primaryGenre || null,
    createdAt: new Date().toISOString(),
  };
  const list = [row, ...loadReleases()];
  saveReleases(list);
  return row;
}

export function removeRelease(id: string) {
  saveReleases(loadReleases().filter((r) => r.id !== id));
}
