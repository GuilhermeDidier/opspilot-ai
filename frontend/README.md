# OpsPilot AI — Frontend

React + TypeScript single-page app (Vite) for the OpsPilot AI dashboard.
See the [root README](../README.md) for the full project overview.

## Scripts

```bash
npm install      # install dependencies
npm run dev      # dev server on http://127.0.0.1:5173 (proxies /api to Django :8001)
npm run build    # production build into dist/ (served by Django)
npm run lint     # ESLint
```

## Layout

- `src/components/` — presentational components (Sidebar, ApprovalQueue, DecisionPacket, …)
- `src/useOpsPilot.ts` — state and actions hook (online API + offline fallback)
- `src/api.ts` — typed Django REST client
- `src/seedData.ts` — embedded demo data used when the backend is unreachable
- `src/styles.css` — design system (shared, framework-free CSS)
