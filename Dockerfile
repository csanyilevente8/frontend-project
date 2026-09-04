# syntax=docker/dockerfile:1

# ---- Build stage -----------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Cache dependencies: copy lockfiles first, install, then copy sources.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage ---------------------------------------------------------
# Serve the compiled static files with nginx. The Angular application builder
# emits the browser bundle under dist/frontend/browser.
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

# nginx runs in the foreground by default in this base image's CMD.
