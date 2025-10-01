# Error Handling Strategy

## Overview
Centralized error handling ensures that no internal details, stack traces, or file paths are exposed to API clients in production.

## Key Features

### 1. **Automatic Prisma Error Detection**
All Prisma errors (codes starting with 'P') are automatically detected and converted to user-friendly messages.

### 2. **Environment-Based Responses**

#### Development Mode (`NODE_ENV=development`)
```json
{
  "error": {
    "message": "Detailed error message",
    "statusCode": 500,
    "timestamp": "2025-10-01T10:00:00.000Z",
    "stack": "Error: ...\n  at ...",
    "name": "PrismaClientKnownRequestError",
    "originalMessage": "Full internal error message"
  }
}
```

#### Production Mode
```json
{
  "error": {
    "message": "User-friendly message only",
    "statusCode": 500,
    "timestamp": "2025-10-01T10:00:00.000Z"
  }
}
```

### 3. **Sanitization Rules**

In production:
- ❌ No stack traces
- ❌ No file paths
- ❌ No internal error details
- ❌ No database schema information
- ✅ Only user-friendly messages
- ✅ Appropriate HTTP status codes

### 4. **Supported Error Types**

| Error Type | Status Code | User Message |
|------------|-------------|--------------|
| ValidationError | 400 | Validation failed. Please check your input. |
| JsonWebTokenError | 401 | Invalid authentication token. |
| TokenExpiredError | 401 | Authentication token has expired. |
| MulterError | 400 | File upload failed. Please check file size and format. |
| PrismaClientInitializationError | 503 | Database connection failed. Please try again later. |
| Generic 5xx errors | 500 | An internal server error occurred. Please try again later. |

### 5. **Prisma Error Codes**

| Prisma Code | Status | Message |
|-------------|--------|---------|
| P1001 | 503 | Unable to connect to the database. |
| P1008 | 408 | Database operation timed out. |
| P1017 | 503 | Database connection was closed. |
| P2000 | 400 | Input value is too long. |
| P2001 | 404 | The record does not exist. |
| P2002 | 409 | This record already exists. Please use a different value. |
| P2003 | 400 | Related record not found. Please check your input. |
| P2014 | 400 | Invalid ID format provided. |
| P2015 | 404 | Related record not found. |
| P2019 | 400 | Invalid input data. |
| P2025 | 404 | The requested record was not found. |

## Usage in Controllers

### Async Error Handling
Use the `asyncHandler` wrapper to automatically catch errors:

```typescript
import { asyncHandler } from '../middleware/errorHandler';

export const getUser = asyncHandler(async (req, res) => {
  const user = await userRepository.findById(req.params.id);
  if (!user) {
    throw createError('User not found', 404);
  }
  res.json({ user });
});
```

### Custom Errors
Create custom errors with specific status codes:

```typescript
import { createError } from '../middleware/errorHandler';

if (!user) {
  throw createError('User not found', 404);
}

if (user.isBlocked) {
  throw createError('Your account has been blocked', 403);
}
```

### Database Errors
Prisma errors are automatically converted. Just let them propagate:

```typescript
// This will be caught and converted automatically
const user = await prisma.user.create({
  data: { email: 'duplicate@example.com' }
});
// If email exists, returns: "This record already exists. Please use a different value."
```

## Logging

All errors are logged server-side with full details including:
- Error message
- Error name and code
- Stack trace
- Request URL and method
- User IP and User Agent
- User ID (if authenticated)
- Timestamp

**Logs are never sent to the client.**

## Security Benefits

1. ✅ **No information leakage** - Internal paths and structure remain hidden
2. ✅ **Better UX** - Users see friendly, actionable messages
3. ✅ **Debugging enabled** - Developers get full details in logs and dev mode
4. ✅ **Compliance** - Meets security standards for production APIs
5. ✅ **Consistent format** - All errors follow the same structure

## Testing

### Development
Set `NODE_ENV=development` to see full error details including stack traces.

### Production
Set `NODE_ENV=production` to ensure all sensitive information is hidden.

### Example Test
```bash
# In production, this would return a sanitized message
curl http://localhost:3001/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"test"}'
```

## Best Practices

1. ✅ Always use `asyncHandler` for async route handlers
2. ✅ Throw `CustomError` for business logic errors
3. ✅ Let Prisma errors propagate naturally
4. ✅ Never send raw error objects to clients
5. ✅ Always log errors before sanitizing
6. ✅ Use appropriate HTTP status codes

