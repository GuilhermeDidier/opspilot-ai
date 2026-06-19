# Stage 1 — build the React + TypeScript frontend
FROM node:20-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2 — Django runtime
FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
# Bring in the production frontend bundle built in stage 1.
COPY --from=frontend /app/frontend/dist ./frontend/dist

RUN chmod +x bin/start.sh

CMD ["bin/start.sh"]
