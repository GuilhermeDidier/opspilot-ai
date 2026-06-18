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

Run the Django app (it serves both the REST API and the dashboard):

```bash
.venv/bin/python manage.py migrate
.venv/bin/python manage.py seed_demo
.venv/bin/python manage.py runserver 127.0.0.1:8001
```

Then visit:

```text
http://127.0.0.1:8001/
```

The API is available under `http://127.0.0.1:8001/api/`. You can also open
`index.html` directly for a fully client-side demo with no backend.

Use PostgreSQL by setting `DATABASE_URL` before running migrations:

```bash
export DATABASE_URL=postgres://opspilot:opspilot@localhost:5432/opspilot_ai
.venv/bin/python manage.py migrate
.venv/bin/python manage.py seed_demo
```

Enable OpenAI-powered recommendations by setting:

```bash
export OPENAI_API_KEY=your_api_key
export OPENAI_MODEL=gpt-5.5
```

If no API key is configured, OpsPilot AI uses a deterministic fallback so the demo remains fully usable.

## Demo Scope

The current version is a Django-backed dashboard with realistic business flows:

- Lead and sales automation
- Support ticket triage
- Invoice and document review
- Approval/rejection actions
- Decision packets with confidence, risk, evidence, and next action
- Workflow simulation
- Audit event logging
- Automation blueprint view
- Cost avoided metric based on estimated operational hours saved
- Django REST API endpoints for workflows, approvals, simulation, health, and audit events
- Database-backed workflows, approvals, and audit logs
- SQLite by default with PostgreSQL support through `DATABASE_URL`
- OpenAI-powered recommendation and draft endpoint with deterministic fallback

## API Endpoints

The Django REST API exposes:

```text
GET  /api/health/
POST /api/seed/
GET  /api/workflows/
POST /api/workflows/{key}/ai-recommend/
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

- Add Celery jobs for background automation
- Add integrations for Gmail, Slack, HubSpot, Google Sheets, and Zendesk
- Add authenticated client workspaces

## Completed Build Steps

- Add a Django REST API
- Store workflows, approvals, and logs in a database
- Add PostgreSQL configuration through `DATABASE_URL`
- Add OpenAI-powered classification and drafting
