import { describe, expect, it } from "vitest";

import { deriveMetrics } from "./metrics";
import type { Approval } from "./types";

const lead: Approval = { type: "Revenue", title: "Reply to lead", body: "", timeSaved: 60 };
const ticket: Approval = { type: "Support", title: "Escalate", body: "", timeSaved: 30 };

describe("deriveMetrics", () => {
  it("counts what a person approved, not what is still waiting", () => {
    const waiting = deriveMetrics({ approvals: [lead, ticket], approved: [] });
    const done = deriveMetrics({ approvals: [ticket], approved: [lead] });

    expect(done.pending).toBe(1);
    expect(done.hoursSaved).toBeGreaterThan(waiting.hoursSaved);
    expect(done.pipelineValue).toBeGreaterThan(waiting.pipelineValue);
    expect(done.costAvoided).toBeGreaterThan(waiting.costAvoided);
  });

  it("reads timeSaved as minutes", () => {
    const before = deriveMetrics({ approvals: [], approved: [] });
    const after = deriveMetrics({ approvals: [], approved: [lead] });
    expect(after.hoursSaved - before.hoursSaved).toBe(1);
  });
});
