import { useCallback, useEffect, useRef, useState } from "react";

import { api, ApiError, type RecommendationInput } from "./api";
import { seedApprovals, seedEvents, seedWorkflows } from "./seedData";
import type { Approval, LogEntry, OpsState, View, WorkflowKey } from "./types";

const WORKFLOW_LABELS: Record<string, string> = {
  revenue: "Revenue",
  support: "Support",
  documents: "Documents",
};

function seedState(): OpsState {
  // Clone so client-side mutations never touch the shared seed module.
  return {
    workflows: structuredClone(seedWorkflows),
    approvals: structuredClone(seedApprovals),
    events: structuredClone(seedEvents),
  };
}

function nowTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export interface OpsPilot {
  state: OpsState;
  loading: boolean;
  online: boolean;
  claudeEnabled: boolean;
  view: View;
  setView: (view: View) => void;
  activeWorkflow: string;
  selectWorkflow: (key: WorkflowKey) => void;
  selectedApprovalIndex: number;
  inspect: (index: number) => void;
  toast: string;
  generating: boolean;
  generate: (input: RecommendationInput) => Promise<void>;
  runSimulation: () => Promise<void>;
  optimize: () => Promise<void>;
  exportAudit: () => Promise<void>;
  approve: (index: number) => Promise<void>;
  reject: (index: number) => Promise<void>;
  approveAll: () => Promise<void>;
}

export function useOpsPilot(): OpsPilot {
  const [state, setState] = useState<OpsState>(seedState);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false);
  const [claudeEnabled, setClaudeEnabled] = useState(false);
  const [view, setView] = useState<View>("command");
  const [activeWorkflow, setActiveWorkflow] = useState<string>("revenue");
  const [selectedApprovalIndex, setSelectedApprovalIndex] = useState(0);
  const [generating, setGenerating] = useState(false);

  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);
  const showToast = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2400);
  }, []);

  const refresh = useCallback(async () => {
    setState(await api.fetchState());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const health = await api.health();
        if (health.backend === "django") {
          const next = await api.fetchState();
          if (!cancelled) {
            setState(next);
            setOnline(true);
            setClaudeEnabled(health.claude);
          }
        }
      } catch {
        // Backend unavailable — stay on the offline seed demo.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectWorkflow = useCallback(
    (key: WorkflowKey) => {
      setActiveWorkflow(key);
      const title = state.workflows[key]?.title ?? key;
      showToast(`${title} loaded.`);
    },
    [state.workflows, showToast],
  );

  const inspect = useCallback((index: number) => {
    setSelectedApprovalIndex(index);
  }, []);

  // The headline interaction: a visitor types their own scenario and the live
  // Claude endpoint returns a real decision packet. Offline (no backend), a
  // deterministic recommendation is built from the same input so the demo still
  // responds to what the visitor wrote.
  const generate = useCallback(
    async (input: RecommendationInput) => {
      if (generating) return;
      setGenerating(true);
      try {
        if (online) {
          await api.aiRecommend(activeWorkflow, input);
          setSelectedApprovalIndex(0);
          await refresh();
          showToast("AI recommendation generated from your input.");
          return;
        }

        // Offline (no backend): build a deterministic packet from the same input.
        setState((prev) => {
          const workflow = prev.workflows[activeWorkflow];
          const card = workflow.cards[workflow.cards.length - 1];
          const lowered = `${input.company} ${input.request}`.toLowerCase();
          const risk = ["urgent", "angry", "churn", "refund", "cancel", "asap"].some(
            (word) => lowered.includes(word),
          )
            ? "High"
            : "Medium";
          const who = input.company.trim() || "the customer";
          const approval: Approval = {
            type: WORKFLOW_LABELS[activeWorkflow] ?? "Revenue",
            title: `AI recommendation for ${workflow.title}`,
            body: `Processed your scenario for ${who} and prepared a controlled automation action for review.`,
            confidence: workflow.confidence,
            risk,
            timeSaved: activeWorkflow === "documents" ? 22 : 31,
            nextAction: card.body,
            evidence: [
              "Input parsed against the selected workflow pattern",
              "Suggested action requires human approval before external sync",
              "Audit log will capture the reviewer decision",
            ],
            draft: `Hi ${who}, thanks for the context. Here is a controlled next step, queued for human approval before anything is sent externally.`,
            provider: "demo",
          };
          const event: LogEntry = [
            nowTime(),
            "AI recommendation generated",
            `${workflow.title} produced a new review item from your input.`,
          ];
          return {
            ...prev,
            approvals: [approval, ...prev.approvals],
            events: [event, ...prev.events],
          };
        });
        setSelectedApprovalIndex(0);
        showToast("Recommendation generated from your input (offline demo).");
      } catch (error) {
        // Surface backend guardrails to the visitor: a rate limit (429) or the
        // input-length cap (400) both arrive as an ApiError carrying `detail`.
        if (error instanceof ApiError) {
          showToast(
            error.status === 429
              ? "You're going a bit fast — give it a few seconds and try again."
              : error.detail,
          );
        } else {
          showToast("Could not reach the AI service. Please try again.");
        }
      } finally {
        setGenerating(false);
      }
    },
    [generating, online, activeWorkflow, refresh, showToast],
  );

  const runSimulation = useCallback(async () => {
    if (online) {
      await api.aiRecommend(activeWorkflow, {
        company: "Northstar SaaS",
        request:
          "Need an AI automation recommendation with draft response, risk score, and human approval.",
      });
      setSelectedApprovalIndex(0);
      await refresh();
      showToast("AI recommendation generated. One approval item added.");
      return;
    }

    setState((prev) => {
      const workflow = prev.workflows[activeWorkflow];
      const card = workflow.cards[workflow.cards.length - 1];
      const approval: Approval = {
        type: WORKFLOW_LABELS[activeWorkflow] ?? "Revenue",
        title: card.title,
        body: `${card.body} Confidence: ${workflow.confidence}%.`,
        confidence: workflow.confidence,
        risk: activeWorkflow === "support" ? "High" : "Medium",
        timeSaved: activeWorkflow === "documents" ? 22 : 31,
        nextAction: card.body,
        evidence: [
          "Workflow context matched a known automation playbook",
          "Suggested action requires human approval before external sync",
          "Audit log will capture the reviewer decision",
        ],
        draft: "",
        provider: "demo",
      };
      const event: LogEntry = [
        nowTime(),
        "Simulation completed",
        `${workflow.title} produced one new review item.`,
      ];
      return {
        ...prev,
        approvals: [approval, ...prev.approvals],
        events: [event, ...prev.events],
      };
    });
    setSelectedApprovalIndex(0);
    showToast("Simulation complete. One approval item added.");
  }, [online, activeWorkflow, refresh, showToast]);

  const optimize = useCallback(async () => {
    if (online) {
      await api.optimize(activeWorkflow);
      await refresh();
      showToast("Workflow threshold optimized.");
      return;
    }
    setState((prev) => {
      const workflow = prev.workflows[activeWorkflow];
      return {
        ...prev,
        workflows: {
          ...prev.workflows,
          [activeWorkflow]: {
            ...workflow,
            confidence: Math.min(workflow.confidence + 2, 98),
          },
        },
        events: [
          [
            nowTime(),
            "Workflow optimized",
            `${workflow.title} threshold tuned using latest approval outcomes.`,
          ],
          ...prev.events,
        ],
      };
    });
    showToast("Workflow threshold optimized.");
  }, [online, activeWorkflow, refresh, showToast]);

  const exportAudit = useCallback(async () => {
    if (online) {
      await api.exportAudit();
      await refresh();
      showToast("Audit export prepared for the portfolio demo.");
      return;
    }
    setState((prev) => ({
      ...prev,
      events: [
        [
          nowTime(),
          "Audit exported",
          "Reviewer actions, AI rationale, and workflow metrics prepared for download.",
        ],
        ...prev.events,
      ],
    }));
    showToast("Audit export prepared for the portfolio demo.");
  }, [online, refresh, showToast]);

  const review = useCallback(
    async (index: number, action: "approved" | "rejected") => {
      const item = state.approvals[index];
      if (!item) return;

      if (online && item.id !== undefined) {
        await (action === "approved" ? api.approve(item.id) : api.reject(item.id));
        setSelectedApprovalIndex(0);
        await refresh();
        showToast(`Action ${action}. Audit trail updated.`);
        return;
      }

      setState((prev) => ({
        ...prev,
        approvals: prev.approvals.filter((_, i) => i !== index),
        events: [
          [
            nowTime(),
            action === "approved" ? "Action approved" : "Action rejected",
            `${item.title} was ${action} by a human reviewer.`,
          ],
          ...prev.events,
        ],
      }));
      setSelectedApprovalIndex(0);
      showToast(`${item.title} ${action}. Audit trail updated.`);
    },
    [state.approvals, online, refresh, showToast],
  );

  const approve = useCallback((index: number) => review(index, "approved"), [review]);
  const reject = useCallback((index: number) => review(index, "rejected"), [review]);

  const approveAll = useCallback(async () => {
    if (online) {
      await api.approveAll();
      setSelectedApprovalIndex(0);
      await refresh();
      showToast("Queued actions approved.");
      return;
    }
    setState((prev) => {
      const approvedCount = Math.min(prev.approvals.length, 5);
      return {
        ...prev,
        approvals: prev.approvals.slice(approvedCount),
        events: [
          [
            nowTime(),
            "Batch approval",
            `${approvedCount} AI-suggested actions approved with human oversight.`,
          ],
          ...prev.events,
        ],
      };
    });
    setSelectedApprovalIndex(0);
    showToast("Queued actions approved.");
  }, [online, refresh, showToast]);

  return {
    state,
    loading,
    online,
    claudeEnabled,
    view,
    setView,
    activeWorkflow,
    selectWorkflow,
    selectedApprovalIndex,
    inspect,
    toast,
    generating,
    generate,
    runSimulation,
    optimize,
    exportAudit,
    approve,
    reject,
    approveAll,
  };
}
