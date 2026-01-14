# Password Reset Endpoint - Accepted Data Types

## Endpoint
`POST /api/v1/auth/password-reset`

## Authentication
**Required**: JWT token in Authorization header
```
Authorization: Bearer <your-jwt-token>
```

**Note**: This endpoint is for authenticated users only. The user must be logged in to reset their password. The user ID is automatically extracted from the JWT token.

---

## Required Fields

### 1. `current_password` (Required)
- **Type**: `string`
- **Min Length**: 8 characters
- **Example**: `"MyCurrentP@ssw0rd"`
- **Validation**: 
  - Must be at least 8 characters long
  - Must match the user's current password (verified on server)
- **Error**: 
  - 422 if less than 8 characters
  - 403 if password doesn't match current password (detail: "Unauthorized incorrect old password")

### 2. `new_password` (Required)
- **Type**: `string`
- **Min Length**: 8 characters
- **Example**: `"MyNewP@ssw0rd123"`
- **Validation**: 
  - Must be at least 8 characters long
  - Should be different from current password (recommended but not enforced by API)
- **Error**: 
  - 422 if less than 8 characters

---

## Example Request Bodies

### Complete Request
```json
{
  "current_password": "MyCurrentP@ssw0rd",
  "new_password": "MyNewP@ssw0rd123"
}
```

---

## Success Response

### 200 OK
```json
{
  "message": "Password reset successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "User not found"
}
```
**Cause**: User ID from JWT token doesn't exist in database
**Solution**: Ensure valid JWT token with correct user ID

### 403 Forbidden
```json
{
  "detail": "Unauthorized incorrect old password"
}
```
**Cause**: The `current_password` doesn't match the user's actual current password
**Solution**: Verify the current password is correct

### 422 Unprocessable Entity

#### Error: "String should have at least 8 characters"
```json
{
  "detail": [
    {
      "loc": ["body", "current_password"],
      "msg": "String should have at least 8 characters",
      "type": "string_too_short"
    }
  ]
}
```
**Cause**: `current_password` or `new_password` is less than 8 characters
**Solution**: Ensure both passwords are at least 8 characters long

#### Error: "Field required"
```json
{
  "detail": [
    {
      "loc": ["body", "current_password"],
      "msg": "Field required",
      "type": "value_error.missing"
    }
  ]
}
```
**Cause**: A required field is missing from the request
**Solution**: Include both `current_password` and `new_password` in the request

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```
**Cause**: Missing or invalid JWT token
**Solution**: Include valid JWT token in Authorization header

---

## Type Summary Table

| Field | JSON Type | Python Type | Required | Min Length | Validation |
|-------|-----------|-------------|----------|------------|------------|
| `current_password` | `string` | `str` | ✅ Yes | 8 | Must match user's current password |
| `new_password` | `string` | `str` | ✅ Yes | 8 | Must be at least 8 characters |

---

## Important Notes

### 1. Authentication
- **CRITICAL**: This endpoint requires a valid JWT token
- The user ID is automatically extracted from the JWT token's `sub` claim
- Users can only reset their own password
- Token must be included in the `Authorization` header as `Bearer <token>`

### 2. Password Validation
- Both passwords must be at least 8 characters long
- Current password is verified against the database
- New password is hashed before being stored
- Password validation is enforced by Pydantic schema

### 3. Security Considerations
- Passwords are never returned in responses
- Current password is verified before allowing change
- New password is securely hashed using bcrypt before storage
- Use HTTPS in production to encrypt password transmission

### 4. Password Requirements (Recommended for Frontend)
While the API only enforces a minimum length of 8 characters, consider implementing the following password requirements in your frontend for better security:
- At least 8 characters (required by API)
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Not the same as the current password

---

## Testing Examples

### Valid Request (cURL)
```bash
curl -X POST "http://localhost:8000/api/v1/auth/password-reset" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "MyCurrentP@ssw0rd",
    "new_password": "MyNewP@ssw0rd123"
  }'
```

### Valid Request (JavaScript/Fetch)
```javascript
const response = await fetch('/api/v1/auth/password-reset', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    current_password: 'MyCurrentP@ssw0rd',
    new_password: 'MyNewP@ssw0rd123'
  })
});

const data = await response.json();
if (response.ok) {
  console.log(data.message); // "Password reset successfully"
} else {
  console.error(data.detail);
}
```

### Valid Request (TypeScript/axios)
```typescript
import axios from 'axios';

interface PasswordResetRequest {
  current_password: string;
  new_password: string;
}

async function resetPassword(
  token: string,
  data: PasswordResetRequest
): Promise<{ message: string }> {
  const response = await axios.post(
    '/api/v1/auth/password-reset',
    data,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}

// Usage
try {
  const result = await resetPassword(userToken, {
    current_password: 'MyCurrentP@ssw0rd',
    new_password: 'MyNewP@ssw0rd123'
  });
  console.log(result.message);
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error('Error:', error.response?.data.detail);
  }
}
```

### Invalid Request Examples (Will Cause Errors)

#### Missing Current Password
```json
{
  "new_password": "MyNewP@ssw0rd123"
}
```
**Error**: 422 - Field required for `current_password`

#### Password Too Short
```json
{
  "current_password": "MyCurrentP@ssw0rd",
  "new_password": "short"
}
```
**Error**: 422 - String should have at least 8 characters

#### Incorrect Current Password
```json
{
  "current_password": "WrongPassword123",
  "new_password": "MyNewP@ssw0rd123"
}
```
**Error**: 403 - Unauthorized incorrect old password

#### Missing Authorization Header
```bash
curl -X POST "http://localhost:8000/api/v1/auth/password-reset" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "MyCurrentP@ssw0rd",
    "new_password": "MyNewP@ssw0rd123"
  }'
```
**Error**: 401 - Not authenticated

---

## Quick Reference Checklist

Before sending a request, verify:

- [ ] Valid JWT token is included in Authorization header
- [ ] Both `current_password` and `new_password` are present
- [ ] Both passwords are at least 8 characters long
- [ ] `current_password` matches the user's actual current password
- [ ] Request uses POST method
- [ ] Content-Type header is set to `application/json`
- [ ] Using HTTPS in production (for security)

---

## Related Endpoints

### Unauthenticated Password Reset Flow
If a user has forgotten their password, use these endpoints instead:

1. **Request Password Reset Code**
   - `POST /api/v1/auth/password-reset/request`
   - Requires: `email`
   - Sends OTP code to user's email

2. **Confirm Password Reset with Code**
   - `POST /api/v1/auth/password-reset/confirm`
   - Requires: `code`, `new_password`
   - Resets password using OTP code

### Get Current User
- `GET /api/v1/auth/me`
- Returns current authenticated user information
- Useful for displaying user details in the password reset form

