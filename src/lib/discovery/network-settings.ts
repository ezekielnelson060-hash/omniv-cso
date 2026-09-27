export type NetworkSettings = {
  discoverable: boolean;
  blockedIds: string[];
};

const KEY = "omniv_network_settings";

export const DEFAULT_NETWORK: NetworkSettings = {
  discoverable: true,
  blockedIds: [],
};

export function readNetwork(): NetworkSettings {
  if (typeof window === "undefined") return { ...DEFAULT_NETWORK };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_NETWORK };
    return { ...DEFAULT_NETWORK, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_NETWORK };
  }
}

export function writeNetwork(s: NetworkSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}
