# GPS Frontend Implementation Guide for Cursor AI

## How to Use These Documentation Files with Cursor

This guide explains how to provide the GPS documentation files to Cursor AI for frontend implementation.

---

## 📁 Documentation Files

You have two main documentation files:

1. **`gps_frontend.md`** - API documentation with endpoints, request/response formats, and examples
2. **`gps_ui_recommendations.md`** - UI/UX design recommendations with shadcn/ui component specifications

---

## 🎯 Method 1: Direct File References (Recommended)

### When Starting Implementation

**Initial Prompt:**
```
I need to implement GPS Device Management frontend. Please read these documentation files:

@gps_frontend.md - API endpoints and data structures
@gps_ui_recommendations.md - UI/UX design and shadcn/ui component specifications

Based on these files, help me implement:
1. GPS Devices List Page with table and filters
2. Create GPS Device Form
3. GPS Device Detail Page
4. Edit GPS Device Form
5. Deactivate confirmation modal

Use shadcn/ui components as specified in the UI recommendations.
```

### For Specific Features

**Example: Creating the List Page**
```
Based on @gps_ui_recommendations.md section 1 and @gps_frontend.md section 2, 
create the GPS Devices List Page component using:
- shadcn/ui Table component
- shadcn/ui Card for container
- shadcn/ui Input for filters
- shadcn/ui Select for status filter
- shadcn/ui Pagination component
- shadcn/ui Badge for status indicators
- shadcn/ui DropdownMenu for row actions

The API endpoint is GET /api/v1/gps-devices/ with pagination and filters.
```

**Example: Creating the Form**
```
Based on @gps_ui_recommendations.md section 2 and @gps_frontend.md section 1,
create the Create GPS Device Form component using:
- shadcn/ui Form with react-hook-form
- shadcn/ui Input for text fields
- shadcn/ui Select for truck selection
- shadcn/ui Calendar + Popover for date pickers
- shadcn/ui Button for actions

The API endpoint is POST /api/v1/gps-devices/ with the request body structure from the API docs.
```

---

## 🎯 Method 2: Attach Files in Chat

### Step-by-Step:

1. **Open Cursor Chat** (Cmd/Ctrl + L)
2. **Click the attachment/paperclip icon** (if available)
3. **Select both files:**
   - `gps_frontend.md`
   - `gps_ui_recommendations.md`
4. **Type your prompt:**
   ```
   I've attached the GPS documentation files. Please help me implement 
   the GPS Device Management frontend following the specifications.
   ```

---

## 🎯 Method 3: Reference Specific Sections

### For Quick Reference

**When asking about specific features, reference the section:**

```
@gps_frontend.md (lines 29-131) - Create GPS Device endpoint
@gps_ui_recommendations.md (lines 303-444) - Create Form UI specifications

Create the Create GPS Device form component following these specs.
```

---

## 🎯 Method 4: Create Implementation Tasks

### Break Down Implementation

**Prompt:**
```
Based on @gps_frontend.md and @gps_ui_recommendations.md, create a task list 
for implementing GPS Device Management:

1. Set up shadcn/ui components (list all required components)
2. Create API service layer (using endpoints from gps_frontend.md)
3. Implement List Page (UI from gps_ui_recommendations.md section 1)
4. Implement Create Form (UI from gps_ui_recommendations.md section 2)
5. Implement Detail Page (UI from gps_ui_recommendations.md section 3)
6. Implement Edit Form (UI from gps_ui_recommendations.md section 4)
7. Implement Deactivate Modal (UI from gps_ui_recommendations.md section 5)
```

---

## 📋 Recommended Implementation Workflow

### Phase 1: Setup

**Prompt:**
```
@gps_ui_recommendations.md (lines 873-933)

1. Install all required shadcn/ui components listed in section 13
2. Set up the API service class structure based on @gps_frontend.md (lines 535-670)
3. Create TypeScript types/interfaces for GPS Device based on the API response structure
```

### Phase 2: List Page

**Prompt:**
```
@gps_ui_recommendations.md (section 1, lines 88-300)
@gps_frontend.md (section 2, lines 135-187)

Create the GPS Devices List Page component with:
- Table using shadcn/ui Table components
- Filters using shadcn/ui Input and Select
- Pagination using shadcn/ui Pagination
- API integration using GET /api/v1/gps-devices/
- Error handling and loading states
```

### Phase 3: Create Form

**Prompt:**
```
@gps_ui_recommendations.md (section 2, lines 303-444)
@gps_frontend.md (section 1, lines 29-131)

Create the Create GPS Device Form with:
- shadcn/ui Form with react-hook-form
- All required fields (external_device_id, imei_number, truck_id, etc.)
- Date pickers using Calendar + Popover
- Validation based on API requirements
- API integration using POST /api/v1/gps-devices/
- Success/error toast notifications
```

### Phase 4: Detail & Edit Pages

**Prompt:**
```
@gps_ui_recommendations.md (sections 3 & 4)
@gps_frontend.md (sections 3 & 4)

Create:
1. GPS Device Detail Page (GET /api/v1/gps-devices/{id})
2. Edit GPS Device Form (PUT /api/v1/gps-devices/{id})
```

### Phase 5: Deactivate Feature

**Prompt:**
```
@gps_ui_recommendations.md (section 5, lines 562-593)
@gps_frontend.md (section 5, lines 332-383)

Create the deactivate confirmation modal using shadcn/ui Dialog and 
integrate with PATCH /api/v1/gps-devices/{id}/deactivate
```

---

## 🔧 Quick Reference Commands

### For API Integration
```
@gps_frontend.md - Show me the API endpoint structure for [specific endpoint]
```

### For UI Components
```
@gps_ui_recommendations.md - What shadcn/ui components should I use for [specific feature]?
```

### For Complete Feature
```
@gps_frontend.md @gps_ui_recommendations.md - Implement [feature name] following both API and UI specs
```

---

## 💡 Tips for Best Results

### 1. Be Specific
Instead of: "Create the form"
Say: "Create the Create GPS Device form using shadcn/ui Form component, following the field structure in @gps_frontend.md section 1 and UI layout in @gps_ui_recommendations.md section 2"

### 2. Reference Line Numbers
When asking about specific details, include line numbers:
```
@gps_frontend.md (lines 49-57) - What are the field requirements?
```

### 3. Combine Both Files
Always reference both files when implementing a feature:
```
Based on @gps_frontend.md and @gps_ui_recommendations.md, create...
```

### 4. Ask for Code Examples
```
@gps_ui_recommendations.md - Show me the exact shadcn/ui code for the table structure
```

### 5. Verify Against Specs
```
Does this implementation match the requirements in @gps_frontend.md and @gps_ui_recommendations.md?
```

---

## 📝 Example Complete Implementation Prompt

```
I need to implement the complete GPS Device Management feature. I have two documentation files:

1. @gps_frontend.md - Contains all API endpoints, request/response formats, error handling, and a complete JavaScript service class example
2. @gps_ui_recommendations.md - Contains UI/UX specifications using shadcn/ui components, layout diagrams, and component code examples

Please help me:

1. First, review both files and create a TypeScript service class based on the JavaScript example in gps_frontend.md
2. Create TypeScript interfaces/types for GPS Device based on the API response structure
3. Set up all required shadcn/ui components (listed in gps_ui_recommendations.md section 13)
4. Implement each page following the UI specifications:
   - List Page (section 1)
   - Create Form (section 2)
   - Detail Page (section 3)
   - Edit Form (section 4)
   - Deactivate Modal (section 5)
5. Integrate all pages with the API endpoints from gps_frontend.md
6. Add proper error handling and loading states
7. Ensure the design matches the dashboard style (section 17)

Use React/Next.js with TypeScript, shadcn/ui components, and react-hook-form for forms.
```

---

## 🚀 Getting Started Checklist

- [ ] Read both documentation files
- [ ] Install shadcn/ui and required components
- [ ] Set up API service layer (TypeScript version of the JavaScript example)
- [ ] Create TypeScript types/interfaces
- [ ] Implement List Page
- [ ] Implement Create Form
- [ ] Implement Detail Page
- [ ] Implement Edit Form
- [ ] Implement Deactivate Modal
- [ ] Add error handling
- [ ] Add loading states
- [ ] Test all API integrations
- [ ] Verify UI matches specifications

---



---


