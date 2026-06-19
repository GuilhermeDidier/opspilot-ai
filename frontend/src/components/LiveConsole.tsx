import { useState } from "react";

import type { RecommendationInput } from "../api";

/** Per-workflow prompts so the visitor knows what kind of scenario to type. */
const PLACEHOLDERS: Record<string, { label: string; company: string; request: string }> = {
  revenue: {
    label: "Lead & Sales",
    company: "Lead or company, e.g. Northwind Logistics",
    request:
      "Paste an inbound lead: who they are, what they need, budget, timeline, anything they said…",
  },
  support: {
    label: "Support",
    company: "Customer, e.g. Jane from Acme Corp",
    request:
      "Paste a support ticket: the issue, how urgent it is, and what the customer is asking for…",
  },
  documents: {
    label: "Documents",
    company: "Document reference, e.g. Invoice #4821",
    request:
      "Describe the document: type, the key fields it contains, and anything unusual to flag…",
  },
};

interface LiveConsoleProps {
  activeWorkflow: string;
  workflowTitle: string;
  claudeEnabled: boolean;
  generating: boolean;
  onGenerate: (input: RecommendationInput) => void;
}

export function LiveConsole({
  activeWorkflow,
  workflowTitle,
  claudeEnabled,
  generating,
  onGenerate,
}: LiveConsoleProps) {
  const prompt = PLACEHOLDERS[activeWorkflow] ?? PLACEHOLDERS.revenue;
  const [company, setCompany] = useState("");
  const [request, setRequest] = useState("");

  const canSubmit = request.trim().length > 0 && !generating;

  const submit = () => {
    if (!canSubmit) return;
    onGenerate({ company: company.trim(), request: request.trim() });
  };

  return (
    <section className="panel live-console">
      <div className="section-header">
        <div>
          <span className="eyebrow">Try it live</span>
          <h2>Give the AI a real {workflowTitle} scenario</h2>
        </div>
        <span className={`live-badge ${claudeEnabled ? "on" : "off"}`}>
          {claudeEnabled ? "Claude live" : "Demo mode"}
        </span>
      </div>

      <p className="live-hint">
        Type your own input below. The AI returns a decision packet — confidence, risk,
        evidence and a draft reply — that a human approves before anything ships.
      </p>

      <input
        className="live-input"
        type="text"
        placeholder={prompt.company}
        value={company}
        onChange={(event) => setCompany(event.target.value)}
        disabled={generating}
      />
      <textarea
        className="live-textarea"
        placeholder={prompt.request}
        value={request}
        onChange={(event) => setRequest(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") submit();
        }}
        disabled={generating}
        rows={4}
      />

      <div className="live-actions">
        <button
          className="primary-button"
          type="button"
          onClick={submit}
          disabled={!canSubmit}
        >
          {generating ? "Claude is analyzing…" : "Generate AI recommendation"}
        </button>
        <span className="live-note">
          {generating
            ? "First response can take a few seconds."
            : "Result appears in the approval queue, ready for your review."}
        </span>
      </div>
    </section>
  );
}
