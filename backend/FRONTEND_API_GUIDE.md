# Frontend API Guide - Data Fetch Endpoints

## Overview
This guide provides all the GET endpoints available for fetching device data from the Artisan Tracker API. All endpoints require Bearer token authentication.

**Base URL:** `http://localhost:83/api`
**Authentication:** Bearer token in Authorization header

---

## 1. Call Logs

### Get All Call Logs
**Endpoint:** `GET /call-logs/device/{deviceId}`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `callType` (optional): Filter by call type (INCOMING, OUTGOING, MISSED)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "phoneNumber": "+1234567890",
      "contactName": "John Doe",
      "callType": "INCOMING",
      "duration": 120,
      "timestamp": "2024-10-04T10:00:00.000Z",
      "isIncoming": true,
      "createdAt": "2024-10-04T12:48:58.978Z",
      "updatedAt": "2024-10-04T12:48:58.978Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

## 2. Contacts

### Get All Contacts
**Endpoint:** `GET /contacts/device/{deviceId}`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name or phone number

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "John Doe",
      "phoneNumber": "+1234567890",
      "email": "john.doe@email.com",
      "avatar": "https://example.com/avatar.jpg",
      "createdAt": "2024-10-04T12:49:07.983Z",
      "updatedAt": "2024-10-04T12:49:07.983Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 4,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

## 3. Messages

### Get All Messages
**Endpoint:** `GET /messages/device/{deviceId}`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `messageType` (optional): Filter by message type (SMS, WHATSAPP, TELEGRAM)
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "messageType": "SMS",
      "sender": "+1234567890",
      "recipient": "+0987654321",
      "content": "Hello! How are you doing today?",
      "timestamp": "2024-10-04T09:00:00.000Z",
      "isRead": true,
      "metadata": "{\"platform\":\"SMS\"}",
      "createdAt": "2024-10-04T12:49:19.302Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### Get Message Conversations
**Endpoint:** `GET /messages/device/{deviceId}/conversations`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "contact": "+1234567890",
      "messageType": "SMS",
      "messageCount": 1,
      "lastMessage": "Hello! How are you doing today?",
      "lastMessageTime": "2024-10-04T09:00:00.000Z"
    }
  ]
}
```

---

## 4. Location Data

### Get All Location History
**Endpoint:** `GET /location/device/{deviceId}`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "accuracy": 10.5,
      "altitude": 10.0,
      "speed": 5.2,
      "heading": 45.0,
      "address": "New York, NY, USA",
      "timestamp": "2024-10-04T08:00:00.000Z",
      "createdAt": "2024-10-04T12:49:29.992Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### Get Current Location
**Endpoint:** `GET /location/device/{deviceId}/current`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "latitude": 40.7505,
    "longitude": -73.9934,
    "accuracy": 8,
    "altitude": 15,
    "speed": 12.5,
    "heading": 180,
    "address": "Madison Square Garden, New York, NY, USA",
    "timestamp": "2024-10-04T11:00:00.000Z",
    "createdAt": "2024-10-04T12:49:30.076Z"
  }
}
```

**Note:** Returns 404 if no location data exists for the device.

---

## 5. App Activities

### Get All App Activities
**Endpoint:** `GET /app-activities/device/{deviceId}`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `appName` (optional): Filter by app name
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "appName": "WhatsApp",
      "packageName": "com.whatsapp",
      "usageTime": 3600,
      "timestamp": "2024-10-04T10:00:00.000Z",
      "createdAt": "2024-10-04T12:49:40.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### Get App Usage Summary
**Endpoint:** `GET /app-activities/device/{deviceId}/summary`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalApps": 0,
    "totalUsageTime": 0,
    "mostUsedApps": ""
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "deviceId",
      "message": "Device ID must be between 1 and 50 characters"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "No current location found for this device"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Common Query Parameters

### Pagination
- `page`: Page number (starts from 1)
- `limit`: Number of items per page (max 100)

### Date Filtering
- `startDate`: Start date in ISO 8601 format (e.g., "2024-01-01T00:00:00Z")
- `endDate`: End date in ISO 8601 format (e.g., "2024-12-31T23:59:59Z")

### Search and Filtering
- `search`: Text search (varies by endpoint)
- `callType`: Filter call logs by type
- `messageType`: Filter messages by type
- `appName`: Filter app activities by app name

---

## Authentication

All endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer {your-jwt-token}
```

The token should be obtained from the login endpoint and included in all subsequent requests.

---

## Rate Limiting

The API implements rate limiting to prevent abuse. If you exceed the rate limit, you'll receive a 429 status code with the following response:

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60
}
```

---

## Testing

You can test these endpoints using the provided `test.rest` file or any HTTP client like Postman, Insomnia, or curl. The endpoints have been tested with device ID `TEST-DEVICE-001` and contain sample data for demonstration purposes.
