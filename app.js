let workflows = {
  revenue: {
    title: "Lead & Sales Automation",
    description:
      "Scores inbound leads, drafts a personalized reply, schedules a follow-up, and waits for manager approval before sending.",
    confidence: 94,
    cards: [
      {
        step: "Capture",
        title: "Inbound demo request",
        body: "ACME Cloud asked for an AI onboarding workflow with Salesforce handoff.",
        tags: ["High intent", "$42k ARR", "SaaS"],
      },
      {
        step: "Reason",
        title: "Fit score: 91/100",
        body: "Budget, urgency, and use case match the agency's best conversion pattern.",
        tags: ["Priority 1", "Expansion", "Low risk"],
      },
      {
        step: "Action",
        title: "Draft response ready",
        body: "Personalized reply includes discovery questions and a booking link.",
        tags: ["Needs approval", "Gmail", "HubSpot"],
      },
    ],
    blueprint: [
      ["Trigger", "New form, CRM lead, or inbound email"],
      ["Classify", "Score fit, urgency, budget, and next action"],
      ["Draft", "Generate reply using company tone and lead context"],
      ["Approve", "Human review before external communication"],
      ["Sync", "Update CRM and schedule follow-up task"],
    ],
  },
  support: {
    title: "Support Ticket Triage",
    description:
      "Reads customer messages, detects churn risk, recommends the right response, and escalates urgent issues before SLA breach.",
    confidence: 89,
    cards: [
      {
        step: "Capture",
        title: "Billing complaint detected",
        body: "Enterprise user reports failed renewal and mentions switching vendors.",
        tags: ["Urgent", "Enterprise", "Billing"],
      },
      {
        step: "Reason",
        title: "Churn risk: High",
        body: "Negative sentiment, renewal context, and competitor mention require escalation.",
        tags: ["Escalate", "SLA 2h", "Manager"],
      },
      {
        step: "Action",
        title: "Resolution packet",
        body: "Suggested response, account context, and refund policy are ready for approval.",
        tags: ["Needs approval", "Zendesk", "Slack"],
      },
    ],
    blueprint: [
      ["Trigger", "New Zendesk, Intercom, or email ticket"],
      ["Classify", "Detect sentiment, issue type, SLA, and churn risk"],
      ["Research", "Pull customer plan, history, and account notes"],
      ["Approve", "Review refund, escalation, or response suggestion"],
      ["Sync", "Notify Slack and update ticket status"],
    ],
  },
  documents: {
    title: "Back Office Document Automation",
    description:
      "Extracts structured data from invoices and contracts, validates missing fields, and routes exceptions for review.",
    confidence: 86,
    cards: [
      {
        step: "Capture",
        title: "Invoice batch uploaded",
        body: "24 vendor invoices imported from email attachments and cloud storage.",
        tags: ["PDF", "Finance", "Batch"],
      },
      {
        step: "Reason",
        title: "3 exceptions found",
        body: "Duplicate invoice number, missing tax ID, and mismatched payment terms.",
        tags: ["Validate", "Exceptions", "Audit"],
      },
      {
        step: "Action",
        title: "Approval packet",
        body: "Clean rows are ready for export. Exceptions include field-level evidence.",
        tags: ["Needs approval", "Sheets", "ERP"],
      },
    ],
    blueprint: [
      ["Trigger", "PDF, spreadsheet, email attachment, or form upload"],
      ["Extract", "Read entities, totals, dates, and counterparties"],
      ["Validate", "Check duplicates, missing fields, and policy rules"],
      ["Approve", "Route exceptions to finance or operations"],
      ["Sync", "Export records to Sheets, ERP, or database"],
    ],
  },
};

let state = {
  activeWorkflow: "revenue",
  pipelineValue: 184200,
  hoursSaved: 126,
  approvals: [
    {
      type: "Revenue",
      title: "Send enterprise lead reply",
      body: "ACME Cloud scored 91/100. AI recommends a same-day consult and tailored discovery email.",
    },
    {
      type: "Support",
      title: "Escalate billing risk",
      body: "Ticket sentiment is negative and renewal date is within 14 days. Escalation suggested.",
    },
    {
      type: "Documents",
      title: "Approve invoice exception",
      body: "Vendor invoice INV-2048 has a duplicate number with a different total.",
    },
    {
      type: "Revenue",
      title: "Create CRM follow-up task",
      body: "Prospect opened pricing page twice after the demo request.",
    },
    {
      type: "Support",
      title: "Send refund policy draft",
      body: "Suggested reply cites the correct plan limit and offers a support call.",
    },
    {
      type: "Documents",
      title: "Export validated invoice rows",
      body: "21 clean records are ready to sync into the finance spreadsheet.",
    },
    {
      type: "Revenue",
      title: "Score agency partnership lead",
      body: "Potential reseller lead has medium intent and high expansion potential.",
    },
    {
      type: "Support",
      title: "Notify account owner",
      body: "Enterprise account has an open outage ticket and pending renewal.",
    },
    {
      type: "Documents",
      title: "Request missing tax ID",
      body: "Contractor payout document is missing required registration data.",
    },
  ],
  events: [
    ["16:38", "Lead scored", "ACME Cloud marked high priority with estimated $42k ARR."],
    ["16:31", "Ticket escalated", "Billing complaint routed to support manager before SLA breach."],
    ["16:24", "Invoice validated", "21 rows approved for export, 3 exceptions held for review."],
    ["16:18", "CRM synced", "Follow-up task created for pricing-page visitor."],
  ],
};

const apiEnabled = window.location.protocol.startsWith("http");
const workflowTypes = {
  revenue: "Revenue",
  support: "Support",
  documents: "Documents",
};

const elements = {
  workflowTitle: document.querySelector("#workflowTitle"),
  workflowDescription: document.querySelector("#workflowDescription"),
  confidenceValue: document.querySelector("#confidenceValue"),
  confidenceBar: document.querySelector("#confidenceBar"),
  pipelineBoard: document.querySelector("#pipelineBoard"),
  blueprint: document.querySelector("#blueprint"),
  approvalList: document.querySelector("#approvalList"),
  eventLog: document.querySelector("#eventLog"),
  approvalCount: document.querySelector("#approvalCount"),
  pipelineValue: document.querySelector("#pipelineValue"),
  hoursSaved: document.querySelector("#hoursSaved"),
  toast: document.querySelector("#toast"),
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function tagClass(tag) {
  if (["High intent", "Priority 1", "Low risk", "Validate", "Audit"].includes(tag)) {
    return "green";
  }
  if (["SaaS", "Gmail", "HubSpot", "Zendesk", "Slack", "Sheets", "ERP"].includes(tag)) {
    return "blue";
  }
  if (["Expansion", "Manager", "Finance", "Batch"].includes(tag)) {
    return "violet";
  }
  return "amber";
}

function renderWorkflow() {
  const workflow = workflows[state.activeWorkflow];

  elements.workflowTitle.textContent = workflow.title;
  elements.workflowDescription.textContent = workflow.description;
  elements.confidenceValue.textContent = `${workflow.confidence}%`;
  elements.confidenceBar.style.width = `${workflow.confidence}%`;

  elements.pipelineBoard.innerHTML = workflow.cards
    .map(
      (card) => `
        <article class="pipeline-card">
          <span>${card.step}</span>
          <strong>${card.title}</strong>
          <p>${card.body}</p>
          <div class="tag-row">
            ${card.tags.map((tag) => `<span class="tag ${tagClass(tag)}">${tag}</span>`).join("")}
          </div>
        </article>
      `,
    )
    .join("");

  elements.blueprint.innerHTML = workflow.blueprint
    .map(
      ([title, body], index) => `
        <article class="blueprint-node">
          <div class="node-index">${index + 1}</div>
          <span>Step ${index + 1}</span>
          <strong>${title}</strong>
          <p>${body}</p>
        </article>
      `,
    )
    .join("");
}

function renderApprovals() {
  elements.approvalCount.textContent = state.approvals.length;
  elements.approvalList.innerHTML = state.approvals
    .slice(0, 5)
    .map(
      (item, index) => `
        <article class="approval-item">
          <span>${item.type}</span>
          <strong>${item.title}</strong>
          <p>${item.body}</p>
          <div class="approval-actions">
            <button class="mini-button approve" type="button" data-approve="${index}">Approve</button>
            <button class="mini-button reject" type="button" data-reject="${index}">Reject</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderEvents() {
  elements.eventLog.innerHTML = state.events
    .slice(0, 6)
    .map(
      ([time, title, body]) => `
        <li>
          <span>${time}</span>
          <div>
            <strong>${title}</strong>
            <p>${body}</p>
          </div>
        </li>
      `,
    )
    .join("");
}

function renderMetrics() {
  elements.pipelineValue.textContent = formatCurrency(state.pipelineValue);
  elements.hoursSaved.textContent = state.hoursSaved;
}

function applyServerState(snapshot) {
  workflows = snapshot.workflows;
  state = snapshot.state;
  renderWorkflow();
  renderApprovals();
  renderEvents();
  renderMetrics();
}

async function apiPost(path, payload = {}) {
  if (!apiEnabled) return null;

  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.remove("visible");
  }, 2400);
}

function addEvent(title, body) {
  const time = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  state.events.unshift([time, title, body]);
  renderEvents();
}

async function removeApproval(index, action) {
  if (apiEnabled) {
    const snapshot = await apiPost(`/api/approvals/${index}/${action}`);
    applyServerState(snapshot);
    showToast(`Action ${action}. Audit trail updated.`);
    return;
  }

  const [item] = state.approvals.splice(index, 1);
  if (!item) return;

  state.hoursSaved += action === "approved" ? 2 : 1;
  if (item.type === "Revenue" && action === "approved") {
    state.pipelineValue += 4800;
  }

  renderApprovals();
  renderMetrics();
  addEvent(
    action === "approved" ? "Action approved" : "Action rejected",
    `${item.title} was ${action} by a human reviewer.`,
  );
  showToast(`${item.title} ${action}. Audit trail updated.`);
}

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segment").forEach((segment) => segment.classList.remove("active"));
    button.classList.add("active");
    state.activeWorkflow = button.dataset.workflow;
    renderWorkflow();
    showToast(`${workflows[state.activeWorkflow].title} loaded.`);
  });
});

elements.approvalList.addEventListener("click", (event) => {
  const approveIndex = event.target.dataset.approve;
  const rejectIndex = event.target.dataset.reject;
  if (approveIndex !== undefined) {
    removeApproval(Number(approveIndex), "approved");
  }
  if (rejectIndex !== undefined) {
    removeApproval(Number(rejectIndex), "rejected");
  }
});

document.querySelector("#approveAllButton").addEventListener("click", async () => {
  if (apiEnabled) {
    const snapshot = await apiPost("/api/approvals/approve-all");
    applyServerState(snapshot);
    showToast("Queued actions approved.");
    return;
  }

  const approvedCount = Math.min(state.approvals.length, 5);
  state.approvals.splice(0, approvedCount);
  state.hoursSaved += approvedCount * 2;
  state.pipelineValue += approvedCount * 2600;
  renderApprovals();
  renderMetrics();
  addEvent("Batch approval", `${approvedCount} AI-suggested actions approved with human oversight.`);
  showToast(`${approvedCount} queued actions approved.`);
});

document.querySelector("#simulateButton").addEventListener("click", async () => {
  if (apiEnabled) {
    const snapshot = await apiPost("/api/simulate", { workflow: state.activeWorkflow });
    applyServerState(snapshot);
    showToast("Simulation complete. One approval item added.");
    return;
  }

  const workflow = workflows[state.activeWorkflow];
  const nextApproval = {
    type: workflowTypes[state.activeWorkflow],
    title: `${workflow.cards[2].title}`,
    body: `${workflow.cards[2].body} Confidence: ${workflow.confidence}%.`,
  };

  state.approvals.unshift(nextApproval);
  state.hoursSaved += 4;
  state.pipelineValue += state.activeWorkflow === "revenue" ? 7200 : 1400;

  renderApprovals();
  renderMetrics();
  addEvent("Simulation completed", `${workflow.title} produced one new review item.`);
  showToast("Simulation complete. One approval item added.");
});

document.querySelector("#optimizeButton").addEventListener("click", async () => {
  if (apiEnabled) {
    const snapshot = await apiPost(`/api/workflows/${state.activeWorkflow}/optimize`);
    applyServerState(snapshot);
    showToast("Workflow threshold optimized.");
    return;
  }

  const workflow = workflows[state.activeWorkflow];
  workflow.confidence = Math.min(workflow.confidence + 2, 98);
  renderWorkflow();
  addEvent("Workflow optimized", `${workflow.title} threshold tuned using latest approval outcomes.`);
  showToast("Workflow threshold optimized.");
});

document.querySelector("#exportButton").addEventListener("click", async () => {
  if (apiEnabled) {
    const snapshot = await apiPost("/api/audit/export");
    applyServerState(snapshot);
    showToast("Audit export prepared for the portfolio demo.");
    return;
  }

  addEvent("Audit exported", "Reviewer actions, AI rationale, and workflow metrics prepared for download.");
  showToast("Audit export prepared for the portfolio demo.");
});

async function boot() {
  if (apiEnabled) {
    try {
      const response = await fetch("/api/state");
      if (response.ok) {
        applyServerState(await response.json());
        return;
      }
    } catch (error) {
      console.warn("Falling back to local demo state.", error);
    }
  }

  renderWorkflow();
  renderApprovals();
  renderEvents();
  renderMetrics();
}

boot();
