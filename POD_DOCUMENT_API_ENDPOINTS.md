# Ship Item Document API Endpoint Documentation

## Overview
This document describes the API endpoints for managing proof of delivery (POD) and container return receipt documents for ship items. The endpoints allow transporters to upload, retrieve, and manage documents associated with specific ship items.

## Base URL
```
/api/ship-items/{ship_item_id}/documents/
```

## Authentication
- Upload endpoints require transporter authentication with `transporter_only` access
- View/management endpoints require shipper authentication with `shipper_only` access

## Document Types (ShipItemDocumentTypeEnum)
- `proof_of_delivery` - Proof of Delivery document
- `container_return_receipt` - Container Return Receipt document

## Supported File Extensions
- PDF: `.pdf`
- Images: `.jpg`, `.jpeg`, `.png`, `.tiff`

## Endpoints

### 1. Upload Document
**POST** `/api/ship-items/{ship_item_id}/documents/`

Uploads a document (POD or container return receipt) for a specific ship item.

#### Request Body (multipart/form-data)
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `document_type` | ShipItemDocumentTypeEnum | Yes | Type of document being uploaded |
| `file` | UploadFile | Yes | The document file to upload |
| `container_id` | integer | No* | Container ID (required for container_return_receipt) |

#### Document Type Rules
- **proof_of_delivery**: Can be uploaded for ship item level (no container_id needed)
- **container_return_receipt**: Requires container_id and container must be marked as returning

#### Shipment Status Requirements
Ship must be in one of these statuses to allow document upload:
- `ready_for_pickup`
- `in_transit`
- `delivered`
- `completed`

#### Response (201 Created)
```json
{
  "id": 1,
  "ship_id": 123,
  "ship_item_id": 456,
  "container_id": 789,
  "document_type": "proof_of_delivery",
  "file_path": "s3://bucket/path/to/document.pdf",
  "file_ext": "pdf",
  "presigned_url": "https://s3.amazonaws.com/...",
  "created_at": "2024-01-21T10:30:00Z",
  "updated_at": "2024-01-21T10:30:00Z"
}
```

#### Error Responses
- **400 Bad Request**: Invalid shipment status, container not returning, or container doesn't belong to ship item
- **404 Not Found**: Ship item or container not found
- **422 Unprocessable Entity**: Invalid file type or validation error

---

### 2. List Documents
**GET** `/api/ship-items/{ship_item_id}/documents/`

Retrieves a list of documents for a specific ship item.

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `container_id` | integer | No | null | Filter by container ID |

#### Response (200 OK)
```json
[
  {
    "id": 1,
    "ship_id": 123,
    "ship_item_id": 456,
    "container_id": 789,
    "document_type": "proof_of_delivery",
    "file_path": "s3://bucket/path/to/document.pdf",
    "file_ext": "pdf",
    "presigned_url": "https://s3.amazonaws.com/...",
    "created_at": "2024-01-21T10:30:00Z",
    "updated_at": "2024-01-21T10:30:00Z"
  }
]
```

---

### 3. Get Document
**GET** `/api/ship-items/{ship_item_id}/documents/{document_id}`

Retrieves a specific document for a ship item.

#### Response (200 OK)
```json
{
  "id": 1,
  "ship_id": 123,
  "ship_item_id": 456,
  "container_id": 789,
  "document_type": "proof_of_delivery",
  "file_path": "s3://bucket/path/to/document.pdf",
  "file_ext": "pdf",
  "presigned_url": "https://s3.amazonaws.com/...",
  "created_at": "2024-01-21T10:30:00Z",
  "updated_at": "2024-01-21T10:30:00Z"
}
```

#### Error Responses
- **404 Not Found**: Document not found for this ship item

---

### 4. Update Document
**PATCH** `/api/ship-items/{ship_item_id}/documents/{document_id}`

Updates an existing document for a ship item.

#### Request Body (multipart/form-data)
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `document_type` | ShipItemDocumentTypeEnum | No | New document type |
| `file` | UploadFile | No | New document file |

#### Response (200 OK)
```json
{
  "id": 1,
  "ship_id": 123,
  "ship_item_id": 456,
  "container_id": 789,
  "document_type": "proof_of_delivery",
  "file_path": "s3://bucket/path/to/document.pdf",
  "file_ext": "pdf",
  "presigned_url": "https://s3.amazonaws.com/...",
  "created_at": "2024-01-21T10:30:00Z",
  "updated_at": "2024-01-21T11:00:00Z"
}
```

---

### 5. Delete Document
**DELETE** `/api/ship-items/{ship_item_id}/documents/{document_id}`

Soft deletes a document for a ship item.

#### Response (204 No Content)
No content returned on successful deletion.

#### Error Responses
- **404 Not Found**: Document not found for this ship item

## File Upload Considerations
- Files are stored on AWS S3
- Maximum file size: 10MB (recommended)
- Files receive presigned URLs for secure access
- File validation occurs before upload
- Container return receipts require container to be marked as returning

## Integration Notes
- The ship_item_id must correspond to a ship item assigned to the authenticated transporter
- All operations are tenant-aware and respect organization boundaries
- Document creation triggers file validation and S3 upload
- Presigned URLs are generated for secure file access
- Ship items must have appropriate shipment status for document upload
