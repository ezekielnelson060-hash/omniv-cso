/**
 * Device-local explorer profile for V1.
 * avatar/cover URLs from Supabase storage stick in localStorage.
 */

export type LocalProfile = {
  displayName: string;
  handle: string;
  bio: string;
  location: string;
  joinedAt: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
};

const KEY = "omniv_explorer_profile";

const DEFAULT: LocalProfile = {
  displayName: "Explorer",
  handle: "explorer",
  bio: "Discovering what people and organizations are putting into the world.",
  location: "",
  joinedAt: new Date().toISOString().slice(0, 10),
  avatarUrl: null,
  coverUrl: null,
};

export function readProfile(): LocalProfile {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    return { ...DEFAULT, ...(JSON.parse(raw) as Partial<LocalProfile>) };
  } catch {
    return { ...DEFAULT };
  }
}

export function writeProfile(p: LocalProfile) {
  localStorage.setItem(KEY, JSON.stringify(p));
}
