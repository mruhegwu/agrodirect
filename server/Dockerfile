FROM node:20-alpine AS builder

WORKDIR /app

# Copy server package files
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db/schemaSql.ts ./src/db/schemaSql.ts

# Create data directory for SQLite persistence
RUN mkdir -p /app/data

EXPOSE 5000

CMD ["node", "dist/index.js"]
