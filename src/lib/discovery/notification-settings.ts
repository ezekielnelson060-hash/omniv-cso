/** Granular notification preferences */

export type NotifSettings = {
  // Push
  pushFollowers: boolean;
  pushMentions: boolean;
  pushComments: boolean;
  pushMessages: boolean;
  pushOpportunities: boolean;
  pushPublicationActivity: boolean;
  // Following
  followingNewPubs: boolean;
  followingTrending: boolean;
  followingRecommended: boolean;
  // Your content
  contentNewFollowers: boolean;
  contentSaves: boolean;
  contentComments: boolean;
  contentDiscovery: boolean;
  // Email
  emailProduct: boolean;
  emailDigest: boolean;
  emailOpportunities: boolean;
  emailMarketing: boolean;
  // Quiet hours
  quietHours: boolean;
  quietStart: string; // "23:00"
  quietEnd: string; // "07:00"
};

const KEY = "omniv_notif_settings";

export const DEFAULT_NOTIF_SETTINGS: NotifSettings = {
  pushFollowers: true,
  pushMentions: true,
  pushComments: true,
  pushMessages: true,
  pushOpportunities: true,
  pushPublicationActivity: true,
  followingNewPubs: true,
  followingTrending: true,
  followingRecommended: true,
  contentNewFollowers: true,
  contentSaves: true,
  contentComments: true,
  contentDiscovery: true,
  emailProduct: true,
  emailDigest: true,
  emailOpportunities: false,
  emailMarketing: false,
  quietHours: true,
  quietStart: "23:00",
  quietEnd: "07:00",
};

export function readNotifSettings(): NotifSettings {
  if (typeof window === "undefined") return { ...DEFAULT_NOTIF_SETTINGS };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_NOTIF_SETTINGS };
    return { ...DEFAULT_NOTIF_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_NOTIF_SETTINGS };
  }
}

export function writeNotifSettings(s: NotifSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(
    new CustomEvent("omniv-notif-settings", { detail: s })
  );
}
