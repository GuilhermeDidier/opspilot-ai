import type { Approval, LogEntry, Workflow } from "./types";

/**
 * Offline demo data. Used when the Django API is unreachable (e.g. the built
 * SPA opened directly, or `runserver` not running) so the dashboard stays
 * fully interactive as a client-side demo.
 */
export const seedWorkflows: Record<string, Workflow> = {
  revenue: {
    key: "revenue",
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
    key: "support",
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
    key: "documents",
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

export const seedApprovals: Approval[] = [
  {
    type: "Revenue",
    title: "Send enterprise lead reply",
    body: "ACME Cloud scored 91/100. AI recommends a same-day consult and tailored discovery email.",
    confidence: 94,
    risk: "Low",
    timeSaved: 34,
    nextAction: "Send a tailored discovery email and create a same-day follow-up task.",
    evidence: [
      "Budget signal found in form notes",
      "Use case matches prior high-conversion projects",
      "Prospect visited pricing page twice",
    ],
    draft:
      "Hi ACME Cloud, thanks for the details. I would start by mapping the onboarding workflow, then build a controlled AI automation with approval gates before CRM handoff.",
    provider: "seed",
  },
  {
    type: "Support",
    title: "Escalate billing risk",
    body: "Ticket sentiment is negative and renewal date is within 14 days. Escalation suggested.",
    confidence: 89,
    risk: "High",
    timeSaved: 26,
    nextAction: "Notify the account owner and attach a suggested response for manager review.",
    evidence: [
      "Negative sentiment detected",
      "Renewal date inside 14 days",
      "Competitor switching language present",
    ],
    draft:
      "Hi, I understand this billing issue is urgent. I am escalating it with your account context so we can resolve the renewal risk quickly.",
    provider: "seed",
  },
  {
    type: "Documents",
    title: "Approve invoice exception",
    body: "Vendor invoice INV-2048 has a duplicate number with a different total.",
    confidence: 86,
    risk: "Medium",
    timeSaved: 18,
    nextAction: "Hold export and request finance review on the duplicate invoice.",
    evidence: [
      "Invoice number already exists",
      "Total differs from previous record",
      "Vendor tax ID matches prior vendor",
    ],
    draft:
      "This invoice should remain on hold until finance reviews the duplicate number and mismatched total.",
    provider: "seed",
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
];

export const seedEvents: LogEntry[] = [
  ["16:38", "Lead scored", "ACME Cloud marked high priority with estimated $42k ARR."],
  ["16:31", "Ticket escalated", "Billing complaint routed to support manager before SLA breach."],
  ["16:24", "Invoice validated", "21 rows approved for export, 3 exceptions held for review."],
  ["16:18", "CRM synced", "Follow-up task created for pricing-page visitor."],
];
