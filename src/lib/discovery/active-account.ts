/**
 * Active identity context (personal | entity).
 * Switching changes the entire app context: publish, analytics,
 * followers, promote, verification, public profile.
 */

export type ActiveAccount = {
  id: string;
  type: string;
  slug: string;
  name: string;
  path: string;
  verified?: boolean;
  handle?: string;
  avatarUrl?: string | null;
};

const KEY = "omniv_active_account";

export function readActiveAccount(): ActiveAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveAccount;
  } catch {
    return null;
  }
}

export function writeActiveAccount(a: ActiveAccount | null) {
  if (typeof window === "undefined") return;
  if (!a) {
    localStorage.removeItem(KEY);
    window.dispatchEvent(
      new CustomEvent("omniv-account-switch", { detail: null })
    );
    return;
  }
  localStorage.setItem(KEY, JSON.stringify(a));
  window.dispatchEvent(new CustomEvent("omniv-account-switch", { detail: a }));
}

export function onAccountSwitch(cb: (a: ActiveAccount | null) => void) {
  const handler = (e: Event) => {
    const ce = e as CustomEvent<ActiveAccount | null>;
    cb(ce.detail ?? readActiveAccount());
  };
  window.addEventListener("omniv-account-switch", handler);
  return () => window.removeEventListener("omniv-account-switch", handler);
}

/** True when an entity identity is selected (not personal) */
export function isEntityContext(a: ActiveAccount | null): boolean {
  return Boolean(a?.id);
}
