import type { Workflow } from "../types";

interface BlueprintProps {
  workflow: Workflow;
  onOptimize: () => void;
  busy: boolean;
}

export function Blueprint({ workflow, onOptimize, busy }: BlueprintProps) {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <span className="eyebrow">Workflow Builder</span>
          <h2>Automation Blueprint</h2>
        </div>
        <button
          className="ghost-button compact"
          type="button"
          onClick={onOptimize}
          disabled={busy}
        >
          Optimize
        </button>
      </div>

      <div className="blueprint">
        {workflow.blueprint.map(([title, body], index) => (
          <article className="blueprint-node" key={title}>
            <div className="node-index">{index + 1}</div>
            <span>Step {index + 1}</span>
            <strong>{title}</strong>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
