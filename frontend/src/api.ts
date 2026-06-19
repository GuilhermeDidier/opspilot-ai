import type { Approval, LogEntry, OpsState, PipelineCard, Workflow } from "./types";

/** Raw shapes returned by the Django REST API (snake_case from the serializers). */
interface WorkflowDTO {
  key: string;
  title: string;
  description: string;
  confidence: number;
  cards: PipelineCard[];
  blueprint: [string, string][];
}

interface ApprovalDTO {
  id: number;
  type: string;
  title: string;
  body: string;
  confidence: number;
  risk: string;
  time_saved: number;
  next_action: string;
  evidence: string[];
  draft: string;
  provider: string;
  status: string;
}

interface AuditEventDTO {
  id: number;
  title: string;
  body: string;
  created_at: string;
}

export interface HealthResponse {
  status: string;
  backend: string;
  claude: boolean;
}

export interface RecommendationInput {
  company: string;
  request: string;
}

async function getJSON<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function postJSON<T>(path: string, payload?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`POST ${path} failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function normalizeWorkflow(dto: WorkflowDTO): Workflow {
  return {
    key: dto.key,
    title: dto.title,
    description: dto.description,
    confidence: dto.confidence,
    cards: dto.cards ?? [],
    blueprint: dto.blueprint ?? [],
  };
}

export function normalizeApproval(dto: ApprovalDTO): Approval {
  return {
    id: dto.id,
    type: dto.type,
    title: dto.title,
    body: dto.body,
    confidence: dto.confidence,
    risk: dto.risk,
    timeSaved: dto.time_saved,
    nextAction: dto.next_action,
    evidence: dto.evidence,
    draft: dto.draft,
    provider: dto.provider,
  };
}

function formatEventTime(timestamp: string): string {
  if (!timestamp) return "--:--";
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function normalizeEvent(dto: AuditEventDTO): LogEntry {
  return [formatEventTime(dto.created_at), dto.title, dto.body];
}

export const api = {
  health(): Promise<HealthResponse> {
    return getJSON<HealthResponse>("/api/health/");
  },

  /** Loads the full dashboard state, seeding the backend on first run. */
  async fetchState(): Promise<OpsState> {
    let [workflows, approvals, events] = await Promise.all([
      getJSON<WorkflowDTO[]>("/api/workflows/"),
      getJSON<ApprovalDTO[]>("/api/approvals/?status=pending"),
      getJSON<AuditEventDTO[]>("/api/audit-events/"),
    ]);

    if (workflows.length === 0) {
      await postJSON("/api/seed/");
      [workflows, approvals, events] = await Promise.all([
        getJSON<WorkflowDTO[]>("/api/workflows/"),
        getJSON<ApprovalDTO[]>("/api/approvals/?status=pending"),
        getJSON<AuditEventDTO[]>("/api/audit-events/"),
      ]);
    }

    return {
      workflows: Object.fromEntries(
        workflows.map((dto) => [dto.key, normalizeWorkflow(dto)]),
      ),
      approvals: approvals.map(normalizeApproval),
      events: events.map(normalizeEvent),
    };
  },

  aiRecommend(key: string, payload: RecommendationInput): Promise<ApprovalDTO> {
    return postJSON<ApprovalDTO>(`/api/workflows/${key}/ai-recommend/`, payload);
  },

  optimize(key: string): Promise<WorkflowDTO> {
    return postJSON<WorkflowDTO>(`/api/workflows/${key}/optimize/`);
  },

  approve(id: number): Promise<ApprovalDTO> {
    return postJSON<ApprovalDTO>(`/api/approvals/${id}/approve/`);
  },

  reject(id: number): Promise<ApprovalDTO> {
    return postJSON<ApprovalDTO>(`/api/approvals/${id}/reject/`);
  },

  approveAll(): Promise<{ approved: number }> {
    return postJSON<{ approved: number }>("/api/approvals/approve-all/");
  },

  exportAudit(): Promise<{ status: string }> {
    return postJSON<{ status: string }>("/api/audit/export/");
  },
};
