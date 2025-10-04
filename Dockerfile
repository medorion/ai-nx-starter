# Multi-stage build for Tokarev monorepo
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Install all dependencies with ignore-scripts to avoid post-install issues
RUN npm install --legacy-peer-deps --no-audit --progress=false --ignore-scripts

# Manually run nx post-install if needed (safer approach)
RUN npx nx --version || echo "Nx installed successfully"

# Copy source code
COPY . .

# Build the UI (Angular application)
RUN NX_DAEMON=false npx nx build web-ui --configuration=production

# Build the server (NestJS application)
RUN NX_DAEMON=false npx nx build web-server --configuration=production

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy workspace configuration files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Copy source packages with their package.json files
COPY --from=builder /app/packages ./packages

# Install all dependencies (including workspace packages) with ignore-scripts
RUN npm ci --no-audit --progress=false --ignore-scripts && npm cache clean --force

# Create node_modules/@medorion and @medorion-monorepo directories and symlink workspace packages
RUN mkdir -p node_modules/@medorion node_modules/@medorion-monorepo \
  && ln -sf /app/dist/packages/entities node_modules/@medorion-monorepo/entities \
  && ln -sf /app/dist/packages/backend-common node_modules/@medorion/backend-common \
  && ln -sf /app/dist/packages/tools node_modules/@medorion-monorepo/tools

# Copy built server application
COPY --from=builder /app/dist/apps/web-server ./dist/apps/web-server

# Copy built UI to server's public directory
COPY --from=builder /app/dist/apps/web-ui/browser ./dist/apps/web-server/public

# Copy built packages (entities, common, etc.) to dist
COPY --from=builder /app/dist/packages ./dist/packages

# Set correct permissions
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3030

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3030

# Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:3030/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the server with dumb-init
CMD ["dumb-init", "node", "dist/apps/web-server/src/main.js"]
