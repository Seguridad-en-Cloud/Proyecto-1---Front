# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────────────────
# Multi-stage build for the LiveMenu React frontend.
# Stage 1 produces the static bundle. Stage 2 serves it from nginx-unprivileged
# (runs as UID 101, can bind to ports >= 1024 only — that's why we listen on
# 8080 instead of 80 — which is what Cloud Run expects).
# ─────────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=20-alpine
ARG NGINX_VERSION=1.27-alpine

# ── Stage 1: build ────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS build

# API base URL is baked into the JS bundle by Vite at build time. CI passes
# the production value (https://<domain>/api/v1); locally it defaults to the
# value already used by src/lib/constants.ts.
ARG VITE_API_BASE_URL

ENV NODE_ENV=production \
    CI=true \
    VITE_API_BASE_URL=${VITE_API_BASE_URL}

WORKDIR /app

COPY package.json package-lock.json ./

# ``npm ci`` requires package-lock.json (it ignores bun.lock) and produces a
# reproducible install. We need devDependencies to run the Vite build, so we
# pass --include=dev explicitly even though NODE_ENV=production.
RUN npm ci --include=dev

COPY . .
RUN npm run build

# ── Stage 2: runtime ──────────────────────────────────────────────────────
FROM nginxinc/nginx-unprivileged:${NGINX_VERSION} AS runtime

# Drop the stock default.conf and use ours.
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

EXPOSE 8080

# nginx-unprivileged already runs as a non-root user (UID 101) and writes
# logs to /var/log/nginx without needing root.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:8080/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
