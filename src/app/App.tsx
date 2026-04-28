import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LeftSidebar } from "../components/layout/LeftSidebar";
import { RightPanel } from "../components/layout/RightPanel";
import { TopBar } from "../components/layout/TopBar";
import { useRightPanel } from "../components/layout/rightPanelWidth";
import { ApprovalsScreen } from "../screens/ApprovalsScreen";
import { DiagnosticsScreen } from "../screens/DiagnosticsScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { InboxScreen } from "../screens/InboxScreen";
import { MemoryScreen } from "../screens/MemoryScreen";
import { PlanScreen, type PlanTask } from "../screens/PlanScreen";
import { ScenariosScreen } from "../screens/ScenariosScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { VdiControlScreen } from "../screens/VdiControlScreen";
import { agentsApi, type AgentTaskDto, type PlanDto } from "../api/agentsApi";
import { approvalsApi, type ApprovalDto } from "../api/approvalsApi";
import { historyApi, type HistoryEventDto } from "../api/historyApi";
import { scenariosApi } from "../api/scenariosApi";
import { statusApi } from "../api/statusApi";
import { vdiApi } from "../api/vdiApi";
import { wsClient } from "../api/wsClient";
import {
  approvalFromBackend,
  historyFromBackend,
  messageFromBackend,
  modeFromBackend,
  modeToBackend,
} from "../api/mappers";
import type {
  AgentMessage,
  Approval,
  HistoryEvent,
  Mode,
  PlanStep,
  Point,
  RightTab,
  Scenario,
  ScreenKey,
  Zone,
} from "../types";

interface Overlays {
  ocr: boolean;
  ui: boolean;
  zones: boolean;
  target: boolean;
  lastActions: boolean;
}

const TASK_STATUS_RU: Record<string, string> = {
  running: "В работе",
  done: "Готово",
  waiting: "Ожидает",
  pending: "Ожидает",
  failed: "Ошибка",
  cancelled: "Отменена",
};

const STEP_STATUS_MAP: Record<string, PlanStep["status"]> = {
  pending: "waiting",
  running: "active",
  waiting_approval: "approval",
  skipped: "done",
  failed: "error",
  cancelled: "error",
};

function mapStepStatus(s: string): PlanStep["status"] {
  if (s in STEP_STATUS_MAP) return STEP_STATUS_MAP[s];
  return s as PlanStep["status"];
}

function buildPlanTask(task: AgentTaskDto, plan?: PlanDto | null): PlanTask {
  const steps = (plan?.steps ?? []).map((s) => ({
    ...s,
    status: mapStepStatus(s.status as string),
  }));
  return {
    id: task.id,
    title: task.title,
    agent: task.agent,
    status: TASK_STATUS_RU[task.status] ?? task.status,
    steps,
    context: task.context,
    sources: task.sources,
    risks: task.risks.map((r) => ({
      tone: r.tone === "info" ? "success" : r.tone,
      text: r.text,
    })),
  };
}

export function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>("vdi");
  const [mode, setMode] = useState<Mode>("Live Control");
  const [agentsPaused, setAgentsPaused] = useState(false);
  const [emergencyStop, setEmergencyStop] = useState(false);
  const [esp32Connected, setEsp32Connected] = useState(true);
  const [rightTab, setRightTab] = useState<RightTab>("agent");
  const rightPanel = useRightPanel(activeScreen);

  const [overlays, setOverlays] = useState<Overlays>({
    ocr: false,
    ui: true,
    zones: false,
    target: true,
    lastActions: true,
  });
  const [lastClick, setLastClick] = useState<Point | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [vdiFocused, setVdiFocused] = useState(false);

  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [tasks, setTasks] = useState<PlanTask[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string>("");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  const taskPlanIdRef = useRef<Record<string, string | undefined>>({});

  // ---- Initial load ----
  useEffect(() => {
    (async () => {
      try {
        const [
          status,
          historyDtos,
          messageDtos,
          approvalDtos,
          taskDtos,
          scenarioDtos,
        ] = await Promise.all([
          statusApi.get(),
          historyApi.list(200),
          agentsApi.listMessages(),
          approvalsApi.list(),
          agentsApi.listTasks(),
          scenariosApi.list(),
        ]);

        setMode(modeFromBackend(status.currentMode));
        setAgentsPaused(status.agentsPaused);
        setEmergencyStop(Boolean(status.emergencyStop));
        setEsp32Connected(status.esp32?.status === "connected" || status.esp32?.status === "mock_connected");

        setHistory(historyDtos.map(historyFromBackend));
        setMessages(messageDtos.map(messageFromBackend));
        setApprovals(
          approvalDtos
            .filter((a) => a.status === "pending")
            .map(approvalFromBackend)
        );
        setScenarios(scenarioDtos);

        const plans = await Promise.all(
          taskDtos.map((t) =>
            t.planId
              ? agentsApi.getPlan(t.planId).catch(() => null)
              : Promise.resolve<PlanDto | null>(null)
          )
        );
        const built = taskDtos.map((t, i) => {
          taskPlanIdRef.current[t.id] = t.planId ?? undefined;
          return buildPlanTask(t, plans[i] ?? undefined);
        });
        setTasks(built);
        if (built.length > 0) setActiveTaskId(built[0].id);
      } catch (err) {
        console.error("initial load failed", err);
      }
    })();
  }, []);

  useEffect(() => {
    const refreshRuntimeStatus = async () => {
      try {
        const status = await statusApi.get();
        setEmergencyStop(Boolean(status.emergencyStop));
        setEsp32Connected(status.esp32?.status === "connected" || status.esp32?.status === "mock_connected");
      } catch {
        setEsp32Connected(false);
      }
    };
    const id = window.setInterval(refreshRuntimeStatus, 5000);
    return () => window.clearInterval(id);
  }, []);

  // ---- WebSocket ----
  const replacePlan = useCallback((plan: PlanDto) => {
    setTasks((prev) =>
      prev.map((t) =>
        taskPlanIdRef.current[t.id] === plan.id
          ? {
              ...t,
              steps: plan.steps.map((s) => ({
                ...s,
                status: mapStepStatus(s.status as string),
              })),
            }
          : t
      )
    );
  }, []);

  const refetchPlan = useCallback(
    async (planId: string) => {
      try {
        const plan = await agentsApi.getPlan(planId);
        replacePlan(plan);
      } catch {
        /* ignore */
      }
    },
    [replacePlan]
  );

  useEffect(() => {
    wsClient.connect();
    const off = wsClient.on(async (evt) => {
      const { type, payload } = evt;
      switch (type) {
        case "status.updated": {
          const m = payload.currentMode as string | undefined;
          if (m) setMode(modeFromBackend(m as never));
          if (typeof payload.agentsPaused === "boolean") {
            setAgentsPaused(payload.agentsPaused as boolean);
          }
          if (typeof payload.emergencyStop === "boolean") {
            setEmergencyStop(payload.emergencyStop as boolean);
          }
          const esp = (payload.esp32 as { status?: string } | undefined)?.status;
          if (esp) {
            setEsp32Connected(esp === "connected" || esp === "mock_connected");
          }
          break;
        }
        case "history.event.created": {
          const h = historyFromBackend(payload as unknown as HistoryEventDto);
          setHistory((prev) => [...prev, h]);
          break;
        }
        case "agent.message.created": {
          const m = messageFromBackend(payload as never);
          setMessages((prev) => [...prev, m]);
          break;
        }
        case "approval.created": {
          const a = approvalFromBackend(payload as unknown as ApprovalDto);
          setApprovals((prev) =>
            prev.some((x) => x.id === a.id) ? prev : [...prev, a]
          );
          break;
        }
        case "approval.updated": {
          const dto = payload as unknown as ApprovalDto;
          if (dto.status === "pending") {
            setApprovals((prev) =>
              prev.some((a) => a.id === dto.id)
                ? prev.map((a) =>
                    a.id === dto.id ? approvalFromBackend(dto) : a
                  )
                : [...prev, approvalFromBackend(dto)]
            );
          } else {
            setApprovals((prev) => prev.filter((a) => a.id !== dto.id));
          }
          break;
        }
        case "agent.task.created": {
          const t = payload as unknown as AgentTaskDto;
          taskPlanIdRef.current[t.id] = t.planId ?? undefined;
          setTasks((prev) =>
            prev.some((p) => p.id === t.id) ? prev : [...prev, buildPlanTask(t, null)]
          );
          setActiveTaskId((cur) => cur || t.id);
          break;
        }
        case "agent.task.updated": {
          const t = payload as unknown as AgentTaskDto;
          setTasks((prev) =>
            prev.map((p) =>
              p.id === t.id
                ? {
                    ...p,
                    title: t.title,
                    agent: t.agent,
                    status: TASK_STATUS_RU[t.status] ?? t.status,
                    context: t.context,
                    sources: t.sources,
                    risks: t.risks.map((r) => ({
                      tone: r.tone === "info" ? "success" : r.tone,
                      text: r.text,
                    })),
                  }
                : p
            )
          );
          break;
        }
        case "plan.step.updated":
        case "plan.step.created":
        case "plan.step.deleted":
        case "plan.steps.reordered": {
          const planId = (payload as { planId?: string }).planId;
          if (planId) await refetchPlan(planId);
          break;
        }
        default:
          break;
      }
    });
    return () => {
      off();
      wsClient.close();
    };
  }, [refetchPlan]);

  // ---------- Handlers ----------
  const pushHistoryLocal = useCallback(
    (evt: Omit<HistoryEvent, "id" | "time">) => {
      const time = new Date().toLocaleTimeString("ru-RU", { hour12: false });
      setHistory((prev) => [
        ...prev,
        { ...evt, id: `local-${Date.now()}`, time },
      ]);
    },
    []
  );

  const handleSendMessage = useCallback((text: string) => {
    agentsApi.sendMessage(text).catch((e) => console.error(e));
  }, []);

  const handleCardAction = useCallback((messageId: string, action: string) => {
    if (action === "Изменить план") {
      setActiveScreen("plan");
      setRightTab("plan");
    } else if (action === "Начать") {
      setRightTab("plan");
    }
    agentsApi
      .sendMessage(`[карточка ${messageId}] ${action}`)
      .catch(() => undefined);
  }, []);

  const handleVdiKey = useCallback((key: string) => {
    if (key.length === 1) {
      vdiApi.type(key, "user").catch(() => undefined);
    } else {
      vdiApi.key(key, "user").catch(() => undefined);
    }
  }, []);

  const handleVdiClick = useCallback((p: Point) => {
    setLastClick(p);
    vdiApi.click(p.x, p.y, "left", "user").catch(() => undefined);
  }, []);

  const handleStepAction = useCallback(
    (
      taskId: string,
      stepId: string,
      action: "run" | "edit" | "skip" | "delete"
    ) => {
      const planId = taskPlanIdRef.current[taskId];
      if (!planId) return;
      if (action === "delete") {
        agentsApi.deleteStep(planId, stepId).catch(() => undefined);
      } else if (action === "run") {
        agentsApi
          .patchStep(planId, stepId, { status: "active" })
          .catch(() => undefined);
      } else if (action === "skip") {
        agentsApi
          .patchStep(planId, stepId, { status: "done" })
          .catch(() => undefined);
      }
    },
    []
  );

  const handleStepEdit = useCallback(
    (taskId: string, stepId: string, patch: Partial<PlanStep>) => {
      const planId = taskPlanIdRef.current[taskId];
      if (!planId) return;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                steps: t.steps.map((s) =>
                  s.id === stepId ? { ...s, ...patch } : s
                ),
              }
            : t
        )
      );
      agentsApi.patchStep(planId, stepId, patch).catch(() => undefined);
    },
    []
  );

  const handleAddStep = useCallback((taskId: string) => {
    const planId = taskPlanIdRef.current[taskId];
    if (!planId) return;
    agentsApi
      .addStep(planId, { title: "Новый шаг", status: "waiting" })
      .catch(() => undefined);
  }, []);

  const handleAddTask = useCallback(() => {
    agentsApi
      .createTask("Новая задача")
      .then((t) => {
        taskPlanIdRef.current[t.id] = t.planId ?? undefined;
        setActiveTaskId(t.id);
      })
      .catch(() => undefined);
  }, []);

  const handleDeleteTask = useCallback(
    (id: string) => {
      agentsApi.cancelTask(id).catch(() => undefined);
      setTasks((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (id === activeTaskId && next.length > 0) {
          setActiveTaskId(next[0].id);
        }
        return next;
      });
    },
    [activeTaskId]
  );

  const handleTaskTitleChange = useCallback((id: string, title: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)));
  }, []);

  const handleContextChange = useCallback((id: string, context: string[]) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, context } : t))
    );
  }, []);

  const handleSourcesChange = useCallback((id: string, sources: string[]) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, sources } : t))
    );
  }, []);

  const handleApprove = useCallback((id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    approvalsApi.approve(id).catch(() => undefined);
  }, []);
  const handleReject = useCallback((id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    approvalsApi.reject(id).catch(() => undefined);
  }, []);
  const handleEditApproval = useCallback((id: string, content: string) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, content } : a))
    );
    approvalsApi.rewrite(id, content).catch(() => undefined);
  }, []);

  const handleScenarioCreate = useCallback(() => {
    const sc: Scenario = {
      id: `sc-local-${Date.now()}`,
      name: "Новый сценарий",
      description: "Описание",
      trigger: "По запросу",
      steps: 3,
      lastRun: "—",
      successRate: 0,
      enabled: false,
    };
    setScenarios((prev) => [sc, ...prev]);
  }, []);
  const handleScenarioUpdate = useCallback(
    (id: string, patch: Partial<Scenario>) => {
      setScenarios((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
      );
      if (!id.startsWith("sc-local-")) {
        scenariosApi.patch(id, patch).catch(() => undefined);
      }
    },
    []
  );
  const handleScenarioDelete = useCallback((id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    statusApi.setMode(modeToBackend(m)).catch(() => undefined);
  }, []);
  const handleTogglePause = useCallback(() => {
    setAgentsPaused((p) => {
      const next = !p;
      statusApi.pauseAgents(next).catch(() => undefined);
      return next;
    });
  }, []);
  const handleEmergencyStop = useCallback(() => {
    setAgentsPaused(true);
    statusApi.emergencyStop().catch(() => undefined);
    pushHistoryLocal({
      actor: "user",
      type: "System",
      summary: "Аварийная остановка агентов",
      status: "error",
    });
  }, [pushHistoryLocal]);

  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? tasks[0];
  const activeTaskSteps = activeTask?.steps ?? [];

  const sidebarBadges = useMemo(
    () => ({
      approvals: approvals.length || undefined,
      inbox: 6,
    }),
    [approvals.length]
  );

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-50 text-slate-900">
      <TopBar
        mode={mode}
        onModeChange={handleModeChange}
        agentsPaused={agentsPaused}
        onTogglePause={handleTogglePause}
        onEmergencyStop={handleEmergencyStop}
      />
      <div className="flex flex-1 min-h-0">
        <LeftSidebar
          active={activeScreen}
          onChange={setActiveScreen}
          badges={sidebarBadges}
        />
        <main className="flex-1 min-w-0 min-h-0 overflow-hidden">
          {activeScreen === "vdi" && (
            <VdiControlScreen
              mode={mode}
              overlays={overlays}
              onOverlaysChange={setOverlays}
              vdiFocused={vdiFocused}
              onVdiFocus={() => setVdiFocused(true)}
              onVdiBlur={() => setVdiFocused(false)}
              emergencyStop={emergencyStop}
              esp32Connected={esp32Connected}
            />
          )}
          {activeScreen === "inbox" && <InboxScreen />}
          {activeScreen === "plan" && (
            <PlanScreen
              tasks={tasks}
              activeTaskId={activeTaskId}
              onActiveTaskChange={setActiveTaskId}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onTaskTitleChange={handleTaskTitleChange}
              onStepAction={handleStepAction}
              onStepEdit={handleStepEdit}
              onAddStep={handleAddStep}
              onContextChange={handleContextChange}
              onSourcesChange={handleSourcesChange}
            />
          )}
          {activeScreen === "approvals" && (
            <ApprovalsScreen
              approvals={approvals}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={handleEditApproval}
            />
          )}
          {activeScreen === "memory" && <MemoryScreen />}
          {activeScreen === "scenarios" && (
            <ScenariosScreen
              scenarios={scenarios}
              onCreate={handleScenarioCreate}
              onUpdate={handleScenarioUpdate}
              onDelete={handleScenarioDelete}
            />
          )}
          {activeScreen === "history" && <HistoryScreen history={history} />}
          {activeScreen === "diagnostics" && <DiagnosticsScreen />}
          {activeScreen === "settings" && <SettingsScreen />}
        </main>
        <RightPanel
          width={rightPanel.width}
          collapsed={rightPanel.collapsed}
          onWidthChange={rightPanel.setWidth}
          onToggle={rightPanel.toggleCollapse}
          tab={rightTab}
          onTabChange={setRightTab}
          messages={messages}
          onSendMessage={handleSendMessage}
          onCardAction={handleCardAction}
          planSteps={activeTaskSteps}
          onPlanAction={(id, action) => {
            handleStepAction(activeTaskId, id, action);
          }}
          approvals={approvals}
          onApprove={handleApprove}
          onReject={handleReject}
          onEditApproval={handleEditApproval}
          history={history}
          lastClick={lastClick}
          selectedZone={selectedZone}
        />
      </div>
    </div>
  );
}
