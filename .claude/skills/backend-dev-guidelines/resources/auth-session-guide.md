# Authentication & Session Management

Complete guide to authentication, authorization, and session management using Redis and JWT patterns.

## Table of Contents

- [Overview](#overview)
- [Session Architecture](#session-architecture)
- [Session Flow](#session-flow)
- [SessionInfo Interface](#sessioninfo-interface)
- [SessionService](#sessionservice)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [AuthorizeGuard Flow](#authorizeguard-flow)
- [Password Security](#password-security)
- [Security Features](#security-features)
- [Production Considerations](#production-considerations)

---

## Overview

AI-Nx-Starter uses a **Redis-based session management system** with Bearer token authentication. Sessions are stored server-side in Redis with automatic expiration.

### Session Architecture

```
Client → Bearer Token → AuthorizeGuard → SessionService → Redis → SessionInfo → Controller
```

---

## Session Flow

### 1. Login (`POST /auth/login`)

**Location**: `apps/web-server/src/app/auth/auth.service.ts:23`

```typescript
async login(loginUserDto: LoginUserDto, userIp: string)
```

**Process**:

1. User submits email + password via `LoginUserDto`
2. System queries MongoDB for user with `findByEmailWithPassword()`
3. Verifies password using bcrypt: `bcrypt.compare(plainPassword, hashedPassword)`
4. Generates 64-character hex token: `randomBytes(32).toString('hex')`
5. Creates `SessionInfo` object with:
   - User details (userId, email, role, phone, picture)
   - Timestamps (creationDate, createdAt, expiresAt)
   - Security fingerprints (fingerprint, clientId)
   - Server version
6. Stores session in Redis with token as key and 30-day TTL (2,592,000 seconds)
7. Returns `{ token, user: ClientUserDto }`

**Response Example**:

```json
{
  "token": "a1b2c3d4e5f6...64-char-hex",
  "user": {
    "id": "user-123",
    "email": "admin@example.com",
    "role": "Admin",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### 2. Session Validation (Every Protected Request)

**Location**: `packages/backend-common/src/guards/authorize.guard.ts:25`

```typescript
async canActivate(context: ExecutionContext): Promise<boolean>
```

**Process**:

1. Client sends HTTP request with header: `Authorization: Bearer <token>`
2. `AuthorizeGuard` extracts token from `Authorization` header
3. Calls `SessionService.getSession(token)` to retrieve session from Redis
4. Validates:
   - Session exists in Redis
   - Session not expired (`sessionInfo.expiresAt > Date.now()`)
   - User role has sufficient permissions (see RBAC below)
5. If valid, attaches `SessionInfo` to `request.session`
6. Controller receives request with populated `@Session()` parameter

**Example Controller Access**:

```typescript
@Get('profile')
@Authorize(Role.Admin)
async getProfile(@Session() session: SessionInfo) {
  // session.userId, session.email, session.role available
  return this.userService.findById(session.userId);
}
```

### 3. Logout (`POST /auth/logout`)

**Location**: `apps/web-server/src/app/auth/auth.service.ts:86`

**Process**:

1. Receives session token from Authorization header
2. Calls `SessionService.killSessionByToken(token)`
3. Deletes session from Redis
4. Client should discard token locally

## SessionInfo Interface

**Location**: `packages/backend-common/src/interfaces/session-info.interface.ts`

```typescript
export interface SessionInfo {
  userId: string; // MongoDB user ID
  email: string; // User email
  phone?: string; // Optional phone number
  role: Role; // User role (Root, Admin, etc.)
  picture?: string; // Profile picture URL
  creationDate: number; // Unix timestamp (ms) when session created
  createdAt: number; // Duplicate of creationDate
  expiresAt: number; // Unix timestamp (ms) when session expires
  serverVersion: string; // Server version that created session
  fingerprint: string; // Random 32-char hex for session tracking
  clientId: string; // Random 32-char hex for client tracking
}
```

## SessionService

**Location**: `packages/backend-common/src/services/session.service.ts`

### Key Methods

#### `createSessionWithToken(sessionInfo, userIp, token, ttl)`

Creates a new session in Redis.

**Parameters**:

- `sessionInfo: SessionInfo` - User session data
- `userIp: string` - Client IP address (stored but not currently validated)
- `token: string` - Pre-generated session token
- `ttl?: number` - Time to live in seconds (default: 2,101,350 sec ≈ 24 days)

**Storage Format in Redis**:

```json
{
  "userIp": "192.168.1.100",
  "sessionInfo": { ...SessionInfo },
  "id": "user-123"
}
```

#### `getSession(sessionToken): Promise<SessionInfo | null>`

Retrieves session from Redis by token.

**Returns**: `SessionInfo` if session exists, `null` otherwise

#### `updateSession(sessionToken, sessionInfo)`

Updates existing session data in Redis while preserving TTL.

**Throws**: `UnauthorizedLoginException` if session doesn't exist

#### `killSessionByToken(sessionToken): Promise<void>`

Deletes session from Redis (used for logout).

### Configuration

**Redis Connection** (from environment variables):

```typescript
{
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  db: RedisDb.Sessions,  // DB 0
  connectTimeout: 10000
}
```

**Default Session Expiration**:

- Environment: `TIME_BEFORE_SESSION_EXPIRE_MS`
- Default: 2,101,350,000 ms ≈ 24.3 days
- Auth Service Override: 2,592,000 seconds = 30 days

## Role-Based Access Control (RBAC)

**Location**: `packages/backend-common/src/guards/authorize.guard.ts:76`

### Role Hierarchy

Roles have numeric weights. Higher weight = more permissions.

```typescript
userRoleWeights = new Map<Role, number>([
  [Role.Root, 120], // Highest privileges
  [Role.Admin, 90], // Standard admin
  [Role.User, 60], // Regular user
]);
```

**Add custom roles** by setting weights between 0-120.

### Role Validation Logic

```typescript
isUserRoleValid(requiredRole: Role, sessionInfo: SessionInfo): boolean {
  const userWeight = this.userRoleWeights.get(sessionInfo.role);
  const requiredWeight = this.userRoleWeights.get(requiredRole);

  return userWeight >= requiredWeight;
}
```

**Examples**:

- Root (120) can access Root (120), Admin (90), and custom roles
- Admin (90) can access Admin (90) and below, but NOT Root (120)

### Using Authorization in Controllers

**Location**: `apps/web-server/src/app/features/user/user.controller.ts`

#### Require Specific Role

```typescript
import { Authorize, Session, SessionInfo } from '@ai-nx-starter/backend-common';
import { Role } from '@ai-nx-starter/types';

@Controller('users')
export class UserController {
  @Get('profile')
  @Authorize(Role.User) // Requires User or higher (most common)
  async getProfile(@Session() session: SessionInfo) {
    // Any authenticated user (weight >= 60) can access
    return this.userService.findById(session.userId);
  }

  @Get()
  @Authorize(Role.Admin) // Requires Admin or higher
  async getAll(@Session() session: SessionInfo) {
    // Only users with role weight >= 90 can access
  }

  @Delete(':id')
  @Authorize(Role.Root) // Requires Root only
  async delete(@Param('id') id: string, @Session() session: SessionInfo) {
    // Only users with role weight >= 120 can access
  }
}
```

#### Public Endpoints (No Auth)

```typescript
import { IgnoreAuthorization } from '@ai-nx-starter/backend-common';

@Controller('health')
export class HealthController {
  @Get()
  @IgnoreAuthorization() // No authentication required
  async check() {
    return { status: 'ok' };
  }
}
```

**Note**: If `@IgnoreAuthorization()` is set but client sends a Bearer token, the guard will still populate `request.session` if token is valid.

#### Default Role Behavior

If no `@Authorize()` decorator is specified, the default required role is `Role.Root` (strictest).

## AuthorizeGuard Flow

**Location**: `packages/backend-common/src/guards/authorize.guard.ts:25`

```typescript
async canActivate(context: ExecutionContext): Promise<boolean>
```

1. **Check for @IgnoreAuthorization**
   - If set, skip validation (optionally populate session if token present)
   - Return `true`

2. **Extract Bearer Token**
   - Read `Authorization: Bearer <token>` header
   - If missing → throw `SessionExpiredException`

3. **Retrieve Session from Redis**
   - Call `SessionService.getSession(token)`
   - If not found → throw `SessionExpiredException`

4. **Validate Role**
   - Get required role from `@Authorize()` decorator (default: Root)
   - Check `userWeight >= requiredWeight`
   - If insufficient → throw `ForbiddenException`

5. **Check Expiration**
   - Compare `sessionInfo.expiresAt` with `Date.now()`
   - If expired → delete session, throw `SessionExpiredException`

6. **Attach Session to Request**
   - Set `request.session = sessionInfo`
   - Controller can access via `@Session()` decorator

## Password Security

**Location**: `packages/data-access-layer/src/features/user/services/user.db-service.ts`

### Hashing (on User Creation)

```typescript
import * as bcrypt from 'bcrypt';

const saltRounds = 10;
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
```

### Verification (on Login)

```typescript
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

### Database Storage

- Password field has `select: false` in UserEntity
- Regular queries exclude password
- Only `findByEmailWithPassword()` includes it (used only for login)

**Entity Definition**:

```typescript
@Entity('users')
export class UserEntity {
  @Column({ select: false })
  password: string;
}
```

## Security Features

### Token Generation

- Uses `crypto.randomBytes(32).toString('hex')` for cryptographically secure tokens
- 64-character hexadecimal string = 256 bits of entropy

### Session Storage

- Server-side storage in Redis (tokens never stored in cookies/localStorage)
- Client only stores opaque token
- Session data not accessible to client

### Automatic Expiration

- Redis TTL ensures sessions auto-delete after expiration
- Guard validates `expiresAt` before processing request
- Expired sessions deleted immediately

### IP Tracking

- User IP stored with session (currently for logging only)
- Can be extended for IP-based validation or anomaly detection

### Fingerprinting

- Session includes `fingerprint` and `clientId` fields
- Can be used for multi-session management or device tracking

## Exception Types

**Location**: `packages/backend-common/src/exceptions/`

### `SessionExpiredException`

- Thrown when session is missing, expired, or invalid
- HTTP Status: 401 Unauthorized
- Client should redirect to login

### `UnauthorizedLoginException`

- Thrown when login credentials are invalid
- HTTP Status: 401 Unauthorized

### `ForbiddenException` (NestJS built-in)

- Thrown when user lacks required role
- HTTP Status: 403 Forbidden
- User is authenticated but not authorized

## Environment Configuration

**Required Environment Variables** (`.env`):

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Session Configuration
TIME_BEFORE_SESSION_EXPIRE_MS=2592000000 # 30 days in milliseconds

# Database
MONGO_URI=mongodb://localhost:27017/ai-nx-starter
```

## Frontend Integration

**Location**: `apps/web-ui/src/app/core/services/ui-app-context.service.ts`

### Storing Token

```typescript
localStorage.setItem('authToken', token);
```

### Sending Token with Requests

Angular HTTP interceptor automatically adds header:

```typescript
Authorization: Bearer<token>;
```

### Handling Session Expiration

```typescript
// On 401 response
localStorage.removeItem('authToken');
router.navigate(['/login']);
```

## Production Considerations

### Session TTL

- Default 30 days may be too long for sensitive applications
- Consider shorter TTL (e.g., 1-7 days) based on security requirements
- Implement "Remember Me" as separate longer-lived token

### Redis High Availability

- Use Redis Sentinel for automatic failover
- Use Redis Cluster for horizontal scaling
- Enable persistence (AOF + RDB) for session recovery

### Session Rotation

- Rotate session token on privilege escalation
- Consider rotating after password change
- Implement forced logout for compromised accounts

### Multi-Device Management

- Store device info in session
- List active sessions per user
- Allow users to revoke sessions from other devices

### IP Validation (Optional Enhancement)

```typescript
if (storedIp !== requestIp) {
  // Flag as suspicious or require re-authentication
}
```

### Rate Limiting

- Limit login attempts per IP
- Limit session creation per user
- Use `@nestjs/throttler` for API rate limiting

## Testing

### Unit Tests

**Location**: `packages/backend-common/src/services/session.service.spec.ts`

### Integration Tests

**Location**: `apps/web-server/src/app/auth/auth.service.spec.ts`

### Manual Testing

```bash
# Login
curl -X POST http://localhost:3030/ai-nx-starter/rest/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin"}'

# Use returned token
export TOKEN="your-token-here"

# Access protected endpoint
curl http://localhost:3030/ai-nx-starter/rest/api/v2/users \
  -H "Authorization: Bearer $TOKEN"

# Logout
curl -X POST http://localhost:3030/ai-nx-starter/rest/api/v2/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### "Session token not found"

- Client didn't send `Authorization` header
- Header format incorrect (should be `Bearer <token>`)

### "Session not found"

- Token doesn't exist in Redis (expired or never created)
- Redis connection failed
- Token was manually deleted

### "Session Expired"

- `sessionInfo.expiresAt < Date.now()`
- User needs to re-authenticate

### "User does not have required role"

- User role weight < required role weight
- Check role in session vs decorator

### Redis Connection Issues

- Verify `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- Check Redis is running: `redis-cli ping`
- Check network connectivity

---

**Related Files:**

- [SKILL.md](../SKILL.md) - Main guide
- [controllers-guide.md](controllers-guide.md) - Controller patterns
- [services-guide.md](services-guide.md) - Service patterns
- [database-patterns-guide.md](database-patterns-guide.md) - DbService patterns
- [security-guide.md](security-guide.md) - Input validation, authorization, password security
- [logging-guide.md](logging-guide.md) - Logging patterns
- [testing-guide.md](testing-guide.md) - AI testing guidelines
- [code-coverage-guide.md](code-coverage-guide.md) - Coverage exclusion guidelines
