# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG BACKEND_URL=/api
ENV NEXT_PUBLIC_API_URL=$BACKEND_URL

RUN npm run build

# Serve with Caddy
FROM caddy:2-alpine

# Copy the static files from the build
COPY --from=builder /app/out /srv

# Simple Caddyfile for serving static files
RUN echo $':80 {\n\
    root * /srv\n\
    encode gzip\n\
    try_files {path} {path}/ /index.html\n\
    file_server\n\
}' > /etc/caddy/Caddyfile

EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]