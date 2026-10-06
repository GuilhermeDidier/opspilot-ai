import type { OpsState } from "./types";

export interface Metrics {
  pipelineValue: number;
  hoursSaved: number;
  pending: number;
  costAvoided: number;
}

const HOURLY_OPS_COST = 85;
// Sample figures for the demo client, labelled as such in the UI.
const BASELINE_HOURS_SAVED = 126;
const BASELINE_PIPELINE = 184200;
const PIPELINE_PER_REVENUE_ACTION = 7200;

/**
 * Business headline numbers for the demo client: the sample baselines plus
 * what a person has approved. Pending items count only as pending.
 */
export function deriveMetrics({ approvals, approved }: Pick<OpsState, "approvals" | "approved">): Metrics {
  const minutesSaved = approved.reduce((total, a) => total + (a.timeSaved ?? 0), 0);
  const hoursSaved = BASELINE_HOURS_SAVED + Math.round(minutesSaved / 60);
  const pipelineValue =
    BASELINE_PIPELINE +
    approved.filter((a) => a.type === "Revenue").length * PIPELINE_PER_REVENUE_ACTION;
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
