import type { AgentMessage, Approval, HistoryEvent, Mode } from "../types";
import type { AgentMessageDto } from "./agentsApi";
import type { ApprovalDto } from "./approvalsApi";
import type { HistoryEventDto } from "./historyApi";
import type { SystemMode } from "./statusApi";

export const modeToBackend = (m: Mode): SystemMode => {
  switch (m) {
    case "View":
      return "view";
    case "Live Control":
      return "live_control";
    case "Annotation":
      return "annotation";
    case "Agent Assist":
      return "agent_assist";
    case "Step Auto":
      return "step_auto";
    case "Observe":
      return "observe";
  }
};

export const modeFromBackend = (m: SystemMode): Mode => {
  switch (m) {
    case "view":
      return "View";
    case "live_control":
      return "Live Control";
    case "annotation":
      return "Annotation";
    case "agent_assist":
      return "Agent Assist";
    case "step_auto":
      return "Step Auto";
    case "observe":
      return "Observe";
  }
};

const fmtTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString("ru-RU", { hour12: false });
  } catch {
    return iso;
  }
};

const fmtShortTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const eventActorMap: Record<HistoryEventDto["status"], HistoryEvent["status"]> = {
  success: "ok",
  info: "info",
  error: "error",
  warn: "info",
};

export const historyFromBackend = (h: HistoryEventDto): HistoryEvent => ({
  id: h.id,
  time: fmtTime(h.timestamp),
  actor: h.actor,
  type: h.type,
  summary: h.summary,
  status: eventActorMap[h.status] ?? "info",
});

export const messageFromBackend = (m: AgentMessageDto): AgentMessage => ({
  id: m.id,
  author: m.author,
  time: m.time || fmtShortTime(new Date().toISOString()),
  text: m.text ?? undefined,
  card: m.card
    ? {
        seen: m.card.seen ?? [],
        proposal: m.card.proposal ?? [],
        actions: m.card.actions,
      }
    : undefined,
});

export const approvalFromBackend = (a: ApprovalDto): Approval => ({
  id: a.id,
  type: a.type,
  target: a.target,
  content: a.content,
  risk: a.risk,
  agent: a.agent,
  expected: a.expected ?? undefined,
});
