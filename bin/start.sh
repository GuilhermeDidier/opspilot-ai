#!/usr/bin/env bash
# Container entrypoint: migrate, collect static, seed an empty DB, then serve.
set -e

python manage.py migrate --noinput
# Backing table for the database cache (rate-limit counters). Idempotent.
python manage.py createcachetable
python manage.py collectstatic --noinput

# Seed demo data only when the database is empty, so visitor actions in the
# live demo are not wiped on every cold start / redeploy.
if ! python manage.py shell -c "import sys; from automation.models import Workflow; sys.exit(0 if Workflow.objects.exists() else 1)"; then
  python manage.py seed_demo
fi

exec gunicorn config.wsgi:application --bind "0.0.0.0:${PORT:-8000}" --workers 2
