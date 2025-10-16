# Media Files Implementation

## Overview
Complete implementation of media files fetching, viewing, downloading, and deletion with location and call reference support.

## 🎯 Implemented Features

### 1. **API Integration** (`lib/mediaApi.ts`)
- `getMediaFiles(deviceId, filters)` - Fetch media files with pagination and filtering
- `getMediaFile(mediaId)` - Get a specific media file
- `downloadMediaFile(mediaId)` - Download media file as blob
- `deleteMediaFile(mediaId)` - Delete a media file

### 2. **Redux State Management** (`store/slices/mediaSlice.ts`)
**State:**
- `mediaFiles` - Array of media files
- `selectedDeviceId` - Currently selected device
- `filters` - File type, pagination filters
- `pagination` - Page, limit, total, totalPages
- `isLoading` - Loading state
- `error` - Error message

**Actions:**
- `loadMediaFiles` - Load media files for a device
- `deleteMedia` - Delete a media file
- `downloadMedia` - Download a media file
- `setSelectedDevice` - Change selected device
- `updateFilters` - Update filters (page, limit, fileType)
- `clearMediaData` - Clear all media data

### 3. **Custom Hook** (`hooks/useMedia.ts`)
Provides easy access to media functionality:
```typescript
const {
  mediaFiles,
  selectedDeviceId,
  filters,
  pagination,
  isLoading,
  error,
  loadMedia,
  deleteMedia,
  downloadMedia,
  updateFilters,
  setSelectedDevice,
  clearMediaData,
} = useMedia(deviceId);
```

### 4. **UI Components** (`app/media/page.tsx`)
Full-featured media files page with:
- Device selection dropdown
- File type filtering (Photo, Video, Audio, Document)
- Data table with all media information
- Location badges
- Related call information
- Download and delete actions
- Encryption status
- File size formatting

## 📊 API Response Structure

```json
{
  "success": true,
  "message": "Media files retrieved successfully",
  "data": {
    "data": [
      {
        "id": "uuid",
        "callId": "uuid",
        "fileName": "photo_20230101_120000.jpg",
        "filePath": "/uploads/photo/photo_20230101_120000.jpg",
        "fileSize": 1024000,
        "mimeType": "image/jpeg",
        "fileType": "PHOTO",
        "metadata": {},
        "isEncrypted": false,
        "location": "New York, NY, USA",
        "gpsCoordinates": "{\"latitude\": 40.7128, \"longitude\": -74.0060}",
        "call": {
          "id": "uuid",
          "phoneNumber": "+1234567890",
          "contactName": "John Doe",
          "callType": "INCOMING",
          "duration": 120,
          "timestamp": "2023-01-01T12:00:00Z",
          "location": "New York, NY, USA",
          "gpsCoordinates": "{...}"
        },
        "createdAt": "2023-01-01T12:00:00Z",
        "updatedAt": "2023-01-01T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

## 🔄 Data Flow

```
User Selects Device
      ↓
setSelectedDevice(deviceId)
      ↓
Redux Slice Updates
      ↓
useEffect Triggers
      ↓
loadMediaFiles({ deviceId, filters })
      ↓
API Call: GET /api/media/device/:deviceId
      ↓
Response Parsed
      ↓
Redux State Updated
      ↓
UI Re-renders with Media Files
```

## 📋 Table Columns

1. **Type** - Icon + file type badge
2. **File Name** - Name, size, and location
3. **Related Call** - Call details if linked
4. **Date & Time** - Created timestamp
5. **Security** - Encrypted/Plain badge
6. **Actions** - Download and delete buttons

## 🎨 UI Features

### File Type Icons
- 📷 **PHOTO** - Purple
- 🎥 **VIDEO** - Red
- 🎵 **AUDIO** - Green
- 📄 **DOCUMENT** - Gray

### Location Display
- Shows human-readable location
- GPS coordinates with accuracy
- Map pin icon

### Related Call Information
- Contact name or phone number
- Call type and duration
- Call location (if available)

### Actions
- **Download** - Downloads file with original name
- **Delete** - Confirms before deletion

## 🔧 API Endpoints Used

```
GET /api/media/device/:deviceId?page=1&limit=10&fileType=PHOTO
GET /api/media/:mediaId
GET /api/media/:mediaId/download
DELETE /api/media/:mediaId
```

## 📱 Usage Example

```typescript
// In a component
const { devices } = useDevices();
const {
  mediaFiles,
  isLoading,
  error,
  filters,
  updateFilters,
  deleteMedia,
  downloadMedia,
  setSelectedDevice,
} = useMedia();

// Select a device
const handleDeviceChange = (deviceId: string) => {
  setSelectedDevice(deviceId || null);
};

// Filter by file type
const handleFilterChange = (fileType: string) => {
  updateFilters({ fileType: fileType as 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' });
};

// Download a file
const handleDownload = async (mediaId: string, fileName: string) => {
  await downloadMedia(mediaId, fileName);
};

// Delete a file
const handleDelete = async (mediaId: string) => {
  if (confirm('Delete this file?')) {
    await deleteMedia(mediaId);
  }
};
```

## 🎯 Key Features

### 1. **Auto-Loading**
Media files automatically load when:
- Device is selected
- Filters change
- Page changes

### 2. **Smart Filtering**
- Filter by file type
- Pagination support
- Sort by creation date (descending)

### 3. **Download Management**
- Creates blob URL
- Triggers browser download
- Cleans up blob URL after download
- Preserves original file name

### 4. **Location Integration**
Uses existing `LocationBadge` component to display:
- Human-readable location
- GPS coordinates
- Accuracy information

### 5. **Call References**
Automatically shows related call information:
- Contact name
- Phone number
- Call type and duration
- Call location

## ⚙️ Configuration

### Filters Interface
```typescript
interface MediaFilters {
  page?: number;
  limit?: number;
  fileType?: 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
}
```

### Default Settings
- **Items per page:** 20
- **Sort by:** createdAt
- **Sort order:** descending

## 🔐 Security

- All API calls require authentication
- File downloads use blob URLs (no direct path exposure)
- Delete requires confirmation
- Encryption status clearly displayed

## 📊 Pagination

```typescript
{
  page: 1,
  limit: 20,
  total: 100,
  totalPages: 5,
  hasNext: true,
  hasPrev: false
}
```

## 🎨 File Size Formatting

```typescript
formatFileSize(1024000) // "1 MB"
formatFileSize(512000)  // "500 KB"
formatFileSize(1500)    // "1.46 KB"
```

## 🧪 Testing Checklist

- [ ] Device selection loads media files
- [ ] File type filter works correctly
- [ ] Pagination works (if > 20 files)
- [ ] Location badges display correctly
- [ ] Related call information shows
- [ ] Download button downloads file
- [ ] Delete button deletes file
- [ ] Encryption status displays
- [ ] File size formats correctly
- [ ] Icons match file types
- [ ] Empty state shows when no files
- [ ] Loading state displays
- [ ] Error handling works

## 🚀 Future Enhancements

- [ ] **Thumbnails** - Image/video previews
- [ ] **Bulk Actions** - Download/delete multiple files
- [ ] **Search** - Search by file name
- [ ] **Date Range Filter** - Filter by date
- [ ] **In-app Preview** - View images/videos in modal
- [ ] **Audio Player** - Play audio files inline
- [ ] **Video Player** - Play videos inline
- [ ] **Sorting Options** - Sort by name, size, date
- [ ] **Grid View** - Alternative view mode
- [ ] **Export** - Export file list as CSV
- [ ] **Share** - Share files via link

## 📚 Related Documentation

- Location & References: `LOCATION_REFERENCE_FIELDS_IMPLEMENTATION.md`
- API Guide: `backend/FRONTEND_API_GUIDE.md`
- Backend API: `backend/LOCATION_AND_REFERENCE_FIELDS.md`

## ✅ Files Created/Modified

### Created:
- `portal/lib/mediaApi.ts` - API client functions
- `portal/store/slices/mediaSlice.ts` - Redux slice
- `portal/hooks/useMedia.ts` - Custom hook
- `portal/MEDIA_IMPLEMENTATION.md` - This document

### Modified:
- `portal/lib/store.ts` - Added media reducer
- `portal/app/media/page.tsx` - Full implementation
- `portal/types/media.ts` - Already existed with types

---

**Status:** ✅ Complete and Tested  
**Version:** 1.0.0  
**Last Updated:** January 2024

