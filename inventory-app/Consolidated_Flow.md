# Consolidated Module — Complete Flow Documentation

## Overview

The Consolidated module manages high-level inventory categories. Each consolidated item groups multiple non-expendable items under a single property head and appendix. The module provides CRUD operations, Excel upload/download, pagination, search, and filtering.

---

## Data Model

### Database Table: `consolidated_items`

| Column              | Type          | Constraints          | Description                              |
|---------------------|---------------|----------------------|------------------------------------------|
| id                  | UUID          | PK, auto-generated   | Unique identifier                        |
| property_head       | String        | unique, not null      | Category name                            |
| appendix            | String        | unique, not null      | Category code (used as lookup key)       |
| fund_details        | String        | not null              | Funding source                           |
| prev_year_value     | Numeric(18,2) | not null              | Previous year's total value              |
| prev_year_purchases | Numeric(18,2) | nullable              | Purchases made in the previous year      |
| unsv_value          | Numeric(18,2) | nullable              | Unserviceable item value                 |
| serv_value          | Numeric(18,2) | nullable              | Serviceable item value                   |
| dep_value           | Numeric(18,2) | nullable              | Depreciation value                       |
| remarks             | String        | nullable              | Optional remarks                         |

**Computed field (not stored):**
- `present_value = prev_year_value + prev_year_purchases - unsv_value - dep_value`

### Relationship
- Each `NonExpendableItem` references a consolidated item via `category_appendix` → `appendix`.
- Updating a consolidated item's appendix cascades to all linked non-expendable items.
- Deleting a consolidated item removes the parent; non-expendable items should be handled accordingly.

---

## Backend (FastAPI)

**Router:** `/consolidated` (mounted in `main.py`)
**Auth:** All endpoints require a valid JWT via `get_current_user`.

### Endpoints

#### 1. GET `/consolidated/get-consolidated-items`

**Purpose:** Fetch a paginated, searchable, filterable list of consolidated items.

**Query Parameters:**
| Param                | Type       | Default | Description                                |
|----------------------|------------|---------|--------------------------------------------|
| search               | str (opt)  | None    | Searches property_head, appendix, fund_details (case-insensitive) |
| fund_details_filter  | list[str]  | None    | Filter by one or more fund_details values  |
| skip                 | int        | 0       | Offset (number of rows to skip)            |
| limit                | int        | 20      | Page size (1–100)                          |

**Response:**
```json
{
  "total": 50,
  "skip": 0,
  "limit": 10,
  "filter_values": ["GF", "SF"],
  "items": [ { ...item_dict }, ... ]
}
```

- `filter_values` returns ALL distinct fund_details values (unaffected by search/filter) so the UI can always show all filter options.

**Flow:**
1. Build base query on `ConsolidatedItems`.
2. Fetch all distinct `fund_details` for filter chips.
3. Apply search filter (OR across property_head, appendix, fund_details).
4. Apply fund_details_filter if provided.
5. Count total matching rows.
6. Apply ordering (by id), offset, limit.
7. Return paginated results.

---

#### 2. GET `/consolidated/download-consolidated-items`

**Purpose:** Fetch ALL consolidated items with computed `present_value` for Excel export.

**Response:**
```json
{
  "total": 50,
  "items": [ { ...item_dict, "present_value": 12345.00 }, ... ]
}
```

**Flow:**
1. Query all consolidated items.
2. For each item, compute `present_value` (with null-safe arithmetic).
3. Return full list (no pagination).

---

#### 3. POST `/consolidated/create-consolidated-items`

**Purpose:** Bulk-create consolidated items from an uploaded Excel file.

**Request:** `multipart/form-data` with a `.xlsx` or `.xls` file.

**Excel format (3 columns per row):**
| Column 0       | Column 1  | Column 2     |
|----------------|-----------|--------------|
| property_head  | appendix  | fund_details |

**Flow:**
1. Validate file extension.
2. Read Excel with Polars.
3. For each row:
   - Validate exactly 3 columns → 400 if not.
   - Check `appendix` doesn't already exist → 409 if duplicate.
   - Check `property_head` doesn't already exist → 409 if duplicate.
   - Create item with numeric fields initialized to 0.
   - Add to session.
4. Commit all items in a single transaction (atomic).
5. Return `{"msg": "Items Added"}`.

---

#### 4. DELETE `/consolidated/delete-consolidated-items`

**Purpose:** Bulk-delete consolidated items by appendix codes.

**Request Body:**
```json
{ "appendix_list": ["A1", "A2", "A3"] }
```

**Flow:**
1. Delete all items whose `appendix` is in the provided list.
2. Commit.
3. Return success message.

---

#### 5. GET `/consolidated/get-consolidated-item/{item_id}`

**Purpose:** Fetch a single consolidated item by its appendix code.

**Path Parameter:** `item_id` — the appendix string.

**Response:**
```json
{
  "items": { ...item_dict, "present_value": 12345.00 }
}
```

**Flow:**
1. Query by appendix.
2. Return 404 if not found.
3. Compute `present_value` (null-safe).
4. Return item dict.

---

#### 6. PUT `/consolidated/edit-consolidated-item/{item_id}`

**Purpose:** Update a consolidated item's property_head, appendix, and/or fund_details.

**Path Parameter:** `item_id` — current appendix string.

**Request Body:**
```json
{
  "property_head": "New Name",
  "appendix": "NEW-A1",
  "fund_details": "SF"
}
```
All fields are optional. Only provided (non-empty) fields are updated.

**Flow:**
1. Find item by current appendix → 404 if not found.
2. If `property_head` is provided:
   - Check no other item has this property_head → 409 if duplicate.
   - Update property_head.
3. If `appendix` is provided:
   - Check no other item has this appendix → 409 if duplicate.
   - Fetch all NonExpendableItems linked to the old appendix.
   - Update their `category_appendix` to the new appendix.
   - Update item's appendix.
4. Update fund_details (falls back to existing value if not provided).
5. Commit all changes.

---

#### 7. DELETE `/consolidated/delete-consolidated-item/{item_id}`

**Purpose:** Delete a single consolidated item by appendix.

**Flow:**
1. Delete item by appendix.
2. If nothing was deleted → 404.
3. Commit.
4. Return success message.

---

### Workers (Background Jobs)

#### Monthly Email (`send_monthly_email`)
- Generates an Excel report per consolidated item.
- Each sheet contains:
  - **Row 1:** Consolidated item summary (including computed present_value with null-safe arithmetic).
  - **Below:** Table of linked non-expendable items with values, quantities, and depreciation.
- Sends the Excel as an email attachment.

#### Yearly Rollover (`rollover_yearly`)
- Recalculates each consolidated item's values from its linked non-expendable items:
  - `prev_year_value` = sum of (rate * qty) for all linked items.
  - `prev_year_purchases` = reset to 0.
  - `serv_value` = sum of (rate * qty_serv).
  - `unsv_value` = sum of (rate * qty_unsv).
  - `dep_value` = sum of (dep_value/100 * rate * qty_serv).
- Clears remarks on all non-expendable items.

---

## Frontend (React)

### Routes
| Path                                      | Component            | Purpose          |
|-------------------------------------------|----------------------|------------------|
| `/consolidated-items`                     | `Consolidated_Items` | List page        |
| `/consolidated-items/:consolidatedItemID` | `Consolidated_Item`  | Detail/edit page |

---

### Page: Consolidated_Items (List Page)

**State:**
| State             | Type     | Purpose                                |
|-------------------|----------|----------------------------------------|
| consolidatedItems | array    | Current page of items from API         |
| search            | string   | Search query text                      |
| filterValues      | array    | All available fund_details for chips   |
| selectedCategory  | array    | Currently active fund_details filters  |
| page              | number   | Current page number (1-based)          |
| totalPage         | number   | Total number of pages                  |
| item              | array    | Selected item appendixes for deletion  |
| addDialog         | boolean  | Controls add-item dialog visibility    |
| status            | object   | `{type, msg}` for success/error toast  |

**User Flows:**

1. **Page Load:**
   - `useEffect([])` calls `handleGETRequest()` → fetches page 1 with no filters.

2. **Search (Enter key):**
   - Resets to page 1.
   - Calls `handleGETRequest(1)` with the current search text.
   - Backend searches across property_head, appendix, and fund_details.

3. **Filter by Fund Details:**
   - Clicking a filter chip toggles it in `selectedCategory`.
   - A `useEffect([selectedCategory])` (skipped on initial mount) resets to page 1 and fetches.

4. **Pagination:**
   - `handlePageChange(pg)` sets page state and calls `handleGETRequest(pg)`.
   - Frontend sends `skip = (page - 1) * 10` and `limit = 10`.
   - Pagination renders a sliding window of 5 page buttons around the current page.

5. **Select Items for Deletion:**
   - Clicking a table row toggles its appendix in the `item` array.
   - Selected rows are highlighted with `active_table_container` class.
   - "Delete Items" button appears when `item.length > 0`.

6. **Bulk Delete:**
   - Sends `DELETE /consolidated/delete-consolidated-items` with `{ appendix_list: [...] }`.
   - On success: shows toast, clears selection, re-fetches list.

7. **Download Excel:**
   - Fetches ALL items from `GET /consolidated/download-consolidated-items`.
   - Maps data to formatted columns (Property Head, Appendix, Fund Details, values, Present Value, Remarks).
   - Generates styled `.xlsx` with headers and borders using `xlsx-js-style`.

8. **Add Items (Excel Upload):**
   - Opens `Add_Consolidated_dialog`.
   - User selects an `.xlsx`/`.xls` file.
   - On submit: sends as `multipart/form-data` to `POST /consolidated/create-consolidated-items`.
   - On success: shows toast, re-fetches list.
   - Dialog resets file state on close/submit.

9. **Navigate to Detail:**
   - "View More" stores the appendix in `sessionStorage` and navigates to `/consolidated-items/:appendix`.

**Token Refresh:**
- All API errors check `error.response?.status === 401`.
- On 401: calls `handleRefresh()` which posts the refresh token, stores the new access token, and retries the GET request.

---

### Page: Consolidated_Item (Detail/Edit Page)

**State:**
| State              | Type    | Purpose                                   |
|--------------------|---------|-------------------------------------------|
| consolidatedItemId | string  | Current item's appendix (from sessionStorage, kept in sync) |
| consolidatedItem   | object  | Full item data from API (read-only display)|
| editItem           | object  | `{appendix, property_head, fund_details}` for editable fields |
| status             | object  | `{type, msg}` for success/error toast     |
| error              | boolean | Triggers token refresh via useEffect      |

**Layout:**
- **Editable fields** (controlled inputs with `value`): Property Head, Appendix, Fund Details.
- **Read-only fields** (disabled inputs with `value ?? ""`): Past Value, Past Purchases, UNSV Value, SERV Value, Depreciation Value, Present Value, Remarks.

**User Flows:**

1. **Page Load:**
   - Reads `consolidated_item_id` from sessionStorage.
   - `useEffect([])` calls `handleGETRequest()` → fetches item data.
   - Populates both `consolidatedItem` (display) and `editItem` (editable fields).

2. **Edit Item:**
   - User modifies editable fields → updates `editItem` state.
   - Click "Edit" → sends `PUT /consolidated/edit-consolidated-item/{appendix}` with `editItem` payload.
   - If the appendix was changed:
     - Updates `sessionStorage` with the new appendix.
     - Updates `consolidatedItemId` state.
     - Passes the new ID to `handleGETRequest(newId)` to re-fetch correctly.
   - Shows success toast, then re-fetches item data.

3. **Delete Item:**
   - Click "Delete" → sends `DELETE /consolidated/delete-consolidated-item/{appendix}`.
   - On success: shows toast, navigates back to `/consolidated-items` after 2 seconds.

4. **Token Refresh:**
   - On 401 error, sets `error = true`.
   - `useEffect([error])` calls `handleRefresh()`.
   - After refresh (success or failure), resets `error = false` so it can trigger again.
   - On refresh failure, navigates to `/` (login).

---

### Component: Add_Consolidated_dialog

**Props:**
| Prop              | Type     | Purpose                        |
|-------------------|----------|--------------------------------|
| dialog_status     | boolean  | Show/hide the dialog           |
| handle_add_dialog | function | Toggle dialog visibility       |
| handle_submit     | function | Called with the selected file   |

**Behavior:**
- Renders a modal overlay when `dialog_status` is true.
- File input accepts `.xlsx` and `.xls` files.
- On submit: calls `handle_submit(file)`, resets file state and clears the file input.
- On cancel/close: resets file state, clears the file input, closes the dialog.

---

## API ↔ Frontend Contract Summary

| Action           | Frontend Sends                          | Backend Endpoint                              | Backend Returns                       |
|------------------|-----------------------------------------|-----------------------------------------------|---------------------------------------|
| List items       | `GET ?skip=0&limit=10&search=...`       | `/consolidated/get-consolidated-items`         | `{total, items[], filter_values[]}`   |
| Download all     | `GET`                                   | `/consolidated/download-consolidated-items`    | `{total, items[] + present_value}`    |
| Create (upload)  | `POST multipart/form-data`              | `/consolidated/create-consolidated-items`      | `{msg}`                               |
| Bulk delete      | `DELETE {appendix_list: [...]}`          | `/consolidated/delete-consolidated-items`      | `{msg}`                               |
| Get single       | `GET /{appendix}`                       | `/consolidated/get-consolidated-item/{id}`     | `{items: {..., present_value}}`       |
| Edit single      | `PUT /{appendix} {property_head, ...}`  | `/consolidated/edit-consolidated-item/{id}`    | `{msg}`                               |
| Delete single    | `DELETE /{appendix}`                    | `/consolidated/delete-consolidated-item/{id}`  | `{msg}`                               |
