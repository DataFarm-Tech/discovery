# Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy build files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

# Install only production dependencies
RUN npm install --omit=dev

# Expose port
EXPOSE 3000

CMD ["npm", "start"]
