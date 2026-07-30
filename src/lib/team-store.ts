export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Manager" | "Analyst" | "Viewer";
};

const KEY = "omniv_team";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function loadTeam(ownerEmail?: string, ownerName?: string): TeamMember[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as TeamMember[];
  } catch {
    /* ignore */
  }
  const seed: TeamMember[] = [
    {
      id: "owner",
      name: ownerName || "You",
      email: ownerEmail || "",
      role: "Owner",
    },
  ];
  localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}

export function saveTeam(list: TeamMember[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function addMember(
  list: TeamMember[],
  member: Omit<TeamMember, "id">
): TeamMember[] {
  const next = [...list, { ...member, id: uid() }];
  saveTeam(next);
  return next;
}

export function removeMember(list: TeamMember[], id: string): TeamMember[] {
  const next = list.filter((m) => m.id !== id || m.role === "Owner");
  saveTeam(next);
  return next;
}
