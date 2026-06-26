import type { CSSProperties } from "react";

import { tagClass } from "../tags";
import type { Workflow, WorkflowKey } from "../types";

// Translate the raw confidence reading into a posture a human can act on.
function readConfidence(confidence: number): { label: string; state: string } {
  if (confidence >= 90) return { label: "cleared to act", state: "ok" };
  if (confidence >= 80) return { label: "review advised", state: "review" };
  return { label: "hold for human", state: "hold" };
}

const SEGMENTS: { key: WorkflowKey; label: string }[] = [
  { key: "revenue", label: "Revenue" },
  { key: "support", label: "Support" },
  { key: "documents", label: "Documents" },
];

interface WorkflowBoardProps {
  workflow: Workflow;
  activeWorkflow: string;
  onSelect: (key: WorkflowKey) => void;
}

export function WorkflowBoard({ workflow, activeWorkflow, onSelect }: WorkflowBoardProps) {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <span className="eyebrow">Workflow Intelligence</span>
          <h2>Live Operations</h2>
        </div>
        <div className="segmented-control" role="tablist" aria-label="Workflow view">
          {SEGMENTS.map((segment) => (
            <button
              key={segment.key}
              className={`segment${activeWorkflow === segment.key ? " active" : ""}`}
              type="button"
              role="tab"
              aria-selected={activeWorkflow === segment.key}
              onClick={() => onSelect(segment.key)}
            >
              {segment.label}
            </button>
          ))}
        </div>
      </div>

      <div className="workflow-hero">
        <div>
          <h3>{workflow.title}</h3>
          <p>{workflow.description}</p>
        </div>
        <div className="confidence-block">
          <span className="eyebrow">Autopilot confidence</span>
          <div
            className="gauge"
            style={{ "--pct": workflow.confidence } as CSSProperties}
            role="img"
            aria-label={`AI confidence ${workflow.confidence} percent`}
          >
            <strong>
              {workflow.confidence}
              <i>%</i>
            </strong>
          </div>
          <span className="gauge-state" data-state={readConfidence(workflow.confidence).state}>
            {readConfidence(workflow.confidence).label}
          </span>
        </div>
      </div>

      <div className="pipeline-board" aria-label="Automation pipeline">
        {workflow.cards.map((card) => (
          <article className="pipeline-card" key={card.step}>
            <span>{card.step}</span>
            <strong>{card.title}</strong>
            <p>{card.body}</p>
            <div className="tag-row">
              {card.tags.map((tag) => (
                <span className={`tag ${tagClass(tag)}`} key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
