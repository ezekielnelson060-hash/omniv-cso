/** Omniv autonomous agent — proposals the artist confirms */

export type AgentActionType =
  | "OPEN_ZIKI"
  | "CREATE_TASK"
  | "CREATE_ROOM"
  | "MARK_OPP_DONE"
  | "OPEN_CATALOGUE"
  | "OPEN_OPPORTUNITIES"
  | "OPEN_CRM"
  | "OPEN_RELEASE"
  | "DRAFT_OUTREACH"
  | "OPEN_DISCOVER"
  | "OPEN_REPORTS"
  | "OPEN_SETTINGS";

export type AgentProposal = {
  id: string;
  title: string;
  body: string;
  urgency: "now" | "today" | "this_week";
  impact: "high" | "medium" | "low";
  source: "catalogue" | "audience" | "brain" | "calendar" | "market" | "webhook";
  action: {
    type: AgentActionType;
    label: string;
    payload?: Record<string, string>;
  };
  status: "pending" | "done" | "dismissed";
  createdAt: number;
};

export type AgentScanResult = {
  proposals: AgentProposal[];
  scannedAt: number;
  narrative: string;
};
