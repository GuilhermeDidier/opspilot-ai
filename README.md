# OpsPilot AI — Business Automation Command Center

> A production-style AI operations dashboard that scores leads, triages support tickets, and extracts document data — then routes every AI-suggested action through **human approval** before it touches an external system, with a full audit trail.

[![CI](https://github.com/GuilhermeDidier/opspilot-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/GuilhermeDidier/opspilot-ai/actions/workflows/ci.yml)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django%20REST-4.2-092E20?logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Claude](https://img.shields.io/badge/Claude-Anthropic%20SDK-D97757)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-ready-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Render-2496ED?logo=docker&logoColor=white)

**▶ Live demo: [opspilot-ai-ngvm.onrender.com](https://opspilot-ai-ngvm.onrender.com)** — running on Render's free tier, so the first request after idle may take ~30–50s to wake.

**Try it live:** type your own lead, support ticket, or document into the dashboard and watch Claude generate a real decision packet — confidence, risk, evidence, and a ready-to-send draft — that you approve or reject before anything ships.

![OpsPilot AI command center](docs/screenshots/01-command-center.png)

| Approval queue & AI decision packet | Workflow blueprint | Audit trail |
| --- | --- | --- |
| ![Approvals](docs/screenshots/02-approvals-decision.png) | ![Workflows](docs/screenshots/03-workflows.png) | ![Audit](docs/screenshots/04-audit-trail.png) |

---

## Contents

- [What it is](#what-it-is)
- [Why controlled automation](#why-controlled-automation)
- [Features](#features)
- [The three workflows](#the-three-workflows)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Run locally](#run-locally)
- [Configuration](#configuration)
- [API reference](#api-reference)
- [Tests](#tests)
- [Deploy to Render](#deploy-to-render)
- [Roadmap](#roadmap)

---

## What it is

OpsPilot AI is a full-stack product, not a script: a command center where a business
**creates, monitors, and approves** AI-driven automations for real operational
processes — sales, support, and back office. AI prepares each recommendation,
explains its evidence, estimates the business impact, and then waits for a human
reviewer before anything syncs to an external system.

It is built to demonstrate the kind of AI automation work clients actually hire for:
CRM and lead workflows, support triage, document extraction, human-in-the-loop AI
products, and Django / React / TypeScript / PostgreSQL / API integration.

## Why controlled automation

Most "AI agent" demos pretend the model should act autonomously inside a company's
systems. Real businesses don't want that — they want automation that is
**controllable, verifiable, and integrated**. OpsPilot AI is designed around that
reality:

- **Human-in-the-loop** — every AI action is a suggestion with an explicit
  approve / reject gate. Nothing is sent or synced without a reviewer.
- **Decision packets** — each recommendation ships with a confidence score, risk
  level, supporting evidence, the exact next action, estimated time saved, and a
  ready-to-send draft.
- **Audit trail** — every simulation, recommendation, and human decision is logged
  as an immutable event.

That pattern — AI proposes, a human disposes, everything is recorded — is what makes
this look like a platform a business could actually adopt.

## Features

- **Live AI console** — type your own scenario and Claude returns a real, structured decision packet in the approval queue
- Three end-to-end automation workflows (sales, support, documents)
- AI-generated recommendations via the **Claude API** with structured outputs
- Deterministic fallback so the demo is fully usable **without an API key**
- **Hardened public endpoint** — per-IP rate limits (burst + sustained) and a length cap on visitor input protect the shared API key from abuse and runaway token cost
- Approve / reject / approve-all actions, each writing an audit event
- Decision packet view: confidence, risk, evidence, next action, draft
- Workflow blueprint and live pipeline visualization
- Business metrics: pipeline value, hours saved, cost avoided
- Typed React + TypeScript SPA with an **offline demo fallback**
- Database-backed workflows, approvals, and logs (SQLite or PostgreSQL)
- One-command Docker deploy to Render (web service + managed Postgres)

## The three workflows

| Workflow | What the AI does |
| --- | --- |
| **Lead & Sales Automation** | Scores inbound leads, drafts a personalized reply, schedules a follow-up, waits for manager approval before sending. |
| **Support Ticket Triage** | Detects urgency, sentiment, and churn risk; suggests a response and escalates before SLA breach. |
| **Document / Back Office** | Extracts fields from invoices and contracts, validates them, and routes exceptions for review. |

## Architecture

```
React + TypeScript SPA  ──fetch──▶  Django REST API  ──▶  PostgreSQL / SQLite
  (frontend/, Vite)                  (automation app)
        │                                  │
        │                                  └──▶  Claude API (Anthropic SDK)
        │                                         structured outputs + fallback
        └── served as a static bundle by Django in production (WhiteNoise + gunicorn)
```

- **Backend** — Django REST Framework. The `automation` app holds the `Workflow`,
  `Approval`, and `AuditEvent` models, viewsets, serializers, and the AI service.
- **Frontend** — React + TypeScript (Vite) in `frontend/`. Components are driven by
  a `useOpsPilot` hook and a typed API client. The production bundle is built into
  `frontend/dist/` and served by Django. If the API is unreachable, the SPA falls
  back to embedded demo data and stays interactive.
- **AI** — `automation/ai.py` calls Claude (`claude-opus-4-8`) through the Anthropic
  SDK with structured outputs that guarantee the decision-packet shape. Without an
  API key, a deterministic fallback produces equivalent output so the demo never
  breaks.

## Tech stack

**Backend:** Python, Django, Django REST Framework, PostgreSQL (SQLite for dev),
gunicorn, WhiteNoise · **Frontend:** React 19, TypeScript, Vite ·
**AI:** Claude (Anthropic SDK), structured outputs · **Infra:** Docker (multi-stage),
Render blueprint.

## Project structure

```
opspilot-ai/
├── automation/            # Django app: models, API, AI service, seed data
│   ├── ai.py              # Claude recommendation engine + deterministic fallback
│   ├── models.py          # Workflow, Approval, AuditEvent
│   ├── serializers.py
│   ├── views.py           # DRF viewsets + health/seed/export endpoints
│   └── seed.py            # demo data
├── config/                # Django project (settings, urls, wsgi)
├── frontend/              # React + TypeScript (Vite) SPA
│   └── src/
│       ├── components/     # Sidebar, ApprovalQueue, DecisionPacket, ...
│       ├── api.ts          # typed API client
│       ├── useOpsPilot.ts  # state + actions hook
│       └── seedData.ts     # offline demo fallback
├── bin/start.sh           # container entrypoint (migrate, collectstatic, seed, gunicorn)
├── Dockerfile             # multi-stage: build React → serve from Django
├── render.yaml            # Render blueprint (web service + Postgres)
└── requirements.txt
```

## Run locally

**Prerequisites:** Python 3.10+ and Node 20+.

**1. Backend environment**

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

**2. Build the frontend** (outputs to `frontend/dist/`, which Django serves)

```bash
cd frontend
npm install
npm run build
cd ..
```

**3. Run Django** (serves both the REST API and the built dashboard)

```bash
.venv/bin/python manage.py migrate
.venv/bin/python manage.py seed_demo
.venv/bin/python manage.py runserver 127.0.0.1:8001
```

Visit **http://127.0.0.1:8001/** — the API is under `http://127.0.0.1:8001/api/`.

### Frontend development (hot reload)

Run the Django API on `:8001` and the Vite dev server separately; Vite proxies
`/api` to Django:

```bash
cd frontend
npm run dev   # http://127.0.0.1:5173
```

## Configuration

All configuration is read from the environment, with dev-friendly defaults.

| Variable | Default | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | _(unset)_ | Enables live Claude recommendations. Without it, the deterministic fallback is used. |
| `ANTHROPIC_MODEL` | `claude-opus-4-8` | Claude model used for recommendations. |
| `DATABASE_URL` | _(SQLite)_ | `postgres://…` connection string for PostgreSQL. |
| `SECRET_KEY` | dev key | Django secret key (set a real one in production). |
| `DEBUG` | `True` | Set to `False` in production. |
| `ALLOWED_HOSTS` | `127.0.0.1,localhost` | Comma-separated allowed hosts. |
| `CSRF_TRUSTED_ORIGINS` | _(empty)_ | Comma-separated trusted origins for HTTPS. |
| `AI_RECOMMEND_BURST_RATE` | `8/min` | Per-IP burst limit on the public AI endpoint. |
| `AI_RECOMMEND_SUSTAINED_RATE` | `40/hour` | Per-IP sustained limit on the public AI endpoint. |

Example, using PostgreSQL and live Claude:

```bash
export DATABASE_URL=postgres://opspilot:opspilot@localhost:5432/opspilot_ai
export ANTHROPIC_API_KEY=sk-ant-...
.venv/bin/python manage.py migrate
.venv/bin/python manage.py seed_demo
```

## API reference

```text
GET  /api/health/                         # status + which AI engine is active
POST /api/seed/                           # (re)seed demo data
GET  /api/workflows/                      # list workflows
POST /api/workflows/{key}/ai-recommend/   # Claude recommendation → pending approval
POST /api/workflows/{key}/simulate/       # rule-based recommendation → pending approval
POST /api/workflows/{key}/optimize/       # nudge workflow confidence threshold
GET  /api/approvals/?status=pending       # list approvals
POST /api/approvals/{id}/approve/         # approve (logs an audit event)
POST /api/approvals/{id}/reject/          # reject (logs an audit event)
POST /api/approvals/approve-all/          # batch approve
GET  /api/audit-events/                   # audit trail
POST /api/audit/export/                   # record an audit export event
```

## Tests

```bash
.venv/bin/python manage.py test            # API + integration tests
.venv/bin/python -m unittest discover -s tests   # AI service & settings unit tests
```

## Deploy to Render

The repo ships a Render blueprint (`render.yaml`) and a multi-stage `Dockerfile`
that builds the React bundle and serves it from Django with gunicorn + WhiteNoise.

1. Push to GitHub and create a new **Blueprint** on Render pointing at the repo.
2. Render provisions the web service and a managed PostgreSQL database, wiring
   `DATABASE_URL` and a generated `SECRET_KEY` automatically.
3. Add `ANTHROPIC_API_KEY` in the service environment to enable live Claude
   recommendations (the deterministic fallback runs without it).

On boot the container migrates, collects static files, seeds an empty database,
then serves on `$PORT`.

## Roadmap

Intentionally out of scope for this portfolio build, and documented as next steps:

- Background automation jobs with Celery + Redis
- Real integrations: Gmail, Slack, HubSpot, Google Sheets, Zendesk
- Authenticated, multi-tenant client workspaces

---

Built as a portfolio piece to show the kind of controlled, auditable AI automation
businesses actually adopt — AI proposes, a human approves, everything is recorded.

## License

Released under the [MIT License](LICENSE).
