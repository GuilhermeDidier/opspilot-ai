import type { Approval } from "../types";

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
        {approvals.slice(0, 5).map((item, index) => (
          <article
            className={`approval-item${index === selectedIndex ? " selected" : ""}`}
            key={item.id ?? `${item.title}-${index}`}
          >
            <span>{item.type}</span>
            <strong>{item.title}</strong>
            <p>{item.body}</p>
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
        ))}
      </div>
    </section>
  );
}
