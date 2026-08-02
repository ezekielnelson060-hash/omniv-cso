"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type RosterArtist = {
  id: string;
  stage_name: string;
  slug: string;
  genre: string | null;
  org_id?: string | null;
};

type RosterContextValue = {
  artists: RosterArtist[];
  active: RosterArtist | null;
  loading: boolean;
  setActiveId: (id: string) => void;
  refresh: () => Promise<void>;
};

const RosterContext = createContext<RosterContextValue | null>(null);
const STORAGE_KEY = "omniv_active_roster_id";

export function RosterProvider({ children }: { children: ReactNode }) {
  const [artists, setArtists] = useState<RosterArtist[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("roster_artists")
        .select("id, stage_name, slug, genre, org_id")
        .order("stage_name");
      const list = (data || []) as RosterArtist[];
      setArtists(list);
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;
      if (stored && list.some((a) => a.id === stored)) {
        setActiveIdState(stored);
      } else if (list[0]) {
        setActiveIdState(list[0].id);
      } else {
        setActiveIdState(null);
      }
    } catch {
      /* */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setActiveId = useCallback((id: string) => {
    setActiveIdState(id);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const active = useMemo(
    () => artists.find((a) => a.id === activeId) || artists[0] || null,
    [artists, activeId]
  );

  const value = useMemo(
    () => ({ artists, active, loading, setActiveId, refresh }),
    [artists, active, loading, setActiveId, refresh]
  );

  return (
    <RosterContext.Provider value={value}>{children}</RosterContext.Provider>
  );
}

export function useRoster() {
  const ctx = useContext(RosterContext);
  if (!ctx) {
    // Soft fallback when provider not mounted
    return {
      artists: [] as RosterArtist[],
      active: null as RosterArtist | null,
      loading: false,
      setActiveId: (_id: string) => {},
      refresh: async () => {},
    };
  }
  return ctx;
}
