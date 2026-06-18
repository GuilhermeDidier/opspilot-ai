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

Create the Python environment:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

Open `index.html` directly for the static demo, or run the Python API server:

```bash
.venv/bin/python server.py
```

Then visit:

```text
http://127.0.0.1:8000
```

Run the Django REST API:

```bash
.venv/bin/python manage.py migrate
.venv/bin/python manage.py seed_demo
.venv/bin/python manage.py runserver 127.0.0.1:8001
```

Django endpoints are available under:

```text
http://127.0.0.1:8001/api/
```

## Demo Scope

The current version is a polished static frontend prototype with realistic business flows:

- Lead and sales automation
- Support ticket triage
- Invoice and document review
- Approval/rejection actions
- Decision packets with confidence, risk, evidence, and next action
- Workflow simulation
- Audit event logging
- Automation blueprint view
- Cost avoided metric based on estimated operational hours saved
- Python API endpoints for workflows, approvals, simulation, reset, health, and audit events
- Local JSON persistence for demo state

## API Endpoints

```text
GET  /api/health
GET  /api/state
POST /api/simulate
POST /api/approvals/{index}/approved
POST /api/approvals/{index}/rejected
POST /api/approvals/approve-all
POST /api/workflows/{workflow}/optimize
POST /api/audit/export
POST /api/reset
```

The Django REST API also exposes:

```text
GET  /api/health/
POST /api/seed/
GET  /api/workflows/
POST /api/workflows/{key}/simulate/
POST /api/workflows/{key}/optimize/
GET  /api/approvals/?status=pending
POST /api/approvals/{id}/approve/
POST /api/approvals/{id}/reject/
POST /api/approvals/approve-all/
GET  /api/audit-events/
POST /api/audit/export/
```

## Portfolio Narrative

OpsPilot AI is intentionally built around controlled automation. The product does not pretend that AI should blindly act inside a client's business. It shows the professional pattern clients actually need: AI prepares the recommendation, explains the evidence, estimates business impact, then waits for a human reviewer before syncing to external systems.

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
