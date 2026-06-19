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
  const evidence = approval.evidence?.length
    ? approval.evidence
    : [
        "Recommendation generated from workflow context",
        "Action is waiting for human approval",
      ];

  return (
    <div className="decision-detail">
      <span>{approval.type}</span>
      <strong>{approval.title}</strong>
      <p>{approval.nextAction ?? approval.body}</p>
      <div className="rationale-grid">
        <div className="rationale-stat">
          <span>Confidence</span>
          <strong>{approval.confidence ?? 82}%</strong>
        </div>
        <div className="rationale-stat">
          <span>Risk</span>
          <strong>{approval.risk ?? "Medium"}</strong>
        </div>
        <div className="rationale-stat">
          <span>Time saved</span>
          <strong>{approval.timeSaved ?? 20} min</strong>
        </div>
        <div className="rationale-stat">
          <span>Review mode</span>
          <strong>Human</strong>
        </div>
      </div>
      <ul className="evidence-list">
        {evidence.map((entry) => (
          <li key={entry}>{entry}</li>
        ))}
      </ul>
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
        Every automation recommendation includes confidence, evidence, risk level, and the
        exact next step before a human approves it.
      </p>
    </div>
  );
}
