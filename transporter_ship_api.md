# Transporter Ship Management API Documentation

## Overview
This document provides API endpoints and data structures for implementing the Transporter Ship Management web interface. The system allows transporter users to view ships assigned to them and manage truck/driver assignments for specific ship items.

## Authentication
All endpoints require JWT authentication with `transporter` role. Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Base URL
```
/api/v1
```

---

## 1. Get Assigned Ships for Transporter

**Endpoint**: `GET /ship/transporter/`

**Description**: Returns a paginated list of ships assigned to the current transporter user.

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1, min: 1)
- `per_page` (integer, optional): Items per page (default: 10, min: 1, max: 100)

**Response**:
```json
{
  "status": true,
  "message": "Ships fetched successfully",
  "items": [
    {
      "id": 1,
      "shipper_id": 1,
      "origin": "ADDIS_ABABA",
      "destination": "DJIBOUTI",
      "status": "ASSIGNED",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "shipper_name": "Default Shipper Org",
      "total_containers": 5,
      "assigned_containers": 3
    }
  ],
  "total": 25,
  "page": 1,
  "pages": 3,
  "per_page": 20
}
```

**Ship Object Fields**:
- `id` (integer): Unique ship identifier
- `shipper_id` (integer): ID of the shipper organization
- `origin` (string): Origin location code
- `destination` (string): Destination location code
- `status` (string): Current ship status
- `created_at` (string): ISO 8601 timestamp
- `updated_at` (string): ISO 8601 timestamp
- `shipper_name` (string): Name of the shipper organization
- `total_containers` (integer): Total number of containers in the ship
- `assigned_containers` (integer): Number of containers assigned to this transporter

---

## 2. Get Ship Details for Transporter

**Endpoint**: `GET /ship/transporter/{ship_id}`

**Description**: Returns detailed information about a specific ship assigned to the current transporter, including ship items assigned to them.

**Path Parameters**:
- `ship_id` (integer, required): Ship ID

**Response**:
```json
{
  "id": 1,
  "shipper_id": 1,
  "origin": "ADDIS_ABABA",
  "destination": "DJIBOUTI",
  "status": "ASSIGNED",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "shipper_name": "Default Shipper Org",
  "shipper_email": "shipper@wetruck.ai",
  "shipper_phone": "+251911000000",
  "estimated_departure": "2024-01-20T08:00:00Z",
  "estimated_arrival": "2024-01-25T16:00:00Z",
  "total_containers": 5,
  "assigned_containers": 3,
  "containers": [
    {
      "id": 1,
      "container_number": "CONT123456",
      "container_type": "20FT",
      "status": "ASSIGNED",
      "weight": 15000.5,
      "volume": 33.0,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "ship_items": [
    {
      "id": 1,
      "ship_id": 1,
      "transporter_id": 2,
      "container_id": 1,
      "status": "PENDING",
      "price": 1500.00,
      "currency": "USD",
      "assigned_driver_id": null,
      "assigned_truck_id": null,
      "pickup_scheduled_time": null,
      "delivery_scheduled_time": null,
      "actual_pickup_time": null,
      "actual_delivery_time": null,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "container": {
        "id": 1,
        "container_number": "CONT123456",
        "container_type": "20FT",
        "status": "ASSIGNED",
        "weight": 15000.5,
        "volume": 33.0
      },
      "assigned_driver": null,
      "assigned_truck": null
    }
  ],
  "documents": [
    {
      "id": 1,
      "document_type": "BILL_OF_LADING",
      "file_path": "https://s3.amazonaws.com/bucket/documents/BL123.pdf",
      "file_name": "BL123.pdf",
      "file_ext": "pdf",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Ship Item Object Fields**:
- `id` (integer): Unique ship item identifier
- `ship_id` (integer): Parent ship ID
- `transporter_id` (integer): ID of the assigned transporter
- `container_id` (integer): ID of the assigned container
- `status` (string): Ship item status (PENDING, ASSIGNED, IN_PROGRESS, COMPLETED)
- `price` (number): Agreed price for this ship item
- `currency` (string): Currency code (USD, ETB, etc.)
- `assigned_driver_id` (integer|null): ID of assigned driver (null if not assigned)
- `assigned_truck_id` (integer|null): ID of assigned truck (null if not assigned)
- `pickup_scheduled_time` (string|null): Scheduled pickup time
- `delivery_scheduled_time` (string|null): Scheduled delivery time
- `actual_pickup_time` (string|null): Actual pickup time
- `actual_delivery_time` (string|null): Actual delivery time
- `container` (object): Container details
- `assigned_driver` (object|null): Driver details if assigned
- `assigned_truck` (object|null): Truck details if assigned

---

## 3. Get Available Drivers for Transporter

**Endpoint**: `GET /driver/`

**Description**: Returns a paginated list of drivers available to the current transporter organization.

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1, min: 1)
- `per_page` (integer, optional): Items per page (default: 20, min: 1, max: 100)
- `first_name` (string, optional): Filter by first name
- `last_name` (string, optional): Filter by last name
- `phone_number` (string, optional): Filter by phone number
- `email` (string, optional): Filter by email
- `driver_license_number` (string, optional): Filter by license number
- `status` (string, optional): Filter by status (ACTIVE, INACTIVE, etc.)

**Response**:
```json
{
  "status": true,
  "message": "Drivers fetched successfully",
  "items": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "+251911000001",
      "email": "john.doe@transporter.com",
      "driver_license_number": "DL123456",
      "license_expiry_date": "2024-12-31",
      "status": "ACTIVE",
      "created_at": "2024-01-10T08:00:00Z",
      "updated_at": "2024-01-10T08:00:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "pages": 1,
  "per_page": 20
}
```

---

## 4. Get Available Trucks for Transporter

**Endpoint**: `GET /truck/`

**Description**: Returns a paginated list of trucks available to the current transporter organization.

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1, min: 1)
- `per_page` (integer, optional): Items per page (default: 20, min: 1, max: 100)
- `status` (TruckStatusEnum, optional): Filter by status
- `truck_type` (TruckTypeEnum, optional): Filter by truck type
- `vin` (string, optional): Filter by VIN
- `plate_number` (string, optional): Filter by plate number
- `make` (string, optional): Filter by make
- `model` (string, optional): Filter by model
- `year` (integer, optional): Filter by year
- `registration_date` (date, optional): Filter by registration date
- `gov_id` (string, optional): Filter by government ID
- `gps_device_id` (integer, optional): Filter by GPS device ID

**Response**:
```json
{
  "status": true,
  "message": "Trucks fetched successfully",
  "items": [
    {
      "id": 1,
      "vin": "1HGCM82633A123456",
      "plate_number": "ABC123",
      "make": "Toyota",
      "model": "Hilux",
      "year": 2022,
      "truck_type": "FLATBED",
      "status": "AVAILABLE",
      "registration_date": "2022-01-15",
      "gov_id": "GOV789",
      "gps_device_id": 123,
      "created_at": "2024-01-10T08:00:00Z",
      "updated_at": "2024-01-10T08:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "pages": 1,
  "per_page": 20
}
```

---

## 5. Assign Driver and Truck to Ship Item

**Endpoint**: `PATCH /ship-item/{ship_item_id}/assign`

**Description**: Assigns a driver and/or truck to a specific ship item.

**Path Parameters**:
- `ship_item_id` (integer, required): Ship item ID

**Request Body**:
```json
{
  "driver_id": 1,
  "truck_id": 2
}
```

**Request Fields**:
- `driver_id` (integer, optional): ID of the driver to assign
- `truck_id` (integer, optional): ID of the truck to assign
- At least one of `driver_id` or `truck_id` must be provided

**Response**:
```json
{
  "status": true,
  "message": "Driver and truck assigned successfully",
  "result": {
    "id": 1,
    "ship_id": 1,
    "transporter_id": 2,
    "container_id": 1,
    "status": "ASSIGNED",
    "price": 1500.00,
    "currency": "USD",
    "assigned_driver_id": 1,
    "assigned_truck_id": 2,
    "pickup_scheduled_time": null,
    "delivery_scheduled_time": null,
    "actual_pickup_time": null,
    "actual_delivery_time": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:00:00Z",
    "assigned_driver": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "+251911000001",
      "email": "john.doe@transporter.com",
      "driver_license_number": "DL123456",
      "license_expiry_date": "2024-12-31",
      "status": "ACTIVE"
    },
    "assigned_truck": {
      "id": 2,
      "vin": "1HGCM82633A123457",
      "plate_number": "XYZ789",
      "make": "Isuzu",
      "model": "NPR",
      "year": 2023,
      "truck_type": "FLATBED",
      "status": "ASSIGNED",
      "registration_date": "2023-01-15",
      "gov_id": "GOV790"
    }
  }
}
```

---

## 6. Get Ship Documents

**Endpoint**: `GET /ship/{ship_id}/documents`

**Description**: Returns a paginated list of documents associated with a specific ship.

**Path Parameters**:
- `ship_id` (integer, required): Ship ID

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1, min: 1)
- `per_page` (integer, optional): Items per page (default: 20, min: 1, max: 100)

**Response**:
```json
{
  "status": true,
  "message": "Documents fetched successfully",
  "items": [
    {
      "id": 1,
      "document_type": "BILL_OF_LADING",
      "file_path": "https://s3.amazonaws.com/bucket/documents/BL123.pdf",
      "file_name": "BL123.pdf",
      "file_ext": "pdf",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "document_type": "COMMERCIAL_INVOICE",
      "file_path": "https://s3.amazonaws.com/bucket/documents/INV456.pdf",
      "file_name": "INV456.pdf",
      "file_ext": "pdf",
      "created_at": "2024-01-15T10:35:00Z",
      "updated_at": "2024-01-15T10:35:00Z"
    }
  ],
  "total": 2,
  "page": 1,
  "pages": 1,
  "per_page": 20
}
```

---

## 7. Download Ship Document

**Endpoint**: `GET /ship/{ship_id}/documents/{document_id}/download`

**Description**: Downloads a specific ship document file.

**Path Parameters**:
- `ship_id` (integer, required): Ship ID
- `document_id` (integer, required): Document ID

**Response**: Binary file stream with appropriate Content-Type headers

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "detail": "Authentication failed. The access token is invalid or has expired."
}
```

### 403 Forbidden
```json
{
  "detail": "Authorization failed. You do not have permission to access this resource."
}
```

### 404 Not Found
```json
{
  "detail": "Ship not found or does not belong to your organization"
}
```

### 400 Bad Request
```json
{
  "detail": "Invalid request data",
  "code": "VALIDATION_ERROR"
}
```

---

## Data Types and Enums

### Ship Status
- `PENDING`: Ship created but not yet assigned
- `ASSIGNED`: Ship assigned to transporter(s)
- `IN_PROGRESS`: Ship is being processed
- `COMPLETED`: Ship completed
- `CANCELLED`: Ship cancelled

### Ship Item Status
- `PENDING`: Waiting for driver/truck assignment
- `ASSIGNED`: Driver and truck assigned
- `IN_PROGRESS`: Pickup/delivery in progress
- `COMPLETED`: Delivery completed
- `CANCELLED`: Assignment cancelled

### Truck Status
- `AVAILABLE`: Truck available for assignment
- `ASSIGNED`: Truck assigned to a ship item
- `MAINTENANCE`: Truck under maintenance
- `OUT_OF_SERVICE`: Truck not available

### Truck Type
- `FLATBED`: Flatbed truck
- `CONTAINER`: Container carrier
- `VAN`: Enclosed van
- `REFRIGERATED`: Refrigerated truck

### Driver Status
- `ACTIVE`: Driver available for assignments
- `INACTIVE`: Driver not available
- `ON_DUTY`: Driver currently on assignment

### Document Types
- `BILL_OF_LADING`: Bill of lading document
- `COMMERCIAL_INVOICE`: Commercial invoice
- `PACKING_LIST`: Packing list
- `CERTIFICATE_OF_ORIGIN`: Certificate of origin
- `OTHER`: Other document types

---

## Implementation Notes

### Frontend Flow
1. **Load Ships**: Call `GET /ship/transporter/` to get list of assigned ships
2. **Ship Detail**: When user clicks a ship, call `GET /ship/transporter/{ship_id}` for detailed view
3. **Load Resources**: Call `GET /driver/` and `GET /truck/` to get available resources
4. **Assign Resources**: Call `PATCH /ship-item/{ship_item_id}/assign` to assign driver/truck
5. **View Documents**: Call `GET /ship/{ship_id}/documents` to show ship documents

### Access Control
- All endpoints are protected by `transporter_only` middleware
- Data is automatically filtered to show only items assigned to the current transporter's organization
- Users cannot see ship items assigned to other transporters

### UI States
- **Loading**: Show loading spinner during API calls
- **Empty State**: Show message when no ships are assigned
- **Error State**: Show appropriate error messages for API failures
- **Success State**: Show success notifications for assignments

### Pagination
- Use the `total`, `page`, `pages`, and `per_page` fields to implement pagination controls
- Default page size is 20, maximum is 100

### File Handling
- Document files are stored in S3 and accessed via secure URLs
- Use the `file_path` field to display document download links
- Support PDF, DOC, DOCX, XLS, XLSX, and image formats

---

## Example Implementation Sequence

```javascript
// 1. Get assigned ships
const ships = await fetch('/ship/transporter/?page=1&per_page=20');

// 2. Get ship details when clicked
const shipDetail = await fetch(`/ship/transporter/${shipId}`);

// 3. Get available drivers and trucks
const [drivers, trucks] = await Promise.all([
  fetch('/driver/'),
  fetch('/truck/')
]);

// 4. Assign driver and truck to ship item
const assignment = await fetch(`/ship-item/${shipItemId}/assign`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ driver_id: 1, truck_id: 2 })
});

// 5. Get ship documents
const documents = await fetch(`/ship/${shipId}/documents`);
```

---

## Testing Considerations

### Test Cases
1. **Unauthorized Access**: Verify non-transporter users get 403 errors
2. **Data Isolation**: Confirm transporters only see their assigned items
3. **Assignment Flow**: Test complete driver/truck assignment workflow
4. **Pagination**: Verify pagination works correctly
5. **Error Handling**: Test error states and user feedback
6. **Document Access**: Verify document download functionality

### Mock Data
Use the sample responses provided in this document for frontend development and testing.
