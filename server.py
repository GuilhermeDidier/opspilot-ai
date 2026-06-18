#!/usr/bin/env python3
import json
import mimetypes
from copy import deepcopy
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
STATE_FILE = DATA_DIR / "opspilot_state.json"

WORKFLOWS = {
    "revenue": {
        "title": "Lead & Sales Automation",
        "description": "Scores inbound leads, drafts a personalized reply, schedules a follow-up, and waits for manager approval before sending.",
        "confidence": 94,
        "cards": [
            {
                "step": "Capture",
                "title": "Inbound demo request",
                "body": "ACME Cloud asked for an AI onboarding workflow with Salesforce handoff.",
                "tags": ["High intent", "$42k ARR", "SaaS"],
            },
            {
                "step": "Reason",
                "title": "Fit score: 91/100",
                "body": "Budget, urgency, and use case match the agency's best conversion pattern.",
                "tags": ["Priority 1", "Expansion", "Low risk"],
            },
            {
                "step": "Action",
                "title": "Draft response ready",
                "body": "Personalized reply includes discovery questions and a booking link.",
                "tags": ["Needs approval", "Gmail", "HubSpot"],
            },
        ],
        "blueprint": [
            ["Trigger", "New form, CRM lead, or inbound email"],
            ["Classify", "Score fit, urgency, budget, and next action"],
            ["Draft", "Generate reply using company tone and lead context"],
            ["Approve", "Human review before external communication"],
            ["Sync", "Update CRM and schedule follow-up task"],
        ],
    },
    "support": {
        "title": "Support Ticket Triage",
        "description": "Reads customer messages, detects churn risk, recommends the right response, and escalates urgent issues before SLA breach.",
        "confidence": 89,
        "cards": [
            {
                "step": "Capture",
                "title": "Billing complaint detected",
                "body": "Enterprise user reports failed renewal and mentions switching vendors.",
                "tags": ["Urgent", "Enterprise", "Billing"],
            },
            {
                "step": "Reason",
                "title": "Churn risk: High",
                "body": "Negative sentiment, renewal context, and competitor mention require escalation.",
                "tags": ["Escalate", "SLA 2h", "Manager"],
            },
            {
                "step": "Action",
                "title": "Resolution packet",
                "body": "Suggested response, account context, and refund policy are ready for approval.",
                "tags": ["Needs approval", "Zendesk", "Slack"],
            },
        ],
        "blueprint": [
            ["Trigger", "New Zendesk, Intercom, or email ticket"],
            ["Classify", "Detect sentiment, issue type, SLA, and churn risk"],
            ["Research", "Pull customer plan, history, and account notes"],
            ["Approve", "Review refund, escalation, or response suggestion"],
            ["Sync", "Notify Slack and update ticket status"],
        ],
    },
    "documents": {
        "title": "Back Office Document Automation",
        "description": "Extracts structured data from invoices and contracts, validates missing fields, and routes exceptions for review.",
        "confidence": 86,
        "cards": [
            {
                "step": "Capture",
                "title": "Invoice batch uploaded",
                "body": "24 vendor invoices imported from email attachments and cloud storage.",
                "tags": ["PDF", "Finance", "Batch"],
            },
            {
                "step": "Reason",
                "title": "3 exceptions found",
                "body": "Duplicate invoice number, missing tax ID, and mismatched payment terms.",
                "tags": ["Validate", "Exceptions", "Audit"],
            },
            {
                "step": "Action",
                "title": "Approval packet",
                "body": "Clean rows are ready for export. Exceptions include field-level evidence.",
                "tags": ["Needs approval", "Sheets", "ERP"],
            },
        ],
        "blueprint": [
            ["Trigger", "PDF, spreadsheet, email attachment, or form upload"],
            ["Extract", "Read entities, totals, dates, and counterparties"],
            ["Validate", "Check duplicates, missing fields, and policy rules"],
            ["Approve", "Route exceptions to finance or operations"],
            ["Sync", "Export records to Sheets, ERP, or database"],
        ],
    },
}

WORKFLOW_TYPES = {
    "revenue": "Revenue",
    "support": "Support",
    "documents": "Documents",
}

STATE = {
    "activeWorkflow": "revenue",
    "pipelineValue": 184200,
    "hoursSaved": 126,
    "approvals": [
        {
            "type": "Revenue",
            "title": "Send enterprise lead reply",
            "body": "ACME Cloud scored 91/100. AI recommends a same-day consult and tailored discovery email.",
            "confidence": 94,
            "risk": "Low",
            "timeSaved": 34,
            "nextAction": "Send a tailored discovery email and create a same-day follow-up task.",
            "evidence": [
                "Budget signal found in form notes",
                "Use case matches prior high-conversion projects",
                "Prospect visited pricing page twice",
            ],
        },
        {
            "type": "Support",
            "title": "Escalate billing risk",
            "body": "Ticket sentiment is negative and renewal date is within 14 days. Escalation suggested.",
            "confidence": 89,
            "risk": "High",
            "timeSaved": 26,
            "nextAction": "Notify the account owner and attach a suggested response for manager review.",
            "evidence": [
                "Negative sentiment detected",
                "Renewal date inside 14 days",
                "Competitor switching language present",
            ],
        },
        {
            "type": "Documents",
            "title": "Approve invoice exception",
            "body": "Vendor invoice INV-2048 has a duplicate number with a different total.",
            "confidence": 86,
            "risk": "Medium",
            "timeSaved": 18,
            "nextAction": "Hold export and request finance review on the duplicate invoice.",
            "evidence": [
                "Invoice number already exists",
                "Total differs from previous record",
                "Vendor tax ID matches prior vendor",
            ],
        },
        {
            "type": "Revenue",
            "title": "Create CRM follow-up task",
            "body": "Prospect opened pricing page twice after the demo request.",
        },
        {
            "type": "Support",
            "title": "Send refund policy draft",
            "body": "Suggested reply cites the correct plan limit and offers a support call.",
        },
        {
            "type": "Documents",
            "title": "Export validated invoice rows",
            "body": "21 clean records are ready to sync into the finance spreadsheet.",
        },
        {
            "type": "Revenue",
            "title": "Score agency partnership lead",
            "body": "Potential reseller lead has medium intent and high expansion potential.",
        },
        {
            "type": "Support",
            "title": "Notify account owner",
            "body": "Enterprise account has an open outage ticket and pending renewal.",
        },
        {
            "type": "Documents",
            "title": "Request missing tax ID",
            "body": "Contractor payout document is missing required registration data.",
        },
    ],
    "events": [
        ["16:38", "Lead scored", "ACME Cloud marked high priority with estimated $42k ARR."],
        ["16:31", "Ticket escalated", "Billing complaint routed to support manager before SLA breach."],
        ["16:24", "Invoice validated", "21 rows approved for export, 3 exceptions held for review."],
        ["16:18", "CRM synced", "Follow-up task created for pricing-page visitor."],
    ],
}

DEFAULT_STATE = deepcopy(STATE)


def now_label():
    return datetime.now().strftime("%H:%M")


def add_event(title, body):
    STATE["events"].insert(0, [now_label(), title, body])
    STATE["events"] = STATE["events"][:12]
    save_state()


def snapshot():
    return {"workflows": deepcopy(WORKFLOWS), "state": deepcopy(STATE)}


def load_state():
    global STATE
    if not STATE_FILE.exists():
        return
    try:
        STATE = json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        STATE = deepcopy(DEFAULT_STATE)


def save_state():
    DATA_DIR.mkdir(exist_ok=True)
    STATE_FILE.write_text(json.dumps(STATE, indent=2), encoding="utf-8")


def reset_state():
    global STATE
    STATE = deepcopy(DEFAULT_STATE)
    save_state()


class OpsPilotHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = urlparse(self.path).path

        if path == "/api/state":
            self.send_json(snapshot())
            return

        if path == "/api/health":
            self.send_json({"status": "ok", "storage": str(STATE_FILE.relative_to(ROOT))})
            return

        file_path = ROOT / "index.html" if path == "/" else ROOT / path.lstrip("/")
        if not file_path.exists() or not file_path.is_file() or ROOT not in file_path.resolve().parents:
            self.send_error(404)
            return

        content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.end_headers()
        self.wfile.write(file_path.read_bytes())

    def do_POST(self):
        path = urlparse(self.path).path
        payload = self.read_json()

        if path == "/api/simulate":
            workflow_key = payload.get("workflow", STATE["activeWorkflow"])
            workflow = WORKFLOWS.get(workflow_key, WORKFLOWS["revenue"])
            STATE["activeWorkflow"] = workflow_key
            STATE["approvals"].insert(
                0,
                {
                    "type": WORKFLOW_TYPES.get(workflow_key, "Revenue"),
                    "title": workflow["cards"][2]["title"],
                    "body": f"{workflow['cards'][2]['body']} Confidence: {workflow['confidence']}%.",
                    "confidence": workflow["confidence"],
                    "risk": "High" if workflow_key == "support" else "Medium",
                    "timeSaved": 22 if workflow_key == "documents" else 31,
                    "nextAction": workflow["cards"][2]["body"],
                    "evidence": [
                        "Workflow context matched a known automation playbook",
                        "Suggested action requires human approval before external sync",
                        "Audit log will capture the reviewer decision",
                    ],
                },
            )
            STATE["hoursSaved"] += 4
            STATE["pipelineValue"] += 7200 if workflow_key == "revenue" else 1400
            save_state()
            add_event("Simulation completed", f"{workflow['title']} produced one new review item.")
            self.send_json(snapshot())
            return

        if path == "/api/approvals/approve-all":
            approved_count = min(len(STATE["approvals"]), 5)
            del STATE["approvals"][:approved_count]
            STATE["hoursSaved"] += approved_count * 2
            STATE["pipelineValue"] += approved_count * 2600
            save_state()
            add_event("Batch approval", f"{approved_count} AI-suggested actions approved with human oversight.")
            self.send_json(snapshot())
            return

        if path.startswith("/api/approvals/"):
            parts = path.strip("/").split("/")
            if len(parts) == 4 and parts[3] in {"approved", "rejected"}:
                index = int(parts[2])
                action = parts[3]
                if 0 <= index < len(STATE["approvals"]):
                    item = STATE["approvals"].pop(index)
                    STATE["hoursSaved"] += 2 if action == "approved" else 1
                    if item["type"] == "Revenue" and action == "approved":
                        STATE["pipelineValue"] += 4800
                    save_state()
                    add_event(
                        "Action approved" if action == "approved" else "Action rejected",
                        f"{item['title']} was {action} by a human reviewer.",
                    )
                self.send_json(snapshot())
                return

        if path.startswith("/api/workflows/") and path.endswith("/optimize"):
            workflow_key = path.strip("/").split("/")[2]
            if workflow_key in WORKFLOWS:
                WORKFLOWS[workflow_key]["confidence"] = min(WORKFLOWS[workflow_key]["confidence"] + 2, 98)
                add_event("Workflow optimized", f"{WORKFLOWS[workflow_key]['title']} threshold tuned using latest approval outcomes.")
            self.send_json(snapshot())
            return

        if path == "/api/audit/export":
            add_event("Audit exported", "Reviewer actions, AI rationale, and workflow metrics prepared for download.")
            self.send_json(snapshot())
            return

        if path == "/api/reset":
            reset_state()
            add_event("Demo reset", "State restored to the default portfolio dataset.")
            self.send_json(snapshot())
            return

        self.send_error(404)

    def read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length == 0:
            return {}
        try:
            return json.loads(self.rfile.read(length))
        except json.JSONDecodeError:
            return {}

    def send_json(self, payload):
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    load_state()
    server = ThreadingHTTPServer(("127.0.0.1", 8000), OpsPilotHandler)
    print("OpsPilot AI running at http://127.0.0.1:8000")
    server.serve_forever()
