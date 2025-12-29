# 1️⃣ Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG BACKEND_URL
ENV NEXT_PUBLIC_API_URL=$BACKEND_URL


RUN npm run build

# 2️⃣ Serve with Caddy
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/out /srv
