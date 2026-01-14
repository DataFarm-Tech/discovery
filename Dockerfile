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
ARG BACKEND_URL=https://discovery-datafarm.com.au:8080
ENV NEXT_PUBLIC_API_URL=$BACKEND_URL
RUN npm run build
RUN npm run export   # for Next.js static export (creates /out)

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

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTPS
EXPOSE 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
