# Location and Reference Fields - Frontend Implementation

## Overview
This document describes the frontend implementation of location tracking and cross-reference features based on the backend API updates documented in `backend/LOCATION_AND_REFERENCE_FIELDS.md`.

## 📦 New Components Created

### 1. **LocationBadge** (`components/ui/LocationBadge.tsx`)
A reusable component that displays location information in a compact badge format.

**Features:**
- Shows human-readable location or GPS coordinates
- Optional accuracy display
- Compact design with map pin icon
- Tooltip for full location text

**Usage:**
```tsx
<LocationBadge 
  location="New York, NY, USA" 
  gpsCoordinates='{"latitude": 40.7128, "longitude": -74.0060, "accuracy": 15.5}'
  showCoordinates={true}
/>
```

### 2. **MediaBadge** (`components/ui/MediaBadge.tsx`)
Displays associated media files with appropriate icons and styling.

**Features:**
- File type-specific icons (Audio, Photo, Video, Document)
- Color-coded by media type
- Shows file name and size
- Clickable with external link indicator

**Usage:**
```tsx
<MediaBadge 
  media={callLog.media} 
  showSize={true} 
/>
```

### 3. **GPSMapViewer** (`components/ui/GPSMapViewer.tsx`)
Detailed GPS coordinate viewer with expandable information.

**Features:**
- Displays latitude/longitude
- Shows accuracy, altitude, speed, heading (when available)
- "Open in Google Maps" button
- Expandable details section
- Speed conversion (m/s to km/h)
- Heading visualization with rotating compass icon

**Usage:**
```tsx
<GPSMapViewer 
  location="San Francisco, CA"
  gpsCoordinates='{"latitude": 37.7749, "longitude": -122.4194, "accuracy": 10}'
/>
```

### 4. **CallLogDetailModal** (`components/call-logs/CallLogDetailModal.tsx`)
Full-featured modal for viewing complete call log details.

**Features:**
- All call information (phone, contact, type, duration)
- Associated media display
- GPS location with map viewer
- Record timestamps
- Responsive design

**Usage:**
```tsx
<CallLogDetailModal
  callLog={selectedCallLog}
  isOpen={isDetailModalOpen}
  onClose={() => setIsDetailModalOpen(false)}
/>
```

## 🔄 Updated Type Definitions

### **CallLog Interface** (`types/callLog.ts`)
Added new fields:
```typescript
export interface CallLog {
  // ... existing fields
  location?: string;           // Human-readable location
  gpsCoordinates?: string;     // GPS data as JSON string
  mediaId?: string;            // Reference to media file
  media?: Media;               // Auto-populated media details
}
```

### **Message Interface** (`types/message.ts`)
Added new fields:
```typescript
export interface Message {
  // ... existing fields
  location?: string;           // Human-readable location
  gpsCoordinates?: string;     // GPS data as JSON string
}
```

### **Media Interface** (`types/media.ts`)
New comprehensive media type definition:
```typescript
export interface Media {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileType: 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  location?: string;
  gpsCoordinates?: string;
  callId?: string;             // Reference to call log
  call?: CallLog;              // Auto-populated call details
  metadata?: Record<string, unknown>;
  isEncrypted?: boolean;
  deviceId: string;
  createdAt: string;
  updatedAt: string;
}
```

### **Helper Types and Functions** (`types/media.ts`)
```typescript
export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
}

export const parseGPSCoordinates = (gpsString?: string): GPSCoordinates | null;
export const formatFileSize = (bytes: number): string;
```

## 📄 Updated Pages

### 1. **Call Logs Page** (`app/call-logs/page.tsx`)
**Enhancements:**
- Location badges in contact name column
- Media badges in timestamp column
- "View Details" action button
- Opens detailed modal with full information

**New Columns:**
- Actions column with "View" button

### 2. **Messages Page** (`app/messages/page.tsx`)
**Enhancements:**
- Location badges in message content column
- Shows location context for each message

### 3. **Media Files Page** (`app/media/page.tsx`) - NEW
**Features:**
- Browse all media files from devices
- Filter by file type (Photo, Video, Audio, Document)
- Shows associated call information
- Location display for each media file
- File size and encryption status
- Related call details with location

**Columns:**
- File type with icon
- File name with size and location
- Related call information
- Date & time
- Security status (Encrypted/Plain)

## 🎨 UI Enhancements

### Color Coding
- **Call Types:**
  - Incoming: Green
  - Outgoing: Blue
  - Missed: Red

- **Media Types:**
  - Audio: Green
  - Photo: Purple
  - Video: Red
  - Document: Gray

### Icons
- 📍 MapPin: Location information
- 📞 Phone: Call-related items
- 🎵 FileAudio: Audio files
- 🖼️ FileImage: Photos
- 🎥 FileVideo: Videos
- 📄 FileText: Documents
- 🧭 Navigation: GPS heading
- 👁️ Eye: View details action

## 🗺️ Navigation Updates

### Sidebar (`components/layout/Sidebar.tsx`)
Added new menu item:
- **Media Files** (`/media`) - Browse all media files

Updated menu order:
1. Dashboard
2. Devices
3. Remote Control
4. Messages
5. Call Logs
6. Contacts
7. Location
8. **Media Files** (NEW)
9. App Activities

## 🔧 Implementation Details

### GPS Coordinate Parsing
GPS coordinates are stored as JSON strings in the database. The frontend parses them:

```typescript
const coords = parseGPSCoordinates(gpsCoordinates);
// Returns: { latitude, longitude, accuracy?, altitude?, speed?, heading? }
```

### Location Display Priority
1. If `location` exists: Show human-readable address
2. If only `gpsCoordinates` exists: Show formatted coordinates
3. If both exist: Show location with coordinates in details

### Media File References
- Call logs with `mediaId` automatically include `media` object
- Media files with `callId` automatically include `call` object
- Frontend checks for existence before displaying

### File Size Formatting
```typescript
formatFileSize(2048000) // Returns: "2 MB"
```

### Speed Conversion
GPS speed is in m/s, converted to km/h for display:
```typescript
const speedKmh = coords.speed * 3.6;
```

## 📱 Responsive Design

All new components are fully responsive:
- **Desktop:** Full details with expanded views
- **Tablet:** Optimized column layout
- **Mobile:** Stacked information, collapsible details

## 🔐 Security Considerations

- Media encryption status clearly displayed
- Sensitive location data only shown to authorized users
- GPS coordinates can be hidden in production if needed

## 🚀 Future Enhancements

### Planned Features:
1. **Interactive Maps:** Embed Google Maps/OpenStreetMap for location visualization
2. **Location History:** Timeline view of device movements
3. **Geofencing:** Alerts when device enters/exits specific areas
4. **Media Gallery:** Grid view with thumbnails for photos/videos
5. **Media Playback:** In-app audio/video player
6. **Export:** Download media files and call logs with location data
7. **Filters:** Filter by location, date range, media type
8. **Search:** Search by location name or coordinates

### API Integration TODO:
The following pages currently use mock data and need API integration:
- [ ] Media Files page (`app/media/page.tsx`)
- [ ] Implement media API client (`lib/mediaApi.ts`)
- [ ] Create media Redux slice (`store/slices/mediaSlice.ts`)
- [ ] Create useMedia hook (`hooks/useMedia.ts`)

## 📊 Data Flow

```
Backend API
    ↓
API Response (with location & references)
    ↓
Redux Store / State
    ↓
Custom Hooks (useCallLogs, useMessages, etc.)
    ↓
Page Components
    ↓
UI Components (LocationBadge, MediaBadge, etc.)
    ↓
User Interface
```

## 🧪 Testing Recommendations

### Test Scenarios:
1. **Call logs with location:** Verify location badge displays correctly
2. **Call logs with media:** Verify media badge and detail modal
3. **Messages with location:** Verify location in message list
4. **Media with call reference:** Verify call details in media view
5. **GPS accuracy:** Test various accuracy values
6. **Missing data:** Verify graceful handling of missing location/media
7. **Long location names:** Test text truncation and tooltips
8. **Google Maps link:** Verify coordinates open correctly in maps

### Edge Cases:
- Invalid GPS JSON strings
- Missing optional fields (accuracy, altitude, etc.)
- Very large/small file sizes
- Long file names
- Null/undefined location data

## 📚 Related Documentation

- Backend API: `backend/LOCATION_AND_REFERENCE_FIELDS.md`
- API Guide: `backend/FRONTEND_API_GUIDE.md`
- WebSocket: `backend/WEBSOCKET_SIGNALING.md`

## ✅ Backward Compatibility

All changes are **backward compatible**:
- ✅ Existing call logs without location work normally
- ✅ Messages without location display correctly
- ✅ Call logs without media show no badge
- ✅ Optional fields gracefully handled
- ✅ No breaking changes to existing components

---

**Last Updated:** January 2024  
**Frontend Version:** 1.1.0  
**Implements Backend API:** 1.1.0

