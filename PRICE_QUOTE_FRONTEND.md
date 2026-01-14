# Price Quote Management API - Frontend Documentation

## Base URL
```
/api/v1/price-quote
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

The API automatically extracts the `organization_id` from the JWT token, so all operations are scoped to the user's organization.

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/price-quote/` | Create a new price quote |
| GET | `/api/v1/price-quote/` | List price quotes (paginated with filters) |
| GET | `/api/v1/price-quote/{id}` | Get a single price quote by ID |
| PUT | `/api/v1/price-quote/{id}` | Update price quote |
| DELETE | `/api/v1/price-quote/{id}` | Delete a price quote |

---

## 1. Create Price Quote

**Endpoint:** `POST /api/v1/price-quote/`

**Description:** Create a new price quote with route, cargo, and pricing information.

**Request Body:**
```json
{
  "origin": "string (required, LocationEnum)",
  "destination": "string (required, LocationEnum)",
  "gross_weight_min": "integer (required, > 0)",
  "gross_weight_max": "integer (required, >= gross_weight_min)",
  "truck_type": "string (required, TruckTypeEnum)",
  "container_size": "string (required, ContainerSizeEnum)",
  "amount": "float (required, > 0)",
  "axle_type": "string (optional, TruckAxleTypeEnum | null)",
  "currency": "string (optional, max 3 chars, default: 'ETB')"
}
```

**Field Details:**

### Required Fields

- `origin` (required): Origin location. Must be one of:
  - `"addis_ababa"`
  - `"adama"`
  - `"dukem"`
  - `"debre_zeit"`
  - `"hawassa"`
  - `"shashemene"`
  - `"djibouti_port"`
  
- `destination` (required): Destination location. Same values as `origin`. Must be different from `origin`.

- `gross_weight_min` (required): Minimum gross weight in kg. Must be a positive integer. Must be <= `gross_weight_max`.

- `gross_weight_max` (required): Maximum gross weight in kg. Must be a positive integer. Must be >= `gross_weight_min`.

- `truck_type` (required): Type of truck. Must be one of:
  - `"flatbed"`
  - `"trailer"`

- `container_size` (required): Container size. Must be one of:
  - `"twenty_feet"`
  - `"forty_feet"`

- `amount` (required): Quote amount. Must be a positive number (float). Example: `50000.00`

### Optional Fields

- `axle_type` (optional): Axle type. Can be one of:
  - `"single"`
  - `"double"`
  - `"triple"`
  - `null` (default if not provided)

- `currency` (optional): Currency code. Maximum 3 characters. Default: `"ETB"` if not provided. Examples: `"ETB"`, `"USD"`, `"EUR"`

**Success Response (201 Created):**
```json
{
  "id": 1,
  "organization_id": 5,
  "origin": "addis_ababa",
  "destination": "djibouti_port",
  "gross_weight_min": 1000,
  "gross_weight_max": 20000,
  "truck_type": "flatbed",
  "container_size": "twenty_feet",
  "axle_type": "double",
  "amount": 50000.00,
  "currency": "ETB",
  "status": "draft",
  "valid_from": null,
  "valid_to": null,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

- `400 Bad Request`: Missing required fields or invalid data
  ```json
  {
    "detail": "origin is required"
  }
  ```

- `422 Unprocessable Entity`: Validation errors
  ```json
  {
    "detail": [
      {
        "loc": ["body", "origin"],
        "msg": "value is not a valid enumeration member",
        "type": "type_error.enum"
      }
    ]
  }
  ```
  OR
  ```json
  {
    "detail": "Origin and destination must be different"
  }
  ```
  OR
  ```json
  {
    "detail": "Maximum weight must be greater than or equal to minimum weight"
  }
  ```

- `401 Unauthorized`: Missing or invalid JWT token
  ```json
  {
    "detail": "Not authenticated"
  }
  ```

**Example Request:**
```javascript
const response = await fetch('/api/v1/price-quote/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    origin: 'addis_ababa',
    destination: 'djibouti_port',
    gross_weight_min: 1000,
    gross_weight_max: 20000,
    truck_type: 'flatbed',
    container_size: 'twenty_feet',
    axle_type: 'double',
    amount: 50000.00,
    currency: 'ETB'
  })
});
```

**Minimal Request (with defaults):**
```javascript
// axle_type and currency are optional
const response = await fetch('/api/v1/price-quote/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    origin: 'addis_ababa',
    destination: 'djibouti_port',
    gross_weight_min: 1000,
    gross_weight_max: 20000,
    truck_type: 'flatbed',
    container_size: 'twenty_feet',
    amount: 50000.00
    // currency will default to "ETB"
    // axle_type will default to null
  })
});
```

---

## 2. List Price Quotes

**Endpoint:** `GET /api/v1/price-quote/`

**Description:** Get a paginated list of price quotes with optional filters.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1, min: 1) |
| `per_page` | integer | No | Items per page (default: 20, min: 1, max: 100) |
| `origin` | string | No | Filter by origin location |
| `destination` | string | No | Filter by destination location |
| `truck_type` | string | No | Filter by truck type (`flatbed` or `trailer`) |
| `container_size` | string | No | Filter by container size (`twenty_feet` or `forty_feet`) |
| `status` | string | No | Filter by status (`draft`, `active`, `expired`) |
| `currency` | string | No | Filter by currency code |

**Success Response (200 OK):**
```json
{
  "status": true,
  "message": "Price quotes fetched successfully",
  "items": [
    {
      "id": 1,
      "organization_id": 5,
      "origin": "addis_ababa",
      "destination": "djibouti_port",
      "gross_weight_min": 1000,
      "gross_weight_max": 20000,
      "truck_type": "flatbed",
      "container_size": "twenty_feet",
      "axle_type": "double",
      "amount": 50000.00,
      "currency": "ETB",
      "status": "draft",
      "valid_from": null,
      "valid_to": null,
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
const response = await fetch('/api/v1/price-quote/?page=1&per_page=20&status=draft', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 3. Get Single Price Quote

**Endpoint:** `GET /api/v1/price-quote/{id}`

**Description:** Get a single price quote by its ID.

**Path Parameters:**
- `id` (integer, required): Price quote ID

**Success Response (200 OK):**
```json
{
  "id": 1,
  "organization_id": 5,
  "origin": "addis_ababa",
  "destination": "djibouti_port",
  "gross_weight_min": 1000,
  "gross_weight_max": 20000,
  "truck_type": "flatbed",
  "container_size": "twenty_feet",
  "axle_type": "double",
  "amount": 50000.00,
  "currency": "ETB",
  "status": "draft",
  "valid_from": null,
  "valid_to": null,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

- `404 Not Found`: Price quote not found
  ```json
  {
    "detail": "Price quote not found"
  }
  ```

**Example Request:**
```javascript
const response = await fetch('/api/v1/price-quote/1', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 4. Update Price Quote

**Endpoint:** `PUT /api/v1/price-quote/{id}`

**Description:** Update a price quote. All fields are optional - only send fields you want to update.

**Path Parameters:**
- `id` (integer, required): Price quote ID

**Request Body (all fields optional):**
```json
{
  "origin": "string (optional, LocationEnum)",
  "destination": "string (optional, LocationEnum)",
  "gross_weight_min": "integer (optional, > 0)",
  "gross_weight_max": "integer (optional, >= gross_weight_min)",
  "truck_type": "string (optional, TruckTypeEnum)",
  "container_size": "string (optional, ContainerSizeEnum)",
  "amount": "float (optional, > 0)",
  "axle_type": "string (optional, TruckAxleTypeEnum | null)",
  "currency": "string (optional, max 3 chars)"
}
```

**Success Response (200 OK):**
```json
{
  "status": true,
  "success_message": "Price quote updated successfully",
  "result": {
    "id": 1,
    "organization_id": 5,
    "origin": "addis_ababa",
    "destination": "hawassa",
    "gross_weight_min": 1500,
    "gross_weight_max": 25000,
    "truck_type": "trailer",
    "container_size": "forty_feet",
    "axle_type": "triple",
    "amount": 75000.00,
    "currency": "USD",
    "status": "draft",
    "valid_from": null,
    "valid_to": null,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-16T10:30:00.000Z"
  }
}
```

**Error Responses:**

- `404 Not Found`: Price quote not found
  ```json
  {
    "detail": "Price quote not found."
  }
  ```

- `422 Unprocessable Entity`: Validation errors (same as create endpoint)

**Example Request:**
```javascript
const response = await fetch('/api/v1/price-quote/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    amount: 75000.00,
    currency: 'USD'
  })
});
```

---

## 5. Delete Price Quote

**Endpoint:** `DELETE /api/v1/price-quote/{id}`

**Description:** Delete a price quote (soft delete).

**Path Parameters:**
- `id` (integer, required): Price quote ID

**Request Body:** None

**Success Response (204 No Content):**
No response body.

**Error Responses:**

- `404 Not Found`: Price quote not found
  ```json
  {
    "detail": "Price quote not found."
  }
  ```

**Example Request:**
```javascript
const response = await fetch('/api/v1/price-quote/1', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Response Field Reference

### PriceQuoteResponse Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique price quote ID |
| `organization_id` | integer | Organization ID (automatically set from JWT) |
| `origin` | string | Origin location (LocationEnum) |
| `destination` | string | Destination location (LocationEnum) |
| `gross_weight_min` | integer | Minimum gross weight in kg |
| `gross_weight_max` | integer | Maximum gross weight in kg |
| `truck_type` | string | Truck type (`flatbed` or `trailer`) |
| `container_size` | string | Container size (`twenty_feet` or `forty_feet`) |
| `axle_type` | string \| null | Axle type (`single`, `double`, `triple`, or `null`) |
| `amount` | float | Quote amount |
| `currency` | string | Currency code (default: `ETB`) |
| `status` | string | Quote status (`draft`, `active`, `expired`) |
| `valid_from` | datetime \| null | Validity start date (ISO 8601 format) |
| `valid_to` | datetime \| null | Validity end date (ISO 8601 format) |
| `created_at` | datetime | Creation timestamp (ISO 8601 format) |
| `updated_at` | datetime | Last update timestamp (ISO 8601 format) |

---

## Validation Rules

### Business Rules

1. **Origin and Destination**: Must be different locations
2. **Weight Range**: `gross_weight_max` must be >= `gross_weight_min`
3. **Amount**: Must be greater than 0
4. **Enum Values**: All enum fields must use lowercase string values with underscores (e.g., `"addis_ababa"`, not `"ADDIS_ABABA"`)

### Enum Values Reference

**LocationEnum:**
- `"addis_ababa"`
- `"adama"`
- `"dukem"`
- `"debre_zeit"`
- `"hawassa"`
- `"shashemene"`
- `"djibouti_port"`

**TruckTypeEnum:**
- `"flatbed"`
- `"trailer"`

**ContainerSizeEnum:**
- `"twenty_feet"`
- `"forty_feet"`

**TruckAxleTypeEnum:**
- `"single"`
- `"double"`
- `"triple"`

### Default Values

- `currency`: Defaults to `"ETB"` if not provided
- `axle_type`: Defaults to `null` if not provided
- `status`: Defaults to `"draft"` (set by database model, not in request)

---

## Error Handling

All endpoints may return the following error responses:

### 400 Bad Request
- Missing required fields
- Invalid data format

### 401 Unauthorized
- Missing or invalid JWT token
```json
{
  "detail": "Not authenticated"
}
```

### 404 Not Found
- Price quote not found
- Resource doesn't belong to your organization

### 422 Unprocessable Entity
- Validation errors
- Invalid enum values
- Business rule violations (e.g., origin == destination)

### 500 Internal Server Error
- Unexpected server errors

---

## Frontend Implementation Tips

### 1. Enum Value Conversion

**Display Format → API Format:**
```javascript
// Convert user-friendly display names to API enum values
const locationMap = {
  'Addis Ababa': 'addis_ababa',
  'Adama': 'adama',
  'Dukem': 'dukem',
  'Debre Zeit': 'debre_zeit',
  'Hawassa': 'hawassa',
  'Shashemene': 'shashemene',
  'Djibouti Port': 'djibouti_port'
};

const truckTypeMap = {
  'Flatbed': 'flatbed',
  'Trailer': 'trailer'
};

const containerSizeMap = {
  '20 Feet': 'twenty_feet',
  '40 Feet': 'forty_feet'
};

const axleTypeMap = {
  'Single': 'single',
  'Double': 'double',
  'Triple': 'triple'
};
```

**API Format → Display Format:**
```javascript
// Convert API enum values to user-friendly display names
const displayLocationMap = {
  'addis_ababa': 'Addis Ababa',
  'adama': 'Adama',
  'dukem': 'Dukem',
  'debre_zeit': 'Debre Zeit',
  'hawassa': 'Hawassa',
  'shashemene': 'Shashemene',
  'djibouti_port': 'Djibouti Port'
};
```

### 2. Form Validation

```javascript
// Client-side validation before submission
function validatePriceQuote(data) {
  const errors = {};
  
  // Required fields
  if (!data.origin) errors.origin = 'Origin is required';
  if (!data.destination) errors.destination = 'Destination is required';
  if (!data.gross_weight_min) errors.gross_weight_min = 'Minimum weight is required';
  if (!data.gross_weight_max) errors.gross_weight_max = 'Maximum weight is required';
  if (!data.truck_type) errors.truck_type = 'Truck type is required';
  if (!data.container_size) errors.container_size = 'Container size is required';
  if (!data.amount || data.amount <= 0) errors.amount = 'Amount must be greater than 0';
  
  // Business rules
  if (data.origin === data.destination) {
    errors.destination = 'Destination must be different from origin';
  }
  
  if (data.gross_weight_max < data.gross_weight_min) {
    errors.gross_weight_max = 'Maximum weight must be >= minimum weight';
  }
  
  return errors;
}
```

### 3. Error Display

```javascript
try {
  const response = await fetch('/api/v1/price-quote/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    
    // Handle 422 validation errors
    if (response.status === 422) {
      if (Array.isArray(error.detail)) {
        // Field-specific errors
        error.detail.forEach(err => {
          console.error(`${err.loc.join('.')}: ${err.msg}`);
        });
      } else {
        // General validation error
        console.error('Validation error:', error.detail);
      }
    } else {
      // Other errors
      console.error('Error:', error.detail);
    }
    return;
  }
  
  const result = await response.json();
  // Handle success
} catch (error) {
  // Handle network errors
  console.error('Network error:', error);
}
```

### 4. Pagination

```javascript
// Fetch page 1 with 20 items per page
const url = new URL('/api/v1/price-quote/', baseURL);
url.searchParams.append('page', '1');
url.searchParams.append('per_page', '20');
url.searchParams.append('status', 'draft');

const response = await fetch(url, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 5. Filtering

```javascript
// Build filter query string
const filters = {
  origin: 'addis_ababa',
  destination: 'djibouti_port',
  status: 'draft',
  truck_type: 'flatbed'
};

const queryString = Object.entries(filters)
  .filter(([_, value]) => value !== null && value !== undefined && value !== '')
  .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
  .join('&');

const url = `/api/v1/price-quote/?${queryString}`;
```

---

## Complete Example: Price Quote Service Class

```javascript
class PriceQuoteService {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async createQuote(quoteData) {
    const response = await fetch(`${this.baseURL}/api/v1/price-quote/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(quoteData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create price quote');
    }
    
    return await response.json();
  }

  async listQuotes(page = 1, perPage = 20, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== null && v !== undefined && v !== '')
      )
    });
    
    const response = await fetch(
      `${this.baseURL}/api/v1/price-quote/?${params}`,
      {
        headers: { 'Authorization': `Bearer ${this.token}` }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch price quotes');
    }
    
    return await response.json();
  }

  async getQuote(id) {
    const response = await fetch(
      `${this.baseURL}/api/v1/price-quote/${id}`,
      {
        headers: { 'Authorization': `Bearer ${this.token}` }
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Price quote not found');
      }
      throw new Error('Failed to fetch price quote');
    }
    
    return await response.json();
  }

  async updateQuote(id, updateData) {
    const response = await fetch(
      `${this.baseURL}/api/v1/price-quote/${id}`,
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
      throw new Error(error.detail || 'Failed to update price quote');
    }
    
    return await response.json();
  }

  async deleteQuote(id) {
    const response = await fetch(
      `${this.baseURL}/api/v1/price-quote/${id}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${this.token}` }
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Price quote not found');
      }
      throw new Error('Failed to delete price quote');
    }
    
    // 204 No Content - no response body
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  }
}

// Usage
const quoteService = new PriceQuoteService('https://api.example.com', 'your-jwt-token');

// Create quote
const newQuote = await quoteService.createQuote({
  origin: 'addis_ababa',
  destination: 'djibouti_port',
  gross_weight_min: 1000,
  gross_weight_max: 20000,
  truck_type: 'flatbed',
  container_size: 'twenty_feet',
  axle_type: 'double',
  amount: 50000.00,
  currency: 'ETB'
});

// List quotes
const quotes = await quoteService.listQuotes(1, 20, { status: 'draft' });

// Get single quote
const quote = await quoteService.getQuote(1);

// Update quote
const updated = await quoteService.updateQuote(1, {
  amount: 75000.00,
  currency: 'USD'
});

// Delete quote
await quoteService.deleteQuote(1);
```

---

## Notes for Frontend Developers

1. **Organization Scoping**: All operations are automatically scoped to the user's organization based on the JWT token. You don't need to pass `organization_id` in requests.

2. **Enum Values**: All enum fields must use lowercase string values with underscores (e.g., `"addis_ababa"`, `"twenty_feet"`). Convert display names to enum values before sending to API.

3. **Default Values**: 
   - `currency` defaults to `"ETB"` if not provided
   - `axle_type` defaults to `null` if not provided
   - `status` defaults to `"draft"` (set by database, not in request)

4. **Validation**: The API validates:
   - Origin and destination must be different
   - Maximum weight must be >= minimum weight
   - Amount must be > 0
   - All enum values must be valid

5. **Error Handling**: 
   - 422 errors may return an array of field-specific errors or a single message
   - Always check `response.ok` before parsing JSON
   - Handle network errors separately

6. **Pagination**: The list endpoint supports pagination with `page` and `per_page` parameters. The response includes `total`, `pages`, `page`, and `per_page` for building pagination UI.

7. **Filtering**: All filter parameters in the list endpoint are optional. Only include parameters you want to filter by.

8. **Date Formats**: All datetime fields are returned in ISO 8601 format (`YYYY-MM-DDTHH:mm:ss.sssZ`).
