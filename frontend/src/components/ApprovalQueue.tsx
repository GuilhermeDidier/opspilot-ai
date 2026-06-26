import type { Approval } from "../types";

// Map the item's risk reading to its rail color and clearance flag.
const STATE_BY_RISK: Record<string, { cls: string; flag: string }> = {
  low: { cls: "cleared", flag: "Cleared" },
  medium: { cls: "hold", flag: "Hold" },
  high: { cls: "risk", flag: "Escalate" },
};

interface ApprovalQueueProps {
  approvals: Approval[];
  selectedIndex: number;
  busy: boolean;
  onInspect: (index: number) => void;
  onApprove: (index: number) => void;
  onReject: (index: number) => void;
  onApproveAll: () => void;
}

export function ApprovalQueue({
  approvals,
  selectedIndex,
  busy,
  onInspect,
  onApprove,
  onReject,
  onApproveAll,
}: ApprovalQueueProps) {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <span className="eyebrow">Human Review</span>
          <h2>Approval Queue</h2>
        </div>
        <button
          className="ghost-button compact"
          type="button"
          onClick={onApproveAll}
          disabled={busy || approvals.length === 0}
        >
          Approve All
        </button>
      </div>

      <div className="approval-list">
        {approvals.slice(0, 5).map((item, index) => {
          const state = STATE_BY_RISK[(item.risk ?? "").toLowerCase()];
          return (
          <article
            className={`approval-item${state ? ` ${state.cls}` : ""}${index === selectedIndex ? " selected" : ""}`}
            key={item.id ?? `${item.title}-${index}`}
          >
            <div className="strip-head">
              <span className="strip-type">{item.type}</span>
              {state ? <span className="strip-flag">{state.flag}</span> : null}
            </div>
            <strong>{item.title}</strong>
            <p>{item.body}</p>
            {item.confidence != null ? (
              <div className="strip-meta">
                <span>{item.confidence}%</span>
                {item.risk ? (
                  <>
                    <i>·</i>
                    <span>{item.risk} risk</span>
                  </>
                ) : null}
                {item.timeSaved != null ? (
                  <>
                    <i>·</i>
                    <span>saves {item.timeSaved}m</span>
                  </>
                ) : null}
              </div>
            ) : null}
            <div className="approval-actions">
              <button
                className="mini-button inspect"
                type="button"
                onClick={() => onInspect(index)}
              >
                Inspect
              </button>
              <button
                className="mini-button approve"
                type="button"
                onClick={() => onApprove(index)}
                disabled={busy}
              >
                Approve
              </button>
              <button
                className="mini-button reject"
                type="button"
                onClick={() => onReject(index)}
                disabled={busy}
              >
                Reject
              </button>
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
}
