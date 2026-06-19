import { formatCurrency, type Metrics } from "../metrics";

export function StatusGrid({ metrics }: { metrics: Metrics }) {
  return (
    <section className="status-grid" aria-label="Business status">
      <article className="metric-panel">
        <span>Pipeline Value</span>
        <strong>{formatCurrency(metrics.pipelineValue)}</strong>
        <small>+18.4% this week</small>
      </article>
      <article className="metric-panel">
        <span>Hours Saved</span>
        <strong>{metrics.hoursSaved}</strong>
        <small>Across 3 workflows</small>
      </article>
      <article className="metric-panel">
        <span>Pending Approval</span>
        <strong>{metrics.pending}</strong>
        <small>Human-in-the-loop</small>
      </article>
      <article className="metric-panel">
        <span>Cost Avoided</span>
        <strong>{formatCurrency(metrics.costAvoided)}</strong>
        <small>At $85/hr ops cost</small>
      </article>
    </section>
  );
}
