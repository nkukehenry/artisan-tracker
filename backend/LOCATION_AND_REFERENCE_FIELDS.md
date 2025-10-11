# Location and Reference Fields - API Update Guide

## Overview

This document describes the new location tracking and cross-reference features added to the Tracker API. These enhancements allow you to capture location data with calls, messages, and media files, as well as link related records together.

## 📍 New Features

### 1. **Location Data**
All call logs, messages, and media files now support optional location tracking:
- `location` (string): Human-readable location (e.g., "New York, NY, USA")
- `gpsCoordinates` (string): GPS data as JSON string containing latitude, longitude, accuracy, etc.

### 2. **Cross-References**
Records can now reference each other:
- **Call Logs** can reference a `mediaId` (e.g., call recording, screenshot)
- **Media Files** can reference a `callId` (e.g., photo taken during a call)

### 3. **Automatic Related Data Fetching**
When retrieving records, related data is automatically included:
- Fetching a **call log** with a `mediaId` automatically includes the media file details
- Fetching a **media file** with a `callId` automatically includes the call log details

---

## 🎯 Affected Endpoints

### Call Logs Endpoints
- `POST /api/call-logs/upload` - Upload call logs
- `GET /api/call-logs/device/{deviceId}` - Get call logs for a device
- `GET /api/call-logs/{id}` - Get a specific call log

### Messages Endpoints
- `POST /api/messages/upload` - Upload messages
- `GET /api/messages/device/{deviceId}` - Get messages for a device
- `GET /api/messages/{id}` - Get a specific message

### Media Endpoints
- `POST /api/media/upload` - Upload media files
- `GET /api/media/device/{deviceId}` - Get media files for a device
- `GET /api/media/{id}` - Get a specific media file

---

## 📝 Request Examples

### 1. Upload Call Log with Location

**Endpoint:** `POST /api/call-logs/upload`

**Request Body:**
```json
{
  "callLogs": [
    {
      "deviceId": "DEVICE-001",
      "phoneNumber": "+1234567890",
      "contactName": "John Doe",
      "callType": "INCOMING",
      "duration": 120,
      "timestamp": "2024-01-15T10:30:00Z",
      "location": "New York, NY, USA",
      "gpsCoordinates": "{\"latitude\": 40.7128, \"longitude\": -74.0060, \"accuracy\": 15.5}"
    }
  ]
}
```

**New Fields:**
- `location`: Optional human-readable location string
- `gpsCoordinates`: Optional GPS data as JSON string

---

### 2. Upload Call Log with Media Reference

**Endpoint:** `POST /api/call-logs/upload`

**Request Body:**
```json
{
  "callLogs": [
    {
      "deviceId": "DEVICE-001",
      "phoneNumber": "+1234567890",
      "callType": "OUTGOING",
      "duration": 300,
      "timestamp": "2024-01-15T14:20:00Z",
      "mediaId": "media-file-id-123",
      "location": "San Francisco, CA",
      "gpsCoordinates": "{\"latitude\": 37.7749, \"longitude\": -122.4194}"
    }
  ]
}
```

**New Fields:**
- `mediaId`: Optional reference to an associated media file (e.g., call recording)

---

### 3. Upload Message with Location

**Endpoint:** `POST /api/messages/upload`

**Request Body:**
```json
{
  "messages": [
    {
      "deviceId": "DEVICE-001",
      "messageType": "SMS",
      "sender": "+1234567890",
      "recipient": "+0987654321",
      "content": "Hello from New York!",
      "timestamp": "2024-01-15T16:45:00Z",
      "isRead": false,
      "location": "New York, NY, USA",
      "gpsCoordinates": "{\"latitude\": 40.7128, \"longitude\": -74.0060, \"accuracy\": 10}"
    }
  ]
}
```

**New Fields:**
- `location`: Optional location where message was sent
- `gpsCoordinates`: Optional GPS coordinates as JSON string

---

### 4. Upload Media with Call Reference

**Endpoint:** `POST /api/media/upload` (multipart/form-data)

**Form Data:**
```
deviceId: "DEVICE-001"
fileType: "AUDIO"
callId: "call-log-id-456"
location: "Los Angeles, CA"
gpsCoordinates: "{\"latitude\": 34.0522, \"longitude\": -118.2437}"
file: [binary file data]
```

**New Fields:**
- `callId`: Optional reference to an associated call log
- `location`: Optional location where media was captured
- `gpsCoordinates`: Optional GPS data

---

## 📥 Response Examples

### 1. Call Log Response (Without Media)

**Endpoint:** `GET /api/call-logs/device/DEVICE-001`

**Response:**
```json
{
  "success": true,
  "message": "Call logs retrieved successfully",
  "data": {
    "data": [
      {
        "id": "call-log-123",
        "phoneNumber": "+1234567890",
        "contactName": "John Doe",
        "callType": "INCOMING",
        "duration": 120,
        "timestamp": "2024-01-15T10:30:00.000Z",
        "isIncoming": true,
        "location": "New York, NY, USA",
        "gpsCoordinates": "{\"latitude\": 40.7128, \"longitude\": -74.0060, \"accuracy\": 15.5}",
        "deviceId": "device-internal-id",
        "createdAt": "2024-01-15T10:30:05.000Z",
        "updatedAt": "2024-01-15T10:30:05.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

### 2. Call Log Response (With Media)

**Endpoint:** `GET /api/call-logs/device/DEVICE-001`

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "call-log-456",
        "mediaId": "media-file-789",
        "phoneNumber": "+1234567890",
        "contactName": "Jane Smith",
        "callType": "OUTGOING",
        "duration": 300,
        "timestamp": "2024-01-15T14:20:00.000Z",
        "isIncoming": false,
        "location": "San Francisco, CA",
        "gpsCoordinates": "{\"latitude\": 37.7749, \"longitude\": -122.4194}",
        "media": {
          "id": "media-file-789",
          "fileName": "call_recording_20240115_142000.mp3",
          "filePath": "/uploads/audio/call_recording_20240115_142000.mp3",
          "fileSize": 2048000,
          "mimeType": "audio/mpeg",
          "fileType": "AUDIO",
          "location": "San Francisco, CA",
          "gpsCoordinates": "{\"latitude\": 37.7749, \"longitude\": -122.4194}"
        },
        "deviceId": "device-internal-id",
        "createdAt": "2024-01-15T14:20:05.000Z",
        "updatedAt": "2024-01-15T14:20:05.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

**Note:** The `media` object is automatically included when `mediaId` is present.

---

### 3. Message Response with Location

**Endpoint:** `GET /api/messages/device/DEVICE-001`

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "message-123",
        "deviceId": "device-internal-id",
        "messageType": "SMS",
        "sender": "+1234567890",
        "recipient": "+0987654321",
        "content": "Hello from New York!",
        "timestamp": "2024-01-15T16:45:00.000Z",
        "isRead": false,
        "metadata": {},
        "location": "New York, NY, USA",
        "gpsCoordinates": "{\"latitude\": 40.7128, \"longitude\": -74.0060, \"accuracy\": 10}",
        "createdAt": "2024-01-15T16:45:03.000Z",
        "updatedAt": "2024-01-15T16:45:03.000Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 4. Media File Response (With Call)

**Endpoint:** `GET /api/media/device/DEVICE-001`

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "media-file-456",
        "callId": "call-log-789",
        "fileName": "screenshot_call_20240115.jpg",
        "filePath": "/uploads/photo/screenshot_call_20240115.jpg",
        "fileSize": 512000,
        "mimeType": "image/jpeg",
        "fileType": "PHOTO",
        "metadata": {
          "originalName": "screenshot.jpg",
          "uploadedAt": "2024-01-15T10:35:00.000Z"
        },
        "isEncrypted": true,
        "location": "Boston, MA",
        "gpsCoordinates": "{\"latitude\": 42.3601, \"longitude\": -71.0589, \"accuracy\": 20}",
        "call": {
          "id": "call-log-789",
          "phoneNumber": "+1234567890",
          "contactName": "John Doe",
          "callType": "INCOMING",
          "duration": 180,
          "timestamp": "2024-01-15T10:30:00.000Z",
          "location": "Boston, MA",
          "gpsCoordinates": "{\"latitude\": 42.3601, \"longitude\": -71.0589}"
        },
        "deviceId": "device-internal-id",
        "createdAt": "2024-01-15T10:35:00.000Z",
        "updatedAt": "2024-01-15T10:35:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

**Note:** The `call` object is automatically included when `callId` is present.

---

## 🔄 GPS Coordinates Format

The `gpsCoordinates` field is a **JSON string** (not a JSON object) that can contain:

### Minimum Format:
```json
"{\"latitude\": 40.7128, \"longitude\": -74.0060}"
```

### Extended Format:
```json
"{\"latitude\": 40.7128, \"longitude\": -74.0060, \"accuracy\": 15.5, \"altitude\": 10.0, \"speed\": 0, \"heading\": 0}"
```

### Fields:
- `latitude` (number): Latitude coordinate (-90 to 90)
- `longitude` (number): Longitude coordinate (-180 to 180)
- `accuracy` (number, optional): Accuracy in meters
- `altitude` (number, optional): Altitude in meters
- `speed` (number, optional): Speed in meters per second
- `heading` (number, optional): Direction in degrees (0-360)

**Why String?** This allows flexibility in storing various GPS data formats without schema changes.

---

## 🔗 Cross-Reference Use Cases

### Use Case 1: Call Recording
1. User receives a call
2. App records the call and saves it as media
3. Upload call log with `mediaId` pointing to the recording
4. When fetching call logs, the recording details are automatically included

### Use Case 2: Screenshot During Call
1. User takes a screenshot during an active call
2. Upload the screenshot with `callId` pointing to the call log
3. When fetching media files, the call details are automatically included

### Use Case 3: Location-Tagged Message
1. User sends a message from a specific location
2. Upload message with `location` and `gpsCoordinates`
3. Display message with location context in the UI

---

## 💡 Frontend Implementation Tips

### 1. Parsing GPS Coordinates
Since `gpsCoordinates` is a string, parse it before use:
```javascript
const coords = JSON.parse(callLog.gpsCoordinates);
// Access: coords.latitude, coords.longitude, coords.accuracy
```

### 2. Displaying Location
Check for location data before displaying:
```javascript
if (callLog.location || callLog.gpsCoordinates) {
  // Show location badge or map pin
}
```

### 3. Handling Related Records
Check if related data exists before accessing:
```javascript
// For call logs with media
if (callLog.media) {
  // Display media thumbnail or play button
  const audioUrl = callLog.media.filePath;
}

// For media with call context
if (mediaFile.call) {
  // Show "From call with John Doe"
  const callerName = mediaFile.call.contactName || mediaFile.call.phoneNumber;
}
```

### 4. Optional Fields
All new fields are **optional** and **backward compatible**:
- Existing records without these fields will work normally
- New records can include or omit these fields
- Always check for existence before using

---

## 📊 Field Summary

### Call Logs
| Field | Type | Optional | Description |
|-------|------|----------|-------------|
| `mediaId` | string | ✅ Yes | Reference to associated media file |
| `location` | string | ✅ Yes | Human-readable location |
| `gpsCoordinates` | string | ✅ Yes | GPS data as JSON string |
| `media` | object | ✅ Yes | Auto-populated media file details |

### Messages
| Field | Type | Optional | Description |
|-------|------|----------|-------------|
| `location` | string | ✅ Yes | Human-readable location |
| `gpsCoordinates` | string | ✅ Yes | GPS data as JSON string |

### Media Files
| Field | Type | Optional | Description |
|-------|------|----------|-------------|
| `callId` | string | ✅ Yes | Reference to associated call log |
| `location` | string | ✅ Yes | Human-readable location |
| `gpsCoordinates` | string | ✅ Yes | GPS data as JSON string |
| `call` | object | ✅ Yes | Auto-populated call log details |

---

## 🚀 Migration Notes

### Backward Compatibility
- ✅ All new fields are optional
- ✅ Existing API calls work without changes
- ✅ Old records continue to function normally
- ✅ No breaking changes to existing responses

### Database Changes
- Database schema updated with new nullable columns
- No data migration required
- Existing records have `null` values for new fields

---

## 📚 Additional Resources

- **API Documentation:** `https://tracker.mutindo.com/api-docs`
- **Base URL (Production):** `https://tracker.mutindo.com/api`
- **Base URL (Development):** `http://localhost:83/api`

### Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer {your-jwt-token}
```

---

## ❓ FAQ

**Q: Is `gpsCoordinates` required if I provide `location`?**  
A: No, both are optional and independent. You can provide one, both, or neither.

**Q: What happens if I reference a non-existent `mediaId` or `callId`?**  
A: The reference is stored, but the nested object won't be populated in responses.

**Q: Can I update location data after upload?**  
A: Currently, location fields are set at creation. Update endpoints will be added in future versions.

**Q: What if the GPS string is invalid JSON?**  
A: The API accepts any string value. Validation is the client's responsibility.

**Q: Are nested objects always included?**  
A: Yes, if the reference ID exists and the related record is found, it's automatically included.

---

**Last Updated:** January 2024  
**API Version:** 1.1.0

