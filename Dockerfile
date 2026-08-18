# Multi-stage Dockerfile for Craft Brewery Inventory Manager
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies (falls back to npm install if package-lock.json is absent)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source code and config
COPY . .

# Build Vite frontend and bundled backend server into /app/dist
RUN npm run build

# --- Production Runtime Image ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install only production dependencies
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi && npm cache clean --force

# Copy built assets and bundled server from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

# Ensure data directory exists for persistent volume mounts
RUN mkdir -p /app/data

# Persistent storage volume for inventory JSON database
VOLUME ["/app/data"]

EXPOSE 3000

# Start compiled Express server serving both REST API and SPA frontend
CMD ["npm", "start"]
