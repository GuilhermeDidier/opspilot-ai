export type WorkflowKey = "revenue" | "support" | "documents";

export type View = "command" | "approvals" | "workflows" | "audit" | "integrations";

export interface PipelineCard {
  step: string;
  title: string;
  body: string;
  tags: string[];
}

export interface Workflow {
  key: string;
  title: string;
  description: string;
  confidence: number;
  cards: PipelineCard[];
  blueprint: [string, string][];
}

export interface Approval {
  /** Present when the approval is persisted by the Django backend. */
  id?: number;
  type: string;
  title: string;
  body: string;
  confidence?: number;
  risk?: string;
  timeSaved?: number;
  nextAction?: string;
  evidence?: string[];
  draft?: string;
  provider?: string;
}

/** [time, title, body] — matches the compact shape the audit log renders. */
export type LogEntry = [string, string, string];

export interface OpsState {
  workflows: Record<string, Workflow>;
  approvals: Approval[];
  events: LogEntry[];
}
