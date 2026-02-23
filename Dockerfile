# ----------------------------
# Build stage
# ----------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy app source and build
COPY . .
RUN npm run build
# RUN npm run export   # for Next.js static export (creates /out)

# ----------------------------
# Production stage
# ----------------------------
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy static build from builder
COPY --from=builder /app/out .

# Copy SSL certificates
COPY fullchain.pem /etc/ssl/certs/fullchain.pem
COPY privkey.pem /etc/ssl/private/privkey.pem

# Copy Nginx template and render script
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker/99-render-nginx.sh /docker-entrypoint.d/99-render-nginx.sh
RUN chmod +x /docker-entrypoint.d/99-render-nginx.sh

# Default backend upstream (override per environment)
ENV API_UPSTREAM=https://discovery-datafarm.com.au:8081

# Expose HTTPS
EXPOSE 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
