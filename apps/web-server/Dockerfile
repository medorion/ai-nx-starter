# Multi-stage Dockerfile for AI-Nx-Starter

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY .npmrc* ./

# Install pnpm
RUN npm install -g pnpm@9

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build all apps
RUN pnpm run build:prod

# Stage 2: Production
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

# Copy node_modules from builder (preserves workspace structure)
COPY --from=builder /app/node_modules ./node_modules

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Copy workspace configuration
COPY --from=builder /app/packages ./packages

# Create symlinks for workspace packages
RUN mkdir -p node_modules/@ai-nx-starter && \
    ln -s /app/dist/packages/types node_modules/@ai-nx-starter/types && \
    ln -s /app/dist/packages/api-client node_modules/@ai-nx-starter/api-client && \
    ln -s /app/dist/packages/backend-common node_modules/@ai-nx-starter/backend-common && \
    ln -s /app/dist/packages/data-access-layer node_modules/@ai-nx-starter/data-access-layer

# Expose ports
EXPOSE 3030

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3030/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/apps/web-server/src/main.js"]
