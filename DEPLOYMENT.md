# Production Deployment Guide

> **Important**: This is a starter template, not a production-ready application. Production deployment requires significant customization based on your specific requirements and infrastructure.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Security Checklist](#security-checklist)
- [Database Migrations](#database-migrations)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [What This Template Provides](#what-this-template-provides)
- [What You Need to Configure](#what-you-need-to-configure)

---

## Prerequisites

Before deploying to production, ensure you have:

- [ ] Node.js 18+ (LTS recommended)
- [ ] MongoDB 7+ instance (managed service recommended: MongoDB Atlas, AWS DocumentDB, Azure Cosmos DB)
- [ ] Redis 7+ instance (managed service recommended: AWS ElastiCache, Azure Cache, Redis Cloud)
- [ ] SSL/TLS certificates for HTTPS
- [ ] Domain name configured with DNS
- [ ] Secrets management solution (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)
- [ ] Backup strategy planned and tested

## Environment Configuration

### 1. Create Production Environment File

```bash
cp .env.example .env.production
```

### 2. Update All Variables

**Critical variables to configure:**

```bash
# Application
NODE_ENV=production
ENVIRONMENT=production
PORT=3030
LOG_LEVEL=info # Use 'info' or 'warn' in production, NOT 'debug'

# MongoDB - Use your production credentials
MONGO_URI=mongodb://username:password@your-mongodb-host:27017/ai_nx_starter?authSource=admin

# Redis - Use your production credentials
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-strong-redis-password

# Session & Security
TIME_BEFORE_SESSION_EXPIRE_MS=3600000 # 1 hour
SERVER_TOKEN_EXPIRATION_MS=7200000    # 2 hours
```

### 3. Configure CORS

**⚠️ CRITICAL**: Update CORS configuration in your code:

Edit `apps/web-server/src/main.ts`:

```typescript
// DO NOT use '*' in production
app.enableCors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true,
});
```

### 4. Security Best Practices

- **NEVER commit `.env.production` to version control**
- Use secrets management service (not environment files)
- Rotate credentials regularly
- Use strong, randomly generated passwords (min 32 characters)
- Enable encryption at rest for databases

---

## Docker Deployment

### What Exists

The project includes working Dockerfiles:

- ✅ `apps/web-server/Dockerfile` - NestJS backend
- ✅ `apps/web-ui/Dockerfile` - Angular frontend
- ✅ `docker-compose.yml` - Development environment

### Development Docker Compose

```bash
# Start all services (MongoDB, Redis, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Docker Deployment

**You will need to create:**

1. **`docker-compose.production.yml`** - Based on your infrastructure
2. **Reverse proxy configuration** (Nginx/Traefik) with SSL
3. **Persistent volumes** for MongoDB and Redis data
4. **Secrets management** (not environment files)
5. **Health check configuration**
6. **Logging and monitoring setup**

**Example minimal production setup:**

```yaml
# docker-compose.production.yml (you need to create this)
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: apps/web-server/Dockerfile
    environment:
      NODE_ENV: production
      # DO NOT hardcode secrets here - use Docker secrets or external secrets manager
    restart: always
    healthcheck:
      test: ['CMD', 'wget', '--quiet', '--tries=1', '--spider', 'http://localhost:3030/health']
      interval: 30s
      timeout: 10s
      retries: 3

  # Add nginx, configure volumes, networks, etc.
```

---

## Security Checklist

**Before going to production, verify:**

### Application Security

- [ ] `NODE_ENV=production` set
- [ ] All default credentials changed (MongoDB, Redis)
- [ ] CORS configured for specific domains only (not `*`)
- [ ] HTTPS enabled with valid SSL certificates
- [ ] Security headers configured (see `apps/web-server/src/main.ts`)
- [ ] Rate limiting configured (consider @nestjs/throttler)
- [ ] Input validation enabled on all endpoints (class-validator)
- [ ] Session store using Redis (not in-memory)

### Database Security

- [ ] TypeORM `synchronize: false` in production (see [Database Migrations](#database-migrations))
- [ ] Database authentication enabled with strong passwords
- [ ] Database encryption at rest enabled
- [ ] Database backups configured and tested
- [ ] Database connection pooling configured

### Infrastructure Security

- [ ] Environment variables not committed to code
- [ ] Secrets stored in secrets manager (not .env files)
- [ ] Firewall rules configured (allow only necessary ports)
- [ ] Docker images scanned for vulnerabilities
- [ ] Dependencies audited (`npm audit`)
- [ ] Error logging doesn't expose stack traces to users
- [ ] Access logs enabled

**📖 See [SECURITY.md](./SECURITY.md) for comprehensive security guidelines.**

---

## Database Migrations

**⚠️ CRITICAL PRODUCTION ISSUE**

### Current State (Development)

The project currently uses TypeORM's `synchronize: true` for development convenience:

```typescript
// apps/web-server/src/app/data-access.module.ts
synchronize: process.env.NODE_ENV !== 'production', // Auto-creates/updates schema
```

### Production Requirement

**You MUST disable auto-synchronization in production:**

1. **Set environment variable:**

```bash
NODE_ENV=production # This will disable synchronize
```

2. **Verify in code:**

```typescript
// apps/web-server/src/app/data-access.module.ts
synchronize: process.env.NODE_ENV !== 'production', // Will be false in production
```

### Migration Strategy

**Before deploying to production, you must:**

1. Create manual migration scripts for all schema changes
2. Version control all migration scripts
3. Test migrations in staging environment first
4. Create database backup before running migrations
5. Have rollback plan ready

**📖 See [documents/migration-scripts.md](./documents/migration-scripts.md) for migration guidance.**

---

## Monitoring & Health Checks

### Health Check Endpoint

The application includes a health check endpoint:

```
GET /health
```

Returns: `{ status: 'ok', timestamp: <ISO-8601> }`

Use this for:

- Docker healthchecks
- Load balancer health probes
- Kubernetes liveness/readiness probes
- Monitoring systems

### Logging

The project uses Pino for structured logging:

- Backend: `PinoLogger` from `nestjs-pino`
- Frontend: `LoggerService` from `@app/core/services`

**Production logging configuration:**

```bash
# In .env.production
LOG_LEVEL=info # Options: debug, info, warn, error
```

**📖 See [documents/logging-guidelines.md](./documents/logging-guidelines.md) for logging best practices.**

### Recommended Monitoring

**Application Performance Monitoring (APM):**

- Sentry (error tracking)
- New Relic
- Datadog
- AWS CloudWatch
- Google Cloud Operations

**Set up alerts for:**

- High error rates (4xx, 5xx responses)
- High response times (> 2 seconds)
- Database connection failures
- High memory/CPU usage
- SSL certificate expiration

---

## What This Template Provides

✅ **Ready to use:**

- Working Dockerfiles for backend and frontend
- Development Docker Compose setup
- Health check endpoint (`/health`)
- Structured logging (Pino)
- Session management with Redis
- TypeORM database integration
- Security middleware configured
- Input validation framework (class-validator)

✅ **Documentation:**

- Security best practices: [SECURITY.md](./SECURITY.md)
- Migration guidelines: [documents/migration-scripts.md](./documents/migration-scripts.md)
- Logging standards: [documents/logging-guidelines.md](./documents/logging-guidelines.md)
- Architecture docs: [/documents/](./documents/)

---

## What You Need to Configure

❌ **Not included (you must create):**

- Production Docker Compose configuration
- Nginx/reverse proxy configuration with SSL
- Kubernetes manifests (if using K8s)
- Cloud platform configurations (AWS/GCP/Azure)
- CI/CD pipeline
- Database migration scripts
- Backup automation scripts
- Monitoring dashboards
- Alerting rules

❌ **Must be customized:**

- CORS origins (currently allows all in development)
- Session expiration times (adjust for your needs)
- Database connection pooling settings
- Rate limiting configuration
- Business-specific security rules

---

## Platform Deployment

This project can be deployed to any platform that supports Docker:

- **AWS**: ECS, Elastic Beanstalk, EC2
- **Google Cloud**: Cloud Run, GKE, Compute Engine
- **Azure**: App Service, AKS, Container Instances
- **Other**: DigitalOcean, Heroku, Render, Railway, Fly.io

**We don't provide platform-specific deployment guides** because:

- This is a template, not a production application
- Deployment requirements vary significantly by use case
- Platform documentation is maintained by the platforms themselves
- Your infrastructure needs will differ based on scale and requirements

For platform-specific guidance, refer to official documentation:

- [AWS Elastic Beanstalk Docs](https://docs.aws.amazon.com/elasticbeanstalk/)
- [Google Cloud Run Docs](https://cloud.google.com/run/docs)
- [Azure App Service Docs](https://learn.microsoft.com/azure/app-service/)

---

## Need Help?

- **Security concerns**: See [SECURITY.md](./SECURITY.md)
- **Architecture questions**: See [/documents/](./documents/)
- **Roadmap & planned improvements**: See [ROADMAP.md](./ROADMAP.md)
- **Community support**: [GitHub Discussions](https://github.com/YOUR_ORG/ai-nx-starter/discussions)

---

**Last Updated**: 2025-11-18
**Version**: 2.0 (Simplified for template nature)
