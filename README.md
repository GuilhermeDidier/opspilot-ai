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

## Architecture

- **Backend** — Django REST Framework. App `automation` holds the `Workflow`,
  `Approval`, and `AuditEvent` models and the API. SQLite by default,
  PostgreSQL via `DATABASE_URL`.
- **Frontend** — React + TypeScript (Vite), in `frontend/`. The premium
  dashboard is built into `frontend/dist/` and served by Django in production.
  Talks to the API through a typed client; falls back to embedded demo data
  when the backend is unreachable.
- **AI** — Claude (`claude-opus-4-8`) via the Anthropic SDK with structured
  outputs, plus a deterministic fallback so the demo runs without a key.

## Run Locally

Create the Python environment:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

Build the frontend (outputs to `frontend/dist/`, which Django serves):

```bash
cd frontend
npm install
npm run build
cd ..
```

Run the Django app (it serves both the REST API and the built dashboard):

```bash
.venv/bin/python manage.py migrate
.venv/bin/python manage.py seed_demo
.venv/bin/python manage.py runserver 127.0.0.1:8001
```

Then visit `http://127.0.0.1:8001/`. The API is under
`http://127.0.0.1:8001/api/`.

### Frontend development

For hot-reload while iterating on the UI, run the Django API on `:8001` and the
Vite dev server separately — it proxies `/api` to Django:

```bash
cd frontend
npm run dev   # http://127.0.0.1:5173
```

Use PostgreSQL by setting `DATABASE_URL` before running migrations:

```bash
export DATABASE_URL=postgres://opspilot:opspilot@localhost:5432/opspilot_ai
.venv/bin/python manage.py migrate
.venv/bin/python manage.py seed_demo
```

Enable Claude-powered recommendations by setting:

```bash
export ANTHROPIC_API_KEY=your_api_key
export ANTHROPIC_MODEL=claude-opus-4-8
```

If no API key is configured, OpsPilot AI uses a deterministic fallback so the demo remains fully usable.

## Deploy (Render)

The repo ships a Render blueprint (`render.yaml`) and a multi-stage `Dockerfile`
that builds the React bundle and serves it from Django with gunicorn + WhiteNoise:

1. Push to GitHub and create a new **Blueprint** on Render pointing at the repo.
2. Render provisions the web service and a managed PostgreSQL database, and
   wires `DATABASE_URL` and a generated `SECRET_KEY` automatically.
3. Set `ANTHROPIC_API_KEY` in the service environment to enable live Claude
   recommendations (the deterministic fallback runs without it).

On boot the container migrates, collects static, seeds an empty database, then
serves on `$PORT`. Production reads `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`,
`DATABASE_URL`, and `ANTHROPIC_API_KEY` from the environment.

## Demo Scope

The current version is a React + TypeScript dashboard on a Django REST backend, with realistic business flows:

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
- Claude-powered recommendation and draft endpoint with deterministic fallback

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
- Add Claude-powered classification and drafting
- Rebuild the frontend as a typed React + TypeScript (Vite) single-page app
