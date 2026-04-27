export type ScreenKey =
  | "vdi"
  | "inbox"
  | "plan"
  | "approvals"
  | "memory"
  | "scenarios"
  | "history"
  | "diagnostics"
  | "settings";

export type Mode =
  | "View"
  | "Live Control"
  | "Annotation"
  | "Agent Assist"
  | "Step Auto"
  | "Observe";

export type RightTab =
  | "agent"
  | "plan"
  | "elements"
  | "approvals"
  | "memory"
  | "history";

export type InputMode = "vdi" | "agent";

export interface Point {
  x: number;
  y: number;
}

export interface Zone {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface HistoryEvent {
  id: string;
  time: string;
  actor: "user" | "agent" | "system" | "vdi";
  type: string;
  summary: string;
  status?: "ok" | "error" | "info";
}

export interface AgentMessage {
  id: string;
  author: "user" | "agent";
  time: string;
  text?: string;
  card?: {
    seen: string[];
    proposal: string[];
    actions?: string[];
  };
}

export interface PlanStep {
  id: string;
  title: string;
  description?: string;
  status: "done" | "active" | "waiting" | "approval" | "error";
  agent?: string;
  confidence?: number;
  expected?: string;
  actual?: string;
}

export interface Approval {
  id: string;
  type: string;
  target: string;
  content: string;
  risk: "low" | "medium" | "high";
  agent: string;
  expected?: string;
}

export interface VdiElement {
  id: string;
  kind: "zone" | "element";
  type: string;
  label: string;
  bbox: { x: number; y: number; w: number; h: number };
  confidence: number;
}

export interface MemoryEntity {
  id: string;
  kind: "task" | "epic" | "person" | "project" | "decision" | "message";
  title: string;
  meta?: string;
  summary?: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  trigger: string;
  steps: number;
  lastRun: string;
  successRate: number;
  enabled: boolean;
}

export interface InboxItem {
  id: string;
  group:
    | "approval"
    | "messages"
    | "tasks"
    | "meetings"
    | "errors"
    | "reminders";
  title: string;
  source: string;
  priority: "low" | "med" | "high";
  summary: string;
  related?: string;
}

export interface DiagnosticBlock {
  id: string;
  name: string;
  status: "ok" | "warn" | "error";
  metrics: { label: string; value: string }[];
}

export interface ConversationNote {
  id: string;
  kind: "preference" | "edit" | "rejected" | "decision";
  text: string;
}
