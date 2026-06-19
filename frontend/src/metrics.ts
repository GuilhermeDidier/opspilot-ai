import type { Approval } from "./types";

export interface Metrics {
  pipelineValue: number;
  hoursSaved: number;
  pending: number;
  costAvoided: number;
}

const HOURLY_OPS_COST = 85;

/** Business headline numbers, derived from the live approval queue. */
export function deriveMetrics(approvals: Approval[]): Metrics {
  const hoursSaved = 126 + approvals.reduce((total, a) => total + (a.timeSaved ?? 0), 0);
  const pipelineValue =
    184200 + approvals.filter((a) => a.type === "Revenue").length * 7200;
  return {
    hoursSaved,
    pipelineValue,
    pending: approvals.length,
    costAvoided: hoursSaved * HOURLY_OPS_COST,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
