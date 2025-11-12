# API Reference

Complete API documentation for AI-Nx-Starter backend services.

## Interactive Documentation

**Swagger UI**: [http://localhost:3030/api/docs](http://localhost:3030/api/docs)
**OpenAPI Spec**: [http://localhost:3030/api/docs-json](http://localhost:3030/api/docs-json)

## Base URL

```
http://localhost:3030/ai-nx-starter/rest/api/v2
```

## Authentication

Most endpoints require Bearer token authentication. Obtain a token via the `/auth/login` endpoint.

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@admin.com",
  "password": "admin"
}
```

**Response:**

```json
{
  "token": "a1b2c3d4e5f6...64-char-hex-token",
  "user": { ... }
}
```

Include the token in subsequent requests:

```http
Authorization: Bearer <your-token>
```

### Default Demo User

- **Email**: `admin@admin.com`
- **Password**: `admin`
- **Role**: Admin

---

## API Endpoints

### Authentication

#### POST /auth/login

Authenticate user with email and password.

**Request Body:**

```json
{
  "email": "admin@admin.com",
  "password": "admin"
}
```

**Response (200):**

```json
{
  "token": "a1b2c3d4e5f6...64-char-hex-token",
  "user": {
    "id": "user-123",
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@admin.com",
    "role": "Admin"
  }
}
```

**Errors:**

- `401`: Invalid email or password

---

#### GET /auth/ui-app-context

Get current user session information for UI state management.

**Authorization:** Required (Admin+)

**Response (200):**

```json
{
  "user": { ... },
  "sessionId": "...",
  "expiresAt": 1234567890
}
```

**Errors:**

- `401`: Not authenticated - session expired or invalid
- `403`: Insufficient permissions

---

#### POST /auth/logout

Invalidate current session and remove from Redis.

**Authorization:** Bearer token required in header

**Response (200):**

```json
{}
```

**Errors:**

- `401`: Session does not exist

---

### Users

All user endpoints require **Admin** role.

#### GET /users

Retrieve list of all users with optional pagination.

**Authorization:** Required (Admin+)

**Query Parameters:**

- `limit` (optional): Maximum number of users to return (example: 10)
- `offset` (optional): Number of users to skip (example: 0)

**Response (200):**

```json
[
  {
    "id": "user-123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "Admin",
    "phone": "+1234567890",
    "picture": "https://example.com/avatar.jpg",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z"
  }
]
```

**Errors:**

- `401`: Not authenticated
- `403`: Insufficient permissions (requires Admin)

---

#### GET /users/count

Get total number of users in the system.

**Authorization:** Required (Admin+)

**Response (200):**

```json
{
  "count": 42
}
```

---

#### GET /users/email/:email

Find a specific user by their email address.

**Authorization:** Required (Admin+)

**Path Parameters:**

- `email`: User email address (example: john.doe@example.com)

**Response (200):**

```json
{
  "id": "user-123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "Admin"
}
```

**Errors:**

- `404`: User not found

---

#### GET /users/:id

Find a specific user by their ID.

**Authorization:** Required (Admin+)

**Path Parameters:**

- `id`: User ID (example: user-123)

**Response (200):**

```json
{
  "id": "user-123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "Admin"
}
```

**Errors:**

- `404`: User not found

---

#### POST /users

Create a new user. Email must be unique. Password will be hashed automatically.

**Authorization:** Required (Admin+)

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "role": "Admin",
  "phone": "+1234567890",
  "picture": "https://example.com/avatar.jpg"
}
```

**Response (201):**

```json
{
  "id": "user-456",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "role": "Admin"
}
```

**Errors:**

- `400`: Validation failed or email already exists

---

#### PUT /users/:id

Update an existing user. All fields are optional. Password will be hashed if provided.

**Authorization:** Required (Admin+)

**Path Parameters:**

- `id`: User ID to update (example: user-123)

**Request Body:**

```json
{
  "firstName": "Jane",
  "email": "jane.doe@example.com",
  "password": "NewPass123"
}
```

**Response (200):**

```json
{
  "id": "user-123",
  "firstName": "Jane",
  "email": "jane.doe@example.com",
  "role": "Admin"
}
```

**Errors:**

- `404`: User not found

---

#### DELETE /users/:id

Permanently delete a user from the system.

**Authorization:** Required (Admin+)

**Path Parameters:**

- `id`: User ID to delete (example: user-123)

**Response (204):**
No content

**Errors:**

- `404`: User not found

---

### Examples

Example CRUD endpoints demonstrating standard patterns. All require **Admin** role.

#### GET /examples/examples

Retrieve all examples or filter by name.

**Authorization:** Required (Admin+)

**Query Parameters:**

- `name` (optional): Filter by example name

**Response (200):**

```json
[
  {
    "id": "example-123",
    "name": "Sample Example",
    "age": 25,
    "email": "example@test.com",
    "tags": ["tag1", "tag2"]
  }
]
```

---

#### GET /examples/examples/count

Get total number of examples.

**Authorization:** Required (Admin+)

**Response (200):**

```json
{
  "count": 15
}
```

---

#### GET /examples/examples/:id

Find a specific example by ID.

**Authorization:** Required (Admin+)

**Response (200):**

```json
{
  "id": "example-123",
  "name": "Sample Example",
  "age": 25,
  "email": "example@test.com",
  "tags": ["tag1", "tag2"]
}
```

**Errors:**

- `404`: Example not found

---

#### POST /examples/examples

Create a new example.

**Authorization:** Required (Admin+)

**Request Body:**

```json
{
  "name": "New Example",
  "age": 30,
  "email": "new@example.com",
  "tags": ["demo", "test"]
}
```

**Validation:**

- `name`: 3-50 characters, required
- `age`: 1-120, required
- `email`: Valid email format, optional
- `tags`: Array of strings, required

**Response (201):**

```json
{
  "id": "example-456",
  "name": "New Example",
  "age": 30,
  "email": "new@example.com",
  "tags": ["demo", "test"]
}
```

**Errors:**

- `400`: Validation failed

---

#### PUT /examples/examples/:id

Update an existing example.

**Authorization:** Required (Admin+)

**Request Body:**

```json
{
  "name": "Updated Example",
  "age": 35
}
```

**Response (200):**

```json
{
  "id": "example-123",
  "name": "Updated Example",
  "age": 35,
  "email": "example@test.com",
  "tags": ["tag1", "tag2"]
}
```

**Errors:**

- `404`: Example not found

---

#### PATCH /examples/examples/:id/status/:statusId

Advanced update demonstrating path params, query params, body, and session handling.

**Authorization:** Required (Admin+)

**Path Parameters:**

- `id`: Example ID
- `statusId`: New status ID

**Query Parameters:**

- `priority` (optional): Priority level
- `category` (optional): Category
- `assignee` (optional): Assigned user
- `dueDate` (optional): Due date (ISO 8601)

**Request Body:**

```json
{
  "notes": "Additional notes",
  "metadata": { "key": "value" }
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Advanced update completed for example example-123",
  "data": {
    "id": "example-123",
    "statusId": "status-active",
    "priority": "high",
    "category": "important",
    "assignee": "user-456",
    "dueDate": "2025-12-31T23:59:59.000Z",
    "sessionInfo": { ... },
    "updateData": { ... },
    "processedBy": "Monorepo Kit System v2.0"
  }
}
```

---

#### DELETE /examples/examples/:id

Delete an example.

**Authorization:** Required (Admin+)

**Response (204):**
No content

**Errors:**

- `404`: Example not found

---

### Server-Sent Events (SSE)

Real-time event streaming endpoints.

#### GET /events/stream-to-user/:userId

Subscribe to Server-Sent Events for a specific user.

**Note:** Token must be passed as query parameter (EventSource cannot send headers).

**Path Parameters:**

- `userId`: User ID to stream events for

**Query Parameters:**

- `token` (required): Session token from /auth/login
- `types` (optional): Comma-separated event types to filter

**Event Types:**

- `FlowStarted`
- `FlowCompleted`
- `FlowFailed`
- `FlowCancelled`
- `ActivityLog`
- `Heartbeat` (sent every 15 seconds)
- `DataUpdate`
- `UserAction`
- `SystemAlert`

**Example:**

```javascript
const eventSource = new EventSource(`/events/stream-to-user/user-123?token=${token}&types=DataUpdate,UserAction`);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received event:', data);
};
```

**Event Format:**

```json
{
  "type": "DataUpdate",
  "data": { "message": "Item updated" },
  "userId": "user-123",
  "flowId": "flow-456"
}
```

**Errors:**

- `455`: Session expired or not found
- `401`: Insufficient permissions (requires Admin)

---

#### GET /events/stream-to-all

Subscribe to Server-Sent Events broadcast to all users.

**Query Parameters:**

- `token` (required): Session token from /auth/login
- `types` (optional): Comma-separated event types to filter

**Example:**

```javascript
const eventSource = new EventSource(`/events/stream-to-all?token=${token}`);
```

---

#### POST /events/emit

Manually emit an event to all connected SSE clients (for testing).

**Authorization:** Required (Admin+)

**Request Body:**

```json
{
  "type": "DataUpdate",
  "data": { "message": "Test event" },
  "userId": "user-123",
  "flowId": "flow-456"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Event emitted."
}
```

---

### Exceptions

Demo endpoints for testing custom error handling. All require **Admin** role.

#### GET /examples/exceptions

List all available exception testing endpoints.

**Authorization:** Required (Admin+)

**Response (200):**

```json
{
  "message": "Exception testing endpoints available",
  "endpoints": [
    {
      "path": "/examples/exceptions/session-expired",
      "method": "GET",
      "exception": "SessionExpiredException",
      "statusCode": 455,
      "description": "Triggers a session expired error"
    },
    ...
  ]
}
```

---

#### GET /examples/exceptions/session-expired

Trigger SessionExpiredException (HTTP 455) for testing.

**Authorization:** Required (Admin+)

**Response (455):**

```json
{
  "message": "Your session has expired. Please log in again.",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "sessionId": "demo-session-123",
  "reason": "Token expired after 24 hours of inactivity"
}
```

---

#### GET /examples/exceptions/app-warning

Trigger AppWarningException (HTTP 456) for testing.

**Authorization:** Required (Admin+)

**Response (456):**

```json
{
  "message": "This is a demonstration warning from the application.",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "warningCode": "DEMO_WARNING_001",
  "details": "This warning is triggered for testing purposes..."
}
```

---

#### GET /examples/exceptions/concurrency-error

Trigger ConcurencyException (HTTP 457) for testing optimistic locking conflicts.

**Authorization:** Required (Admin+)

**Response (457):**

```json
{
  "message": "The data has been modified by another user. Please refresh and try again.",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "entityType": "TodoItem",
  "entityId": "demo-item-456",
  "conflictDetails": {
    "lastModifiedBy": "user@example.com",
    "lastModifiedAt": "2025-01-01T00:00:00.000Z",
    "currentVersion": 2,
    "attemptedVersion": 1
  }
}
```

---

#### GET /examples/exceptions/unauthorized-login

Trigger UnauthorizedLoginException (HTTP 458) for testing failed login attempts.

**Authorization:** Required (Admin+)

**Response (458):**

```json
{
  "message": "Invalid credentials or unauthorized access attempt.",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "attemptedEmail": "demo@example.com",
  "loginAttempts": 3,
  "reason": "Invalid password provided",
  "lockoutTime": 300
}
```

---

#### GET /examples/exceptions/app-error

Trigger AppErrorException (HTTP 459) for testing critical application errors.

**Authorization:** Required (Admin+)

**Response (459):**

```json
{
  "message": "A critical application error occurred during processing.",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "errorCode": "DEMO_APP_ERROR_001",
  "context": {
    "operation": "demo-operation",
    "userId": "demo-user-789",
    "requestId": "req-abc123"
  },
  "details": "This is a demonstration of how critical application errors are handled..."
}
```

---

### Health

#### GET /health

Check if the API is running and responsive. No authentication required.

**Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## Error Responses

### Standard HTTP Errors

- **400 Bad Request**: Validation failed or invalid request data
- **401 Unauthorized**: Not authenticated (missing or invalid token)
- **403 Forbidden**: Insufficient permissions for this resource
- **404 Not Found**: Resource not found

### Custom Application Errors

- **455 Session Expired**: User session has expired, re-login required
- **456 App Warning**: Non-critical application warning
- **457 Concurrency Error**: Data modified by another user (optimistic locking conflict)
- **458 Unauthorized Login**: Login attempt failed (invalid credentials)
- **459 App Error**: Critical application error occurred

---

## Data Models

### ClientUserDto

```typescript
{
  id: string;              // User ID
  firstName?: string;      // User first name
  lastName?: string;       // User last name
  role: Role;             // User role (Root, Admin, User)
  email: string;          // User email address
  phone?: string;         // User phone number
  picture?: string;       // User profile picture URL
  createdAt?: Date;       // Creation timestamp
  updatedAt?: Date;       // Last update timestamp
}
```

### CreateUserDto

```typescript
{
  firstName: string;       // Required, user first name
  lastName: string;        // Required, user last name
  email: string;          // Required, must be unique
  password: string;       // Required, minimum 6 characters (will be hashed)
  role: Role;             // Required, user role
  phone?: string;         // Optional, phone number
  picture?: string;       // Optional, profile picture URL
}
```

### UpdateUserDto

All fields optional:

```typescript
{
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;      // Minimum 6 characters (will be hashed)
  role?: Role;
  phone?: string;
  picture?: string;
}
```

### ExampleDto

```typescript
{
  id: string;             // Example ID
  name: string;           // Example name (3-50 characters)
  age: number;            // Age (1-120)
  email?: string;         // Optional email address
  tags: string[];         // Array of tags
}
```

### Role Enum

```typescript
enum Role {
  Root = 'Root', // Highest privilege level
  Admin = 'Admin', // Administrative access
  User = 'User', // Standard user access
}
```

### SyncEventType Enum

```typescript
enum SyncEventType {
  FlowStarted = 'FlowStarted',
  FlowCompleted = 'FlowCompleted',
  FlowFailed = 'FlowFailed',
  FlowCancelled = 'FlowCancelled',
  ActivityLog = 'ActivityLog',
  Heartbeat = 'Heartbeat',
  DataUpdate = 'DataUpdate',
  UserAction = 'UserAction',
  SystemAlert = 'SystemAlert',
}
```

---

## Rate Limiting

Currently no rate limiting is enforced. Consider implementing rate limiting in production environments.

## CORS

CORS is configured to allow requests from the Angular UI running on `http://localhost:4200`.

## Session Management

- Sessions are stored in Redis
- Session tokens are 64-character hex strings
- Tokens expire after 24 hours of inactivity
- Logout invalidates the session immediately

---

For more details, visit the interactive Swagger UI at [http://localhost:3030/api/docs](http://localhost:3030/api/docs).
