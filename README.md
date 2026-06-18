# OpsPilot AI

OpsPilot AI is a portfolio-grade business automation command center for AI-powered operations. It demonstrates the kind of full-stack product a client could hire a developer to build: workflow automation, AI decision support, approval queues, audit trails, and business dashboards.

## Positioning

This project is designed for Upwork clients looking for:

- AI automation systems
- CRM and lead workflow automation
- Support ticket triage
- Document extraction and back-office automation
- Human-in-the-loop AI products
- Django, Python, React, TypeScript, PostgreSQL, and API integration work

## Run Locally

Open `index.html` directly for the static demo, or run the Python API server:

```bash
python3 server.py
```

Then visit:

```text
http://127.0.0.1:8000
```

## Demo Scope

The current version is a polished static frontend prototype with realistic business flows:

- Lead and sales automation
- Support ticket triage
- Invoice and document review
- Approval/rejection actions
- Workflow simulation
- Audit event logging
- Automation blueprint view
- Python API endpoints for workflows, approvals, simulation, and audit events

## Portfolio Pitch

**OpsPilot AI: Business Automation Command Center**

A production-style AI operations dashboard that scores leads, triages support tickets, extracts document data, and routes AI-suggested actions through human approval before syncing to external systems.

## Next Build Steps

- Add a Django REST API
- Store workflows, approvals, and logs in PostgreSQL
- Add OpenAI-powered classification and drafting
- Add Celery jobs for background automation
- Add integrations for Gmail, Slack, HubSpot, Google Sheets, and Zendesk
- Add authenticated client workspaces
