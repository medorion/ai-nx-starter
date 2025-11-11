# Deployment Guide

This guide covers deploying AI-Nx-Starter to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Deployment Options](#deployment-options)
  - [Docker Compose (Simple)](#docker-compose-simple)
  - [Kubernetes](#kubernetes)
  - [Cloud Platforms](#cloud-platforms)
- [Database Setup](#database-setup)
- [Security Checklist](#security-checklist)
- [Monitoring & Observability](#monitoring--observability)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying to production, ensure you have:

- [ ] Node.js 18+ (LTS recommended)
- [ ] pnpm 8+
- [ ] Docker & Docker Compose (for containerized deployments)
- [ ] MongoDB 7+ instance (or managed service)
- [ ] Redis 7+ instance (or managed service)
- [ ] SSL/TLS certificates for HTTPS
- [ ] Domain name configured
- [ ] Environment variables configured
- [ ] Backup strategy in place

## Environment Configuration

### 1. Create Production Environment File

```bash
cp .env.example .env.production
```

### 2. Configure Production Variables

Edit `.env.production`:

```bash
# Application
NODE_ENV=production
ENVIRONMENT=production
PORT=3030

# Logging (use 'info' or 'warn' in production)
LOG_LEVEL=info

# MongoDB - Use your production credentials
MONGO_URI=mongodb://username:password@your-mongodb-host:27017/ai_nx_starter?authSource=admin

# Redis - Use your production credentials
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Session & Security
TIME_BEFORE_SESSION_EXPIRE_MS=3600000 # 1 hour
SERVER_TOKEN_EXPIRATION_MS=7200000    # 2 hours

# CORS - Restrict to your frontend domain
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. Security Best Practices

- **Never commit `.env.production` to version control**
- Use secrets management (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)
- Rotate credentials regularly
- Use strong, randomly generated passwords
- Enable encryption at rest for databases

---

## Deployment Options

### Docker Compose (Simple)

Best for: Small to medium applications, single-server deployments

#### Step 1: Build Production Images

```bash
# Build all services
docker-compose build

# Or build specific services
docker-compose build app
docker-compose build web-ui
```

#### Step 2: Update docker-compose.yml for Production

Create `docker-compose.production.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    container_name: ai-nx-starter-mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: ai_nx_starter
    volumes:
      - /var/data/mongodb:/data/db # Use persistent volume
    restart: always
    networks:
      - ai-nx-starter-network

  redis:
    image: redis:7-alpine
    container_name: ai-nx-starter-redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - /var/data/redis:/data
    restart: always
    networks:
      - ai-nx-starter-network

  app:
    build:
      context: .
      dockerfile: apps/web-server/Dockerfile
    container_name: ai-nx-starter-app
    environment:
      NODE_ENV: production
      PORT: 3030
      MONGO_URI: ${MONGO_URI}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      LOG_LEVEL: info
      TIME_BEFORE_SESSION_EXPIRE_MS: ${TIME_BEFORE_SESSION_EXPIRE_MS}
      SERVER_TOKEN_EXPIRATION_MS: ${SERVER_TOKEN_EXPIRATION_MS}
    depends_on:
      - mongodb
      - redis
    restart: always
    networks:
      - ai-nx-starter-network
    healthcheck:
      test: ['CMD', 'wget', '--quiet', '--tries=1', '--spider', 'http://localhost:3030/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  web-ui:
    build:
      context: .
      dockerfile: apps/web-ui/Dockerfile
      args:
        API_URL: https://api.yourdomain.com
    container_name: ai-nx-starter-web-ui
    restart: always
    networks:
      - ai-nx-starter-network

  nginx:
    image: nginx:alpine
    container_name: ai-nx-starter-nginx
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
      - web-ui
    restart: always
    networks:
      - ai-nx-starter-network

volumes:
  mongodb_data:
  redis_data:

networks:
  ai-nx-starter-network:
    driver: bridge
```

#### Step 3: Create Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server app:3030;
    }

    upstream frontend {
        server web-ui:80;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # API requests
        location /api/ {
            proxy_pass http://backend/api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend
        location / {
            proxy_pass http://frontend/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

#### Step 4: Deploy

```bash
# Deploy with production configuration
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Stop services
docker-compose -f docker-compose.production.yml down
```

---

### Kubernetes

Best for: Large-scale applications, multi-region deployments

#### Prerequisites

- Kubernetes cluster (AWS EKS, Google GKE, Azure AKS, or self-hosted)
- kubectl configured
- Helm (optional, recommended)

#### Basic Kubernetes Deployment

Create `k8s/` directory with the following files:

**1. Namespace**

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ai-nx-starter
```

**2. ConfigMap**

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: ai-nx-starter
data:
  NODE_ENV: 'production'
  LOG_LEVEL: 'info'
  PORT: '3030'
```

**3. Secrets**

```bash
# Create secrets from environment variables
kubectl create secret generic app-secrets \
  --from-literal=MONGO_URI='your-mongo-uri' \
  --from-literal=REDIS_PASSWORD='your-redis-password' \
  -n ai-nx-starter
```

**4. Backend Deployment**

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: ai-nx-starter
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: your-registry/ai-nx-starter-backend:latest
          ports:
            - containerPort: 3030
          envFrom:
            - configMapRef:
                name: app-config
            - secretRef:
                name: app-secrets
          livenessProbe:
            httpGet:
              path: /health
              port: 3030
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3030
            initialDelaySeconds: 10
            periodSeconds: 5
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
```

**5. Service & Ingress**

```yaml
# k8s/backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: ai-nx-starter
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3030
  type: ClusterIP
---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ai-nx-starter-ingress
  namespace: ai-nx-starter
  annotations:
    cert-manager.io/cluster-issuer: 'letsencrypt-prod'
    nginx.ingress.kubernetes.io/ssl-redirect: 'true'
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.yourdomain.com
      secretName: api-tls
  rules:
    - host: api.yourdomain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: backend-service
                port:
                  number: 80
```

**Deploy to Kubernetes**

```bash
# Apply all configurations
kubectl apply -f k8s/

# Check status
kubectl get pods -n ai-nx-starter
kubectl get services -n ai-nx-starter
kubectl get ingress -n ai-nx-starter

# View logs
kubectl logs -f deployment/backend -n ai-nx-starter
```

---

### Cloud Platforms

#### AWS (Elastic Beanstalk)

1. Install EB CLI: `pip install awsebcli`
2. Initialize: `eb init`
3. Create environment: `eb create production`
4. Deploy: `eb deploy`

#### AWS (ECS/Fargate)

- Use AWS ECS with Fargate for serverless containers
- Configure Task Definitions with your Docker images
- Use AWS RDS for MongoDB (DocumentDB) and ElastiCache for Redis
- Set up Application Load Balancer

#### Google Cloud (Cloud Run)

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/ai-nx-starter-backend

# Deploy to Cloud Run
gcloud run deploy ai-nx-starter-backend \
  --image gcr.io/PROJECT_ID/ai-nx-starter-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Azure (App Service)

- Use Azure App Service for containers
- Configure Azure Database for MongoDB (Cosmos DB)
- Use Azure Cache for Redis

---

## Database Setup

### MongoDB Production Setup

1. **Use Managed Service** (Recommended)
   - MongoDB Atlas
   - AWS DocumentDB
   - Azure Cosmos DB

2. **Self-Hosted MongoDB**
   - Enable authentication
   - Use replica sets for high availability
   - Configure regular backups
   - Enable encryption at rest
   - Use SSL/TLS connections

### Database Migrations

Currently, this project uses TypeORM's synchronization in development. For production:

```typescript
// DO NOT use synchronize: true in production
// apps/web-server/src/app/database/typeorm.config.ts

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mongodb',
  url: process.env.MONGO_URI,
  synchronize: false, // CRITICAL: Never auto-sync in production
  logging: process.env.NODE_ENV === 'development',
  // ... other config
};
```

**Migration Strategy** (To be implemented):

1. Create migration scripts manually
2. Version control all schema changes
3. Test migrations in staging first
4. Use backup before running migrations
5. Have rollback plan ready

---

## Security Checklist

Before going to production, verify:

- [ ] Environment variables secured (not in code)
- [ ] HTTPS enabled (valid SSL certificate)
- [ ] CORS configured for specific origins only
- [ ] Rate limiting implemented (consider @nestjs/throttler)
- [ ] Session store using Redis (not in-memory)
- [ ] Database authentication enabled
- [ ] Strong passwords/secrets used
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (TypeORM parameterized queries)
- [ ] XSS protection (Angular sanitization enabled)
- [ ] CSRF protection enabled
- [ ] Dependencies audited (`npm audit`)
- [ ] Docker images scanned for vulnerabilities
- [ ] Firewall rules configured
- [ ] SSH key-based authentication (if applicable)
- [ ] Backup strategy tested and automated
- [ ] Monitoring and alerting configured
- [ ] Error logging configured (don't expose stack traces to users)
- [ ] Access logs enabled
- [ ] Regular security updates scheduled

---

## Monitoring & Observability

### Health Checks

The application includes a basic health check endpoint:

```
GET /health
```

Returns: `{ status: 'ok', timestamp: <ISO-8601> }`

### Logging

Configure structured logging for production:

```typescript
// Use pino logger (already configured)
// Set LOG_LEVEL=info or LOG_LEVEL=warn in production
```

### Recommended Monitoring Tools

**Application Performance Monitoring (APM):**

- Sentry (error tracking)
- New Relic
- Datadog
- AWS CloudWatch
- Google Cloud Operations

**Log Aggregation:**

- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- Datadog Logs
- AWS CloudWatch Logs

**Metrics & Dashboards:**

- Prometheus + Grafana
- Datadog
- AWS CloudWatch

### Alerting

Set up alerts for:

- High error rates (4xx, 5xx responses)
- High response times (> 2 seconds)
- Database connection failures
- High memory/CPU usage
- Disk space running low
- SSL certificate expiration

---

## Troubleshooting

### Common Issues

**1. Application won't start**

```bash
# Check logs
docker-compose -f docker-compose.production.yml logs app

# Common causes:
# - Database connection failed (check MONGO_URI)
# - Redis connection failed (check REDIS_HOST)
# - Port already in use
# - Missing environment variables
```

**2. Database connection timeout**

```bash
# Test MongoDB connection
docker exec -it ai-nx-starter-mongodb mongosh -u admin -p admin

# Check network connectivity
docker network inspect ai-nx-starter-network
```

**3. High memory usage**

```bash
# Check memory usage
docker stats

# Restart service if needed
docker-compose -f docker-compose.production.yml restart app
```

**4. 502 Bad Gateway (Nginx)**

- Backend not running or not healthy
- Check health endpoint: `curl http://localhost:3030/health`
- Check upstream configuration in nginx.conf

### Performance Optimization

**1. Database Indexing**

Ensure proper indexes on frequently queried fields:

```typescript
// Add indexes to your entities
@Entity()
@Index(['email'], { unique: true })
export class User {
  // ...
}
```

**2. Caching**

Use Redis for caching:

- Session data (already implemented)
- Frequently accessed data
- API response caching

**3. Load Balancing**

For high traffic:

- Run multiple app instances
- Use Nginx or cloud load balancers
- Enable sticky sessions for WebSocket connections

---

## Backup & Disaster Recovery

### Database Backups

**MongoDB Backup (with mongodump):**

```bash
# Backup
docker exec ai-nx-starter-mongodb mongodump \
  --uri="mongodb://admin:admin@localhost:27017/ai_nx_starter?authSource=admin" \
  --out=/backup

# Restore
docker exec ai-nx-starter-mongodb mongorestore \
  --uri="mongodb://admin:admin@localhost:27017/ai_nx_starter?authSource=admin" \
  /backup/ai_nx_starter
```

**Automated Backups:**

Set up cron job for daily backups:

```bash
# /etc/cron.daily/mongodb-backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec ai-nx-starter-mongodb mongodump \
  --uri="$MONGO_URI" \
  --archive=/backup/backup_$DATE.archive \
  --gzip

# Upload to S3 or similar
aws s3 cp /backup/backup_$DATE.archive s3://your-backup-bucket/mongodb/
```

### Recovery Plan

1. Document recovery procedures
2. Test restore process regularly
3. Keep backups in multiple locations
4. Set retention policies (e.g., 30 days)
5. Document RTO (Recovery Time Objective) and RPO (Recovery Point Objective)

---

## Scaling Strategies

### Vertical Scaling

Increase resources for existing containers:

```yaml
# In docker-compose.production.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
```

### Horizontal Scaling

Run multiple instances:

```bash
# Docker Compose
docker-compose -f docker-compose.production.yml up -d --scale app=3

# Kubernetes
kubectl scale deployment backend --replicas=5 -n ai-nx-starter
```

### Database Scaling

- MongoDB: Use replica sets or sharding
- Redis: Use Redis Cluster or managed service with replication

---

## Next Steps

After deployment:

1. Set up monitoring and alerts
2. Configure automated backups
3. Perform load testing
4. Document your specific deployment configuration
5. Set up CI/CD pipeline for automated deployments
6. Configure staging environment
7. Implement blue-green or canary deployment strategy
8. Set up disaster recovery plan

## Support

For deployment issues:

- Check [Troubleshooting](#troubleshooting) section
- Review application logs
- Consult [SECURITY.md](SECURITY.md) for security concerns
- Open a GitHub issue for bugs

---

**Last Updated**: 2025-11-11
**Version**: 1.0
