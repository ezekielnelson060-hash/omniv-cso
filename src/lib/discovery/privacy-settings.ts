export type PrivacyOpt = "everyone" | "followers" | "nobody";

export type PrivacySettings = {
  whoCanContact: PrivacyOpt;
  whoCanFollow: PrivacyOpt;
  publicationsVisibility: PrivacyOpt;
  profileVisibility: PrivacyOpt;
  searchVisible: boolean;
};

const KEY = "omniv_privacy_settings";

export const DEFAULT_PRIVACY: PrivacySettings = {
  whoCanContact: "everyone",
  whoCanFollow: "everyone",
  publicationsVisibility: "everyone",
  profileVisibility: "everyone",
  searchVisible: true,
};

export function readPrivacy(): PrivacySettings {
  if (typeof window === "undefined") return { ...DEFAULT_PRIVACY };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PRIVACY };
    return { ...DEFAULT_PRIVACY, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PRIVACY };
  }
}

export function writePrivacy(s: PrivacySettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}
