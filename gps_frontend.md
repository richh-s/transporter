# GPS Device Management API - Frontend Documentation

## Base URL
```
/api/v1/gps-devices
```

## Authentication
All endpoints require authentication 
```
```

The API automatically extracts the `organization_id` from the JWT token, so all operations are scoped to the user's organization.

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/gps-devices/` | Create a new GPS device |
| GET | `/api/v1/gps-devices/` | List GPS devices (paginated with filters) |
| GET | `/api/v1/gps-devices/{id}` | Get a single GPS device by ID |
| PUT | `/api/v1/gps-devices/{id}` | Update GPS device metadata |
| PATCH | `/api/v1/gps-devices/{id}/deactivate` | Deactivate a GPS device |

---

## 1. Create GPS Device

**Endpoint:** `POST /api/v1/gps-devices/`

**Description:** Create a new GPS device and bind it to a truck.

**Request Body:**
```json
{
  "external_device_id": "string (required, max 255 chars)",
  "imei_number": "string (required, max 50 chars)",
  "device_name": "string (optional, max 255 chars)",
  "device_model": "string (optional, max 255 chars)",
  "expire_date": "ISO 8601 datetime (required)",
  "last_synced_at": "ISO 8601 datetime (required)",
  "status": "boolean (optional, default: true)",
  "truck_id": "integer (required)"
}
```

**Field Details:**
- `external_device_id` (required): Unique identifier from the GPS device manufacturer. Must be globally unique across all organizations.
- `imei_number` (required): IMEI number of the GPS device. Must be globally unique across all organizations.
- `device_name` (optional): Human-readable name for the device.
- `device_model` (optional): Model name/number of the device.
- `expire_date` (required): Expiration date of the device subscription/service. Format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- `last_synced_at` (required): Last synchronization timestamp. Format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- `status` (optional): Device status (active/inactive). Default: `true`
- `truck_id` (required): ID of the truck to bind this GPS device to. The truck must belong to your organization and not be assigned to another active GPS device.

**Success Response (201 Created):**
```json
{
  "status": true,
  "success_message": "GPS device created successfully",
  "result": {
    "id": 1,
    "organization_id": 5,
    "external_device_id": "GPS-001",
    "imei_number": "123456789012345",
    "device_name": "Main Fleet GPS",
    "device_model": "Model-X",
    "expire_date": "2025-12-31T23:59:59.000Z",
    "last_synced_at": "2024-01-15T10:30:00.000Z",
    "status": true,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid data
  ```json
  {
    "detail": "truck_id is required to create a GPS device."
  }
  ```
- `404 Not Found`: Truck not found or doesn't belong to your organization
  ```json
  {
    "detail": "Truck not found or does not belong to your organization."
  }
  ```
- `409 Conflict`: Duplicate device or truck already assigned
  ```json
  {
    "detail": "GPS device with external_device_id 'GPS-001' already exists."
  }
  ```
  OR
  ```json
  {
    "detail": "GPS device with imei_number '123456789012345' already exists."
  }
  ```
  OR
  ```json
  {
    "detail": "Truck is already bound to another active GPS device."
  }
  ```

**Example Request:**
```javascript
const response = await fetch('/api/v1/gps-devices/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    external_device_id: 'GPS-001',
    imei_number: '123456789012345',
    device_name: 'Main Fleet GPS',
    device_model: 'Model-X',
    expire_date: '2025-12-31T23:59:59.000Z',
    last_synced_at: '2024-01-15T10:30:00.000Z',
    status: true,
    truck_id: 10
  })
});
```

---

## 2. List GPS Devices

**Endpoint:** `GET /api/v1/gps-devices/`

**Description:** Get a paginated list of GPS devices with optional filters.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1, min: 1) |
| `per_page` | integer | No | Items per page (default: 20, min: 1, max: 100) |
| `external_device_id` | string | No | Filter by external device ID |
| `imei_number` | string | No | Filter by IMEI number |
| `device_name` | string | No | Filter by device name |
| `device_model` | string | No | Filter by device model |
| `status` | boolean | No | Filter by status (true/false) |

**Success Response (200 OK):**
```json
{
  "status": true,
  "message": "GPS devices fetched successfully",
  "items": [
    {
      "id": 1,
      "organization_id": 5,
      "external_device_id": "GPS-001",
      "imei_number": "123456789012345",
      "device_name": "Main Fleet GPS",
      "device_model": "Model-X",
      "expire_date": "2025-12-31T23:59:59.000Z",
      "last_synced_at": "2024-01-15T10:30:00.000Z",
      "status": true,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "per_page": 20,
  "pages": 3
}
```

**Example Request:**
```javascript
const response = await fetch('/api/v1/gps-devices/?page=1&per_page=20&status=true', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 3. Get Single GPS Device

**Endpoint:** `GET /api/v1/gps-devices/{id}`

**Description:** Get a single GPS device by its ID.

**Path Parameters:**
- `id` (integer, required): GPS device ID

**Success Response (200 OK):**
```json
{
  "id": 1,
  "organization_id": 5,
  "external_device_id": "GPS-001",
  "imei_number": "123456789012345",
  "device_name": "Main Fleet GPS",
  "device_model": "Model-X",
  "expire_date": "2025-12-31T23:59:59.000Z",
  "last_synced_at": "2024-01-15T10:30:00.000Z",
  "status": true,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: GPS device not found
  ```json
  {
    "detail": "GPS device not found"
  }
  ```

**Example Request:**
```javascript
const response = await fetch('/api/v1/gps-devices/1', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 4. Update GPS Device

**Endpoint:** `PUT /api/v1/gps-devices/{id}`

**Description:** Update GPS device metadata. All fields are optional - only send fields you want to update.

**Path Parameters:**
- `id` (integer, required): GPS device ID

**Request Body (all fields optional):**
```json
{
  "external_device_id": "string (optional, max 255 chars)",
  "imei_number": "string (optional, max 50 chars)",
  "device_name": "string (optional, max 255 chars)",
  "device_model": "string (optional, max 255 chars)",
  "expire_date": "ISO 8601 datetime (optional)",
  "last_synced_at": "ISO 8601 datetime (optional)",
  "status": "boolean (optional)",
  "truck_id": "integer (optional, use 0 to unlink, or truck_id to assign)"
}
```

**Field Details:**
- `truck_id`: 
  - `0` or `null`: Unlink the device from its current truck
  - `truck_id` (integer): Assign/reassign to a different truck (must belong to your organization and not be assigned to another active device)

**Success Response (200 OK):**
```json
{
  "status": true,
  "success_message": "GPS device updated successfully",
  "result": {
    "id": 1,
    "organization_id": 5,
    "external_device_id": "GPS-001-UPDATED",
    "imei_number": "123456789012345",
    "device_name": "Updated Device Name",
    "device_model": "Model-Y",
    "expire_date": "2026-12-31T23:59:59.000Z",
    "last_synced_at": "2024-01-16T10:30:00.000Z",
    "status": true,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-16T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: GPS device not found
  ```json
  {
    "detail": "GPS device not found."
  }
  ```
- `409 Conflict`: Duplicate external_device_id or imei_number, or truck already assigned
  ```json
  {
    "detail": "GPS device with external_device_id 'GPS-002' already exists."
  }
  ```

**Example Request:**
```javascript
const response = await fetch('/api/v1/gps-devices/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    device_name: 'Updated Device Name',
    status: false,
    truck_id: 15  // Reassign to truck 15
  })
});
```

**Example: Unlink from truck:**
```javascript
const response = await fetch('/api/v1/gps-devices/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    truck_id: 0  // Unlink from truck
  })
});
```

---

## 5. Deactivate GPS Device

**Endpoint:** `PATCH /api/v1/gps-devices/{id}/deactivate`

**Description:** Deactivate a GPS device. This will:
- Set `status` to `false`
- Unlink the device from its truck
- Never hard-delete (soft delete + deactivate)

**Path Parameters:**
- `id` (integer, required): GPS device ID

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "status": true,
  "success_message": "GPS device deactivated successfully",
  "result": {
    "id": 1,
    "organization_id": 5,
    "external_device_id": "GPS-001",
    "imei_number": "123456789012345",
    "device_name": "Main Fleet GPS",
    "device_model": "Model-X",
    "expire_date": "2025-12-31T23:59:59.000Z",
    "last_synced_at": "2024-01-15T10:30:00.000Z",
    "status": false,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-16T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: GPS device not found
  ```json
  {
    "detail": "GPS device not found."
  }
  ```

**Example Request:**
```javascript
const response = await fetch('/api/v1/gps-devices/1/deactivate', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Response Field Reference

### GPSDeviceResponse Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique GPS device ID |
| `organization_id` | integer | Organization ID (automatically set from JWT) |
| `external_device_id` | string | Unique external device identifier (globally unique) |
| `imei_number` | string | IMEI number (globally unique) |
| `device_name` | string \| null | Device name |
| `device_model` | string \| null | Device model |
| `expire_date` | datetime | Expiration date (ISO 8601 format) |
| `last_synced_at` | datetime | Last synchronization timestamp (ISO 8601 format) |
| `status` | boolean | Device status (true = active, false = inactive) |
| `created_at` | datetime | Creation timestamp (ISO 8601 format) |
| `updated_at` | datetime | Last update timestamp (ISO 8601 format) |

---

## Validation Rules

### Global Uniqueness
- `external_device_id`: Must be unique across **all organizations** (not just your organization)
- `imei_number`: Must be unique across **all organizations** (not just your organization)

### Truck Binding Rules
- `truck_id` is **required** when creating a GPS device
- The truck must belong to your organization
- The truck must not be assigned to another active GPS device
- When updating, you can:
  - Reassign to a different truck (provide `truck_id`)
  - Unlink from truck (set `truck_id` to `0`)

### Date Formats
All datetime fields must be in ISO 8601 format:
```
YYYY-MM-DDTHH:mm:ss.sssZ
```
Example: `2025-12-31T23:59:59.000Z`

---

## Error Handling

All endpoints may return the following error responses:

### 400 Bad Request
- Missing required fields
- Invalid data format
- Validation errors

### 401 Unauthorized
- Missing or invalid JWT token
```json
{
  "detail": "Not authenticated"
}
```

### 404 Not Found
- GPS device not found
- Truck not found
- Resource doesn't belong to your organization

### 409 Conflict
- Duplicate `external_device_id`
- Duplicate `imei_number`
- Truck already assigned to another active GPS device

### 500 Internal Server Error
- Unexpected server errors

---

## Frontend Implementation Tips

### 1. Date Handling
```javascript
// Convert date to ISO 8601 format
const expireDate = new Date('2025-12-31').toISOString();
// Result: "2025-12-31T00:00:00.000Z"
```

### 2. Form Validation
- Validate `external_device_id` and `imei_number` are not empty
- Check `truck_id` is provided and is a valid integer
- Ensure dates are in correct format
- Validate string lengths (external_device_id: max 255, imei_number: max 50)

### 3. Error Display
```javascript
try {
  const response = await fetch('/api/v1/gps-devices/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    // Display error.detail to user
    console.error('Error:', error.detail);
    return;
  }
  
  const result = await response.json();
  // Handle success
} catch (error) {
  // Handle network errors
}
```

### 4. Pagination
```javascript
// Fetch page 1 with 20 items per page
const url = new URL('/api/v1/gps-devices/', baseURL);
url.searchParams.append('page', '1');
url.searchParams.append('per_page', '20');
url.searchParams.append('status', 'true');

const response = await fetch(url, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 5. Filtering
```javascript
// Build filter query string
const filters = {
  external_device_id: 'GPS-001',
  status: true,
  device_name: 'Main'
};

const queryString = Object.entries(filters)
  .filter(([_, value]) => value !== null && value !== undefined)
  .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
  .join('&');

const url = `/api/v1/gps-devices/?${queryString}`;
```

---

## Complete Example: GPS Device Management Component

```javascript
class GPSDeviceService {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async createDevice(deviceData) {
    const response = await fetch(`${this.baseURL}/api/v1/gps-devices/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(deviceData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create GPS device');
    }
    
    return await response.json();
  }

  async listDevices(page = 1, perPage = 20, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== null && v !== undefined)
      )
    });
    
    const response = await fetch(
      `${this.baseURL}/api/v1/gps-devices/?${params}`,
      {
        headers: { 'Authorization': `Bearer ${this.token}` }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch GPS devices');
    }
    
    return await response.json();
  }

  async getDevice(id) {
    const response = await fetch(
      `${this.baseURL}/api/v1/gps-devices/${id}`,
      {
        headers: { 'Authorization': `Bearer ${this.token}` }
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('GPS device not found');
      }
      throw new Error('Failed to fetch GPS device');
    }
    
    return await response.json();
  }

  async updateDevice(id, updateData) {
    const response = await fetch(
      `${this.baseURL}/api/v1/gps-devices/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(updateData)
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update GPS device');
    }
    
    return await response.json();
  }

  async deactivateDevice(id) {
    const response = await fetch(
      `${this.baseURL}/api/v1/gps-devices/${id}/deactivate`,
      {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${this.token}` }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to deactivate GPS device');
    }
    
    return await response.json();
  }
}

// Usage
const gpsService = new GPSDeviceService('https://api.example.com', 'your-jwt-token');

// Create device
const newDevice = await gpsService.createDevice({
  external_device_id: 'GPS-001',
  imei_number: '123456789012345',
  device_name: 'Main Fleet GPS',
  device_model: 'Model-X',
  expire_date: new Date('2025-12-31').toISOString(),
  last_synced_at: new Date().toISOString(),
  status: true,
  truck_id: 10
});

// List devices
const devices = await gpsService.listDevices(1, 20, { status: true });

// Get single device
const device = await gpsService.getDevice(1);

// Update device
const updated = await gpsService.updateDevice(1, {
  device_name: 'Updated Name',
  status: false
});

// Deactivate device
await gpsService.deactivateDevice(1);
```

---

## Notes for Frontend Developers

1. **Organization Scoping**: All operations are automatically scoped to the user's organization based on the JWT token. You don't need to pass `organization_id` in requests.

2. **Global Uniqueness**: `external_device_id` and `imei_number` must be unique globally (across all organizations), not just within your organization.

3. **Truck Binding**: 
   - `truck_id` is **required** when creating a device
   - The truck must belong to your organization
   - Only one active GPS device can be assigned to a truck at a time

4. **Soft Delete**: GPS devices are never hard-deleted. Use the deactivate endpoint to disable them.

5. **Date Handling**: Always use ISO 8601 format for datetime fields. JavaScript's `toISOString()` method produces the correct format.

6. **Pagination**: The list endpoint supports pagination with `page` and `per_page` parameters. The response includes `total`, `pages`, `page`, and `per_page` for building pagination UI.

7. **Filtering**: All filter parameters in the list endpoint are optional. Only include parameters you want to filter by.

