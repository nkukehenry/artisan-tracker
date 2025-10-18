# Frontend Media Implementation Guide

## Overview
This guide covers implementing secure media file operations in the React frontend for listing, viewing, and deleting media files from devices.

## Prerequisites
- User must be authenticated with valid JWT token
- Token must be stored in localStorage or state management
- User must have access to the target device

## Media Operations

### 1. Listing Media Files
**Purpose**: Retrieve all media files for a specific device

**Endpoint**: `GET /api/media/device/{deviceId}`

**Required Headers**:
- Authorization: Bearer token
- Content-Type: application/json

**Query Parameters** (optional):
- page: Page number for pagination
- limit: Number of items per page
- fileType: Filter by file type (PHOTO, VIDEO, AUDIO, etc.)
- search: Search term for file names
- sortBy: Sort field (createdAt, fileName, fileSize)
- sortOrder: Sort direction (asc, desc)

**Response Structure**:
- success: boolean
- message: string
- data: object containing mediaFiles array and pagination info

**Implementation Steps**:
1. Extract deviceId from route params or props
2. Get JWT token from storage
3. Make authenticated API call to list endpoint
4. Handle response and update state
5. Display media files in grid/list format
6. Implement pagination controls
7. Add loading and error states

### 2. Viewing Media Files
**Purpose**: Display media files securely with authentication

**Endpoint**: `GET /api/media/view/{mediaId}`

**Required Headers**:
- Authorization: Bearer token

**Response**: Binary file data (image, video, audio)

**Implementation Steps**:
1. Extract mediaId from media file object
2. Get JWT token from storage
3. Make authenticated API call to view endpoint
4. Convert response to blob
5. Create object URL from blob
6. Display in appropriate HTML element (img, video, audio)
7. Handle different file types appropriately
8. Clean up object URLs to prevent memory leaks
9. Add loading states and error handling

**File Type Handling**:
- Images: Display in `<img>` tags
- Videos: Display in `<video>` tags with controls
- Audio: Display in `<audio>` tags with controls
- Documents: Show download link or preview if possible

### 3. Deleting Media Files
**Purpose**: Remove media files from device and database

**Endpoint**: `DELETE /api/media/{mediaId}`

**Required Headers**:
- Authorization: Bearer token

**Response Structure**:
- success: boolean
- message: string

**Implementation Steps**:
1. Get mediaId from selected media file
2. Get JWT token from storage
3. Show confirmation dialog
4. Make authenticated DELETE request
5. Handle response
6. Remove deleted item from local state
7. Show success/error notifications
8. Refresh media list if needed

## Display Examples

### Image Display
```typescript
const [imageUrl, setImageUrl] = useState<string>('');

useEffect(() => {
  const loadImage = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/media/view/${mediaId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setImageUrl(url);
  };
  loadImage();
}, [mediaId]);

return <img src={imageUrl} alt="Media file" style={{width: '200px', height: 'auto'}} />;
```

### Video Display
```typescript
const [videoUrl, setVideoUrl] = useState<string>('');

useEffect(() => {
  const loadVideo = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/media/view/${mediaId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setVideoUrl(url);
  };
  loadVideo();
}, [mediaId]);

return <video src={videoUrl} controls width="400" height="300" />;
```

### Audio Display
```typescript
const [audioUrl, setAudioUrl] = useState<string>('');

useEffect(() => {
  const loadAudio = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/media/view/${mediaId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
  };
  loadAudio();
}, [mediaId]);

return <audio src={audioUrl} controls />;
```

## Error Handling

### Authentication Errors (401)
- Redirect to login page
- Clear invalid tokens from storage
- Show authentication required message

### Authorization Errors (403)
- Show access denied message
- Log user out if necessary
- Provide contact admin option

### Not Found Errors (404)
- Show file not found message
- Remove from local state
- Refresh media list

### Network Errors
- Show connection error message
- Provide retry option
- Implement offline state handling

## Security Considerations

### Token Management
- Store JWT tokens securely
- Handle token expiration gracefully
- Implement token refresh mechanism
- Clear tokens on logout

### Access Control
- Verify user has device access before listing
- Check permissions before delete operations
- Implement tenant isolation
- Log all media access attempts

### File Security
- Never expose direct file URLs
- Always use authenticated endpoints
- Validate file types on frontend
- Implement file size limits

## User Experience Features

### Loading States
- Show loading spinners during API calls
- Implement skeleton screens for media grid
- Add progress indicators for file operations

### Error States
- Display user-friendly error messages
- Provide retry mechanisms
- Show fallback content for failed loads

### Performance Optimizations
- Implement lazy loading for media files
- Use thumbnail previews for large files
- Implement virtual scrolling for large lists
- Cache frequently accessed media

### Accessibility
- Add alt text for images
- Implement keyboard navigation
- Provide screen reader support
- Ensure proper focus management

## State Management

### Local State
- Media files array
- Loading states
- Error messages
- Selected media items
- Pagination state

### Global State (if using Redux/Context)
- User authentication state
- Device permissions
- Global error handling
- Theme preferences

## Integration Points

### Device Management
- Integrate with device listing pages
- Link from device details to media
- Show media count in device cards

### User Management
- Respect user role permissions
- Implement tenant-based access
- Handle multi-user scenarios

### Navigation
- Breadcrumb navigation
- Back button functionality
- Deep linking support
- URL state management
