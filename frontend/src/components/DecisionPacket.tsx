import type { Approval } from "../types";

export function DecisionPacket({ approval }: { approval: Approval | undefined }) {
  return (
    <section className="panel decision-panel">
      <div className="section-header">
        <div>
          <span className="eyebrow">AI Rationale</span>
          <h2>Decision Packet</h2>
        </div>
      </div>

      {approval ? <DecisionDetail approval={approval} /> : <EmptyDecision />}
    </section>
  );
}

function DecisionDetail({ approval }: { approval: Approval }) {

  return (
    <div className="decision-detail">
      <span>{approval.type}</span>
      <strong>{approval.title}</strong>
      <p>{approval.nextAction ?? approval.body}</p>
      <div className="rationale-grid">
        <div className="rationale-stat">
          <span>Confidence</span>
          <strong>{approval.confidence != null ? `${approval.confidence}%` : "Not scored"}</strong>
        </div>
        <div
          className={`rationale-stat${approval.risk ? ` risk-${approval.risk.toLowerCase()}` : ""}`}
        >
          <span>Risk</span>
          <strong>{approval.risk ?? "Medium"}</strong>
        </div>
        <div className="rationale-stat">
          <span>Time saved (est.)</span>
          <strong>{approval.timeSaved ?? 20} min</strong>
        </div>
        <div className="rationale-stat">
          <span>Review mode</span>
          <strong>Human</strong>
        </div>
      </div>
      {approval.evidence?.length ? (
        <ul className="evidence-list">
          {approval.evidence.map((entry) => (
            <li key={entry}>{approval.confidence == null ? `\u201c${entry}\u201d` : entry}</li>
          ))}
        </ul>
      ) : (
        <p className="evidence-empty">No phrase in the input backs this up. Review it before approving.</p>
      )}
      {approval.draft ? (
        <div className="draft-box">
          <span>{approval.provider ?? "system"} draft</span>
          <p>{approval.draft}</p>
        </div>
      ) : null}
    </div>
  );
}

function EmptyDecision() {
  return (
    <div className="decision-detail">
      <span>Select an approval</span>
      <strong>Review the AI reasoning before action</strong>
      <p>
        Every automation recommendation includes its risk level, the evidence behind it, and
        the exact next step before a human approves it.
      </p>
    </div>
  );
}
