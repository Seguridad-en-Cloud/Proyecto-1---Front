# ── Stage 1: build ─────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Install deps first (cache-friendly)
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Build
COPY . .
ARG VITE_API_BASE_URL=https://localhost/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ── Stage 2: lightest possible static server ──────────────────────
FROM nginx:1.27-alpine-slim

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Non-root (nginx alpine already has nginx user)
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && touch /var/run/nginx.pid && chown nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
