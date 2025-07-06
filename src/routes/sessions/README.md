# Sessions Routes

This directory contains Express.js routes for session management in the Solana App Kit server. These endpoints allow users to manage their device sessions, including creating, updating, revoking, and monitoring sessions.

## API Endpoints

### Session Management

#### Get All Sessions
```
GET /api/sessions
```
- **Description**: Get all sessions for the current authenticated user
- **Access**: Private (requires authentication)
- **Query Parameters**:
  - `device_id` (optional): Filter by specific device ID
  - `status` (optional): Filter by session status (`ACTIVE`, `SIGNED_OUT`, `REVOKED`)
- **Response**: Array of session objects with user information

#### Get Session Count
```
GET /api/sessions/count
```
- **Description**: Get the count of active sessions for the current user
- **Access**: Private (requires authentication)
- **Response**: Object with session count

#### Get Specific Session
```
GET /api/sessions/:sessionId
```
- **Description**: Get details of a specific session by ID
- **Access**: Private (requires authentication)
- **Parameters**:
  - `sessionId`: The ID of the session to retrieve
- **Response**: Session object with user information

#### Create Session
```
POST /api/sessions
```
- **Description**: Create a new session (typically called when user logs in)
- **Access**: Private (requires authentication)
- **Body Parameters**:
  - `device_id` (required): Unique device identifier
  - `expo_push_token` (required): Push notification token
  - `platform` (required): Platform type (`ios`, `android`, `web`, `desktop`)
  - `device_name` (optional): User-friendly device name
  - `os_version` (optional): Operating system version
  - `app_version` (optional): Application version
  - `device_model` (optional): Device model
  - `agent` (optional): User agent string
  - `ip_address` (optional): IP address
  - `country` (optional): Country location
  - `city` (optional): City location
  - `status` (optional): Session status (defaults to `ACTIVE`)
- **Response**: Created session object

#### Update Session
```
PATCH /api/sessions/:sessionId
```
- **Description**: Update an existing session
- **Access**: Private (requires authentication)
- **Parameters**:
  - `sessionId`: The ID of the session to update
- **Body Parameters**: Any of the session fields (except `user_id`)
- **Response**: Updated session object

#### Update Last Seen
```
POST /api/sessions/:sessionId/update-last-seen
```
- **Description**: Update the last seen timestamp for a session
- **Access**: Private (requires authentication)
- **Parameters**:
  - `sessionId`: The ID of the session to update
- **Response**: Success message

#### Sign Out Session
```
POST /api/sessions/:sessionId/signout
```
- **Description**: Sign out a specific session (sets status to `SIGNED_OUT`)
- **Access**: Private (requires authentication)
- **Parameters**:
  - `sessionId`: The ID of the session to sign out
- **Response**: Success message

#### Revoke Session
```
POST /api/sessions/:sessionId/revoke
```
- **Description**: Revoke a specific session (sets status to `REVOKED`)
- **Access**: Private (requires authentication)
- **Parameters**:
  - `sessionId`: The ID of the session to revoke
- **Response**: Success message

#### Revoke All Sessions
```
POST /api/sessions/revoke-all
```
- **Description**: Revoke all sessions except the current one
- **Access**: Private (requires authentication)
- **Body Parameters**:
  - `currentSessionId` (required): The ID of the current session to preserve
- **Response**: Success message with count of revoked sessions

#### Delete Session
```
DELETE /api/sessions/:sessionId
```
- **Description**: Permanently delete a session
- **Access**: Private (requires authentication)
- **Parameters**:
  - `sessionId`: The ID of the session to delete
- **Response**: 204 No Content on success

## Usage Examples

### Creating a Session on Login
```javascript
const response = await fetch('/api/sessions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    device_id: 'unique-device-id',
    expo_push_token: 'expo-push-token',
    platform: 'ios',
    device_name: 'iPhone 14',
    os_version: '16.0',
    app_version: '1.0.0',
    device_model: 'iPhone14,7'
  })
});
```

### Getting User Sessions
```javascript
const response = await fetch('/api/sessions', {
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});
const sessions = await response.json();
```

### Revoking All Other Sessions
```javascript
const response = await fetch('/api/sessions/revoke-all', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    currentSessionId: 'current-session-id'
  })
});
```

### Updating Last Seen
```javascript
const response = await fetch(`/api/sessions/${sessionId}/update-last-seen`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});
```

## Security Features

- All endpoints require authentication via the `authMiddleware`
- Users can only access their own sessions
- Session ownership is verified before any operations
- Proper error handling for unauthorized access attempts
- Input validation using Zod schemas

## Session States

- **ACTIVE**: Session is currently active and valid
- **SIGNED_OUT**: Session has been signed out but can be reactivated
- **REVOKED**: Session has been permanently revoked and cannot be reactivated

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common error codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `404`: Not Found (session not found or access denied)
- `409`: Conflict (session already exists)
- `500`: Internal Server Error

## Integration with Authentication

The session management system integrates with the existing authentication middleware and can be used to:

1. Track user logins across different devices
2. Implement "sign out all devices" functionality
3. Monitor active sessions for security purposes
4. Send push notifications to specific devices
5. Enforce session limits or policies 