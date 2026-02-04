# POD/Returning Documents UI Implementation Guide

## Overview
This document provides UI recommendations for implementing the Proof of Delivery (POD) and Container Return Receipt documents feature for transporters. The interface allows transporters to upload delivery documents for ship items that have truck and driver assignments.

## Navigation Structure

### Sidebar Menu Item
- **Label**: "POD/Returning Documents"
- **Icon**: Document upload icon (📄 or 📤)
- **Route**: `/transporter/pod-documents`
- **Access**: Transporter role only

## Main Interface Layout

### 1. Ship Items List View
**Purpose**: Display ship items eligible for document upload

#### Filtering Criteria
- Only show ship items assigned to the current transporter
- Only show ship items with both truck AND driver assigned
- Only show ship items where ship status allows document upload:
  - `ready_for_pickup`
  - `in_transit`
  - `delivered`
  - `completed`

#### Ship Item Card Information
```
┌─────────────────────────────────────────────────────────────┐
│ Ship Item #456 - Shipment #12345               Status: In Transit │
│ ─────────────────────────────────────────────────────────── │
│ 📍 Origin: Addis Ababa → Destination: Djibouti              │
│ 🚚 Truck: ABC-123 (Volvo FH16)                               │
│ 👤 Driver: John Doe (ID: DRV-001)                           │
│ 📦 Containers: 2 containers (CNTR-001, CNTR-002)             │
│ 📅 Delivery Date: 2024-01-25                                 │
│ ─────────────────────────────────────────────────────────── │
│ 📄 Documents: 1 POD uploaded, 0 Return Receipts              │
│ [📤 Upload Documents]  [📋 View Details]                    │
└─────────────────────────────────────────────────────────────┘
```

#### Container Information Display
For each ship item, show container details:
- Container ID/Number
- Container size (20ft/40ft)
- Container status
- Return location info (if applicable)
- Document upload status per document type per container

### 2. Document Upload Modal/View

#### Upload Options
Transporters can upload documents at two levels:

**Option A: Ship Item Level**
- Single document covers entire ship item
- Applies to all containers in the ship item
- No container_id required
- Good for consolidated documentation

**Option B: Container Level**
- Individual documents per container
- Must specify container_id
- More granular control and flexibility
- Required when containers have different delivery scenarios

#### Document Type & Level Combinations
Both document types support both upload levels:

**Proof of Delivery (POD)**
- Ship Item Level: One POD document for entire ship item
- Container Level: Individual POD per container

**Container Return Receipt**
- Ship Item Level: One return receipt for all containers (if all returning to same location)
- Container Level: Individual return receipt per container (recommended for different return locations)

#### Document Upload Form
```
┌─────────────────────────────────────────────────────────────┐
│ Upload Documents - Ship Item #456                           │
│ ─────────────────────────────────────────────────────────── │
│ 📋 Document Type:                                          │
│ [Dropdown: Proof of Delivery, Container Return Receipt]     │
│                                                             │
│ 📦 Upload Level:                                           │
│ ○ Ship Item Level (one document for all containers)         │
│ ● Container Level (individual documents)                    │
│                                                             │
│ 📦 Container (only for Container Level):                   │
│ [Dropdown: CNTR-001, CNTR-002] or [Multi-select for bulk]   │
│                                                             │
│ 📎 File Upload:                                            │
│ [Drag & Drop Area] or [Browse Files]                       │
│ Supported: PDF, JPG, PNG, TIFF (Max 10MB)                  │
│                                                             │
│ 📝 Notes (Optional):                                        │
│ [Textarea for additional information]                      │
│                                                             │
│ [Cancel] [Upload Document]                                  │
└─────────────────────────────────────────────────────────────┘
```

#### Upload Logic Rules
- **Ship Item Level**: Single upload, no container selection needed
- **Container Level**: Can upload for single container or multiple containers
- **Return Receipt Validation**: 
  - Ship Item Level: Only if all containers marked as returning
  - Container Level: Only for containers marked as returning
- **POD Flexibility**: Can be uploaded at either level based on user preference

### 3. Document Management View

#### Existing Documents Display
For each ship item, show uploaded documents organized by level:

```
┌─────────────────────────────────────────────────────────────┐
│ Uploaded Documents - Ship Item #456                         │
│ ─────────────────────────────────────────────────────────── │
│ 📄 Ship Item Level Documents                               │
│    📋 Proof of Delivery (All Containers)                   │
│       Status: ✅ Uploaded | Uploaded: 2024-01-21           │
│       [👁️ View] [📥 Download] [🗑️ Delete]                 │
│                                                             │
│ 📄 Container Level Documents                               │
│    📦 CNTR-001:                                           │
│       📋 Proof of Delivery | Status: ✅ Uploaded           │
│       📋 Return Receipt | Status: ⏳ Required              │
│       [� Upload Return Receipt]                           │
│                                                             │
│    📦 CNTR-002:                                           │
│       📋 Proof of Delivery | Status: ✅ Uploaded           │
│       📋 Return Receipt | Status: ✅ Uploaded              │
│       [👁️ View] [📥 Download] [🗑️ Delete]                 │
└─────────────────────────────────────────────────────────────┘
```

## User Experience Flow

### 1. Initial Load
- Fetch transporter's assigned ship items
- Filter for ship items with truck + driver assignments
- Check ship status eligibility for document upload
- Display ship items in a clean, scannable list

### 2. Document Upload Flow
1. User clicks "Upload Documents" on a ship item
2. Modal opens with document type selection
3. User selects document type (POD or Return Receipt)
4. User chooses upload level:
   - Ship Item Level: Direct file upload
   - Container Level: Show container selection (single or multi-select)
5. User selects container(s) (if container level)
6. User drags & drops or browses for file
7. File validation occurs client-side
8. Upload progress indicator shows
9. Success/error message displays
10. Document list updates automatically

### 3. Document Management Flow
1. User views existing documents for a ship item
2. Documents organized by level (Ship Item vs Container)
3. Can preview documents in modal viewer
4. Can download documents via presigned URLs
5. Can delete uploaded documents
6. Can re-upload documents at preferred level
7. Can upload additional documents as needed

## Technical Implementation Considerations

### Frontend State Management
```javascript
// State structure example
{
  shipItems: [
    {
      id: 456,
      shipId: 123,
      status: "IN_TRANSIT",
      truck: { id: 1, plateNumber: "ABC-123", model: "Volvo FH16" },
      driver: { id: 1, name: "John Doe", licenseNumber: "DRV-001" },
      containers: [
        { 
          id: 1, 
          number: "CNTR-001", 
          size: "20ft", 
          status: "DELIVERED",
          returnLocationInfo: { /* exists if returning */ }
        },
        { 
          id: 2, 
          number: "CNTR-002", 
          size: "20ft", 
          status: "DELIVERED",
          returnLocationInfo: null
        }
      ],
      documents: [
        { 
          id: 1, 
          documentType: "proof_of_delivery", 
          containerId: null,
          fileUrl: "..." 
        },
        { 
          id: 2, 
          documentType: "container_return_receipt", 
          containerId: 1,
          fileUrl: "..." 
        }
      ]
    }
  ],
  loading: false,
  error: null
}
```

### API Integration Points
1. **GET** `/transporter/` - Get assigned shipments
2. **GET** `/ship-items/{ship_item_id}/documents/` - Get existing documents
3. **POST** `/ship-items/{ship_item_id}/documents/` - Upload new document
4. **GET** `/ship-items/{ship_item_id}/documents/{document_id}` - Get document details
5. **PATCH** `/ship-items/{ship_item_id}/documents/{document_id}` - Update document
6. **DELETE** `/ship-items/{ship_item_id}/documents/{document_id}` - Delete document

### File Upload Handling
- Client-side file validation (type, size)
- Progress indicators for large files
- Error handling for upload failures
- Automatic retry mechanism for network issues
- Container selection validation for return receipts

## Responsive Design

### Mobile View
- Stack ship item cards vertically
- Simplified upload modal
- Touch-friendly file upload area
- Swipe actions for document management

### Tablet View
- Two-column layout for ship item list
- Side panel for document details
- Optimized touch targets

### Desktop View
- Full-featured interface
- Keyboard shortcuts
- Bulk upload capabilities
- Advanced filtering and sorting

## Error Handling & Validation

### Client-Side Validation
- File type validation before upload
- File size limits (10MB max)
- Required field validation
- Container selection validation for return receipts
- Ship status validation

### Error Messages
- Clear, actionable error messages
- Network error handling
- File upload failure recovery
- Permission error handling
- Container return validation errors

## Accessibility Features
- Screen reader support
- Keyboard navigation
- High contrast mode support
- Focus indicators
- ARIA labels for file upload areas

## Performance Optimizations
- Lazy loading for document lists
- Image thumbnails for document previews
- Caching of ship item data
- Optimized API calls
- Background upload processing

## Security Considerations
- Secure file upload with CSRF protection
- File type validation on both client and server
- Presigned URL usage for document access
- User permission validation
- Audit logging for document actions

## Special Considerations

### Upload Flexibility
- **User Choice**: Transporters can choose preferred upload level for both document types
- **Mixed Approach**: Can have both ship item level and container level documents for same ship item
- **Bulk Operations**: Container level supports multi-select for efficient bulk uploads
- **Progressive Upload**: Can start with ship item level, then add container level details later

### Container Return Receipts
- **Ship Item Level**: Only allowed if ALL containers in ship item are marked as returning
- **Container Level**: Only shows containers marked as returning in selection dropdown
- **Validation**: Check container has `return_location_info` field before allowing upload
- **Status Filter**: Only containers with status `in_transit`, `delivered`, or `completed` are eligible

### Proof of Delivery
- **Maximum Flexibility**: Can be uploaded at ship item level OR container level
- **Business Logic**: 
  - Ship Item Level: Good for consolidated deliveries with single recipient
  - Container Level: Better for multiple recipients or different delivery scenarios
- **No Restrictions**: POD doesn't require container to be marked as returning

### Status-Based Access
- Document upload only allowed for specific ship statuses
- Real-time status checking before allowing uploads
- Clear messaging when upload is not allowed due to status
- Dynamic UI updates based on container return status
