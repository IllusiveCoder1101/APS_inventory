# Non-Expendable Items — Full API Flow Documentation

This document explains how each non-expendable operation works end-to-end, covering the frontend trigger, the HTTP request, all backend checks/conditions, database mutations, consolidated item side-effects, and the frontend response handling.

> **Note:** GF (Government Fund) and SF (School Fund) share the same backend endpoints — the only difference is the `nonexpendable_type` path parameter (`gov` vs `sch`) and the session storage key used for navigation (`non_expendable_gf_id` vs `non_expendable_sf_id`). The flows below apply identically to both.

---

## Table of Contents

1. [GET — List Items (Paginated)](#1-get--list-items-paginated)
2. [GET — Single Item Detail](#2-get--single-item-detail)
3. [POST — Add Items (Excel Upload)](#3-post--add-items-excel-upload)
4. [PUT — Edit Item](#4-put--edit-item)
5. [DELETE — Single Item Delete](#5-delete--single-item-delete)
6. [DELETE — Bulk Delete Items](#6-delete--bulk-delete-items)
7. [PUT — Add Remarks (Auction / Destroy / Used)](#7-put--add-remarks-auction--destroy--used)
8. [PUT — Remove Remarks](#8-put--remove-remarks)
9. [GET — Download Items (Excel)](#9-get--download-items-excel)
10. [Token Refresh Flow](#10-token-refresh-flow)

---

## 1. GET — List Items (Paginated)

### Frontend Trigger
- **On page load:** `useEffect` calls `handleGETRequest()` once on mount.
- **On search:** User types in search box and presses Enter → calls `handleGETRequest()`.
- **On filter change:** User clicks a category appendix filter button → toggles it in `selectedCategory` array → calls `handleGETRequest()`.
- **On page change:** User clicks a pagination button → `handlePageChange(pg)` sets page state and calls `handleGETRequest()`.

### HTTP Request
```
GET /non-expendable/get-non-expendable-items/{gov|sch}
    ?category_appendix_filter=A-1&category_appendix_filter=B-2
    &search=chair
    &skip=1
    &limit=10
Headers: Authorization: Bearer <access_token>
```

**Frontend builds the request** (`Non_Expendable_Items_GF.jsx:195-216`):
- `category_appendix_filter`: sent as array if `selectedCategory` has items, otherwise `undefined` (omitted).
- `search`: sent if non-empty, otherwise `undefined`.
- `skip`: current page number (1-based from frontend).
- `limit`: hardcoded to `10`.

### Backend Processing (`non_expendable.py:152-186`)

1. **Authentication:** `get_current_user` dependency validates the JWT Bearer token. If invalid/expired → 401.

2. **Base query:** Filters `NonExpendableItems` by `nonexpendable_type` (gov or sch).

3. **Get filter values:** Queries all distinct `category_appendix` values for this type (used by frontend to show filter buttons).

4. **Apply search filter** (if `search` param provided):
   - Filters `nomenclature` with case-insensitive LIKE: `%search_term%`.

5. **Apply category filter** (if `category_appendix_filter` param provided):
   - Filters `category_appendix IN (filter_values)`.

6. **Count total** matching items (before pagination).

7. **Paginate:** `offset = skip * limit`, then `.limit(limit)`.

8. **Serialize:** Converts each item to dict via `item.to_dict()`.

### Backend Response
```json
{
  "total": 45,
  "skip": 1,
  "limit": 10,
  "filter_values": ["A-1", "B-2", "C-3"],
  "items": [
    {
      "id": "uuid",
      "ser_no": 1,
      "lp_no": 101,
      "nomenclature": "Office Chair",
      "nonexpendable_type": "gov",
      "category_appendix": "A-1",
      "a_u": "pieces",
      "vintage": "2020-01-15",
      "qty": 10,
      "rate": 500.00,
      "qty_ledger": 10,
      "qty_ground": 10,
      "qty_serv": 8,
      "qty_unsv": 2,
      "dep_value": 12.50,
      "remarks": "Auction:2 Destroy:1"
    }
  ]
}
```

### Frontend Response Handling
- **200:** Sets `nonExpendable` state to `data.data.items` (array of items for table rows). Computes `totalPage = ceil(total / limit)`. Sets `filterValues` for the category filter buttons. Resets page to 1.
- **401:** Sets `error=true` → triggers token refresh flow.
- **Other errors:** Shows "Invalid Details!" error status banner.

### What the User Sees
- Table with columns: Ser No, LP No, Nomenclature, A/U, Category, Remarks, Actions (View More).
- Clicking a table row toggles its selection (for bulk delete).
- Remarks displayed as colored badges (Auction=red-ish, Destroy=orange-ish, Used=grey-ish), parsed from space-separated `"Type:Qty"` strings.
- Pagination controls at the bottom.
- Category filter buttons at the top (toggle on/off).

---

## 2. GET — Single Item Detail

### Frontend Trigger
- User clicks "View More" on a table row in the list page.
- `handleNavigate()` stores the item's `ser_no` in sessionStorage (`non_expendable_gf_id` or `non_expendable_sf_id`), then navigates to the detail route.
- On detail page mount, `useEffect` calls `handleGETRequest()`.

### HTTP Request
```
GET /non-expendable/get-non-expendable-item/{ser_no}
Headers: Authorization: Bearer <access_token>
```

### Backend Processing (`non_expendable.py:264-279`)

1. **Authentication:** JWT validation. 401 if invalid.

2. **Find item:** Query `NonExpendableItems` where `ser_no == item_id`.

3. **Check:** If item not found → **404** `"No item Found"`.

4. **Serialize:** `item.to_dict()` → then compute and append 4 calculated fields:
   - `last_yr_bid_value = rate * qty`
   - `serv_value = rate * qty_serv`
   - `unsv_value = rate * qty_unsv`
   - `dep_price = ((100 - dep_value) / 100) * rate * qty_serv`

### Backend Response
```json
{
  "items": {
    "ser_no": 1,
    "lp_no": 101,
    "nomenclature": "Office Chair",
    "category_appendix": "A-1",
    "a_u": "pieces",
    "vintage": "2020-01-15",
    "qty": 10,
    "rate": 500.00,
    "qty_ledger": 10,
    "qty_ground": 10,
    "qty_serv": 8,
    "qty_unsv": 2,
    "dep_value": 12.50,
    "remarks": "Auction:2",
    "last_yr_bid_value": 5000.00,
    "serv_value": 4000.00,
    "unsv_value": 1000.00,
    "dep_price": 3500.00
  }
}
```

### Frontend Response Handling (`Non_Expendable_item_GF.jsx:139-167`)
- **200:**
  - Sets `nonExpendable` to `data.data.items` (used for read-only calculated fields and remarks display).
  - Populates `editItem` state from the response — maps `category_appendix` → `appendix` for the edit schema:
    ```
    editItem = {
      lp_no:         data.data.items["lp_no"],
      nomenclature:  data.data.items["nomenclature"],
      appendix:      data.data.items["category_appendix"],
      a_u:           data.data.items["a_u"],
      vintage:       data.data.items["vintage"],
      qty:           data.data.items["qty"],
      rate:          data.data.items["rate"],
      qty_unsv:      data.data.items["qty_unsv"],
      qty_serv:      data.data.items["qty_serv"],
      dep_value:     data.data.items["dep_value"]
    }
    ```
- **401:** Token refresh.
- **Other:** Error banner.

### What the User Sees
- **Editable fields:** LP No, Nomenclature, A/U, Vintage, Qty, Rate, Qty SERV, Qty UNSV, Dep percent.
- **Read-only calculated fields:** Last yr bid value, Value of SERV items, Value of UNSV items, Value after Dep.
- **Remarks section:** Each remark as a colored badge with an "x" delete button.
- **Action buttons:** Auction, Destroy, Used Up (top), Delete and Edit (bottom).

---

## 3. POST — Add Items (Excel Upload)

### Frontend Trigger
1. User clicks "New Items" button → opens `Add_Non_Expendable_GF_dialog`.
2. User selects an Excel file (.xlsx or .xls) via the file input.
3. User clicks "Submit" → calls `handle_submit(file)` → parent's `handle_submit_add(file)`.

### Frontend Check
- If `file` is falsy (null/undefined) → shows error banner "Invalid Details!" and does NOT send request.

### HTTP Request
```
POST /non-expendable/create-non-expendable-items/{gov|sch}
Headers: Authorization: Bearer <access_token>
Body: FormData with key "file" containing the Excel file
```

### Backend Processing (`non_expendable.py:188-241`)

1. **Authentication:** JWT validation. 401 if invalid.

2. **File format check:** If filename does not end with `.xlsx` or `.xls` → **400** `"Invalid file format. Upload an Excel file."`.

3. **Read Excel:** Uses Polars (`pl.read_excel`) to parse the file contents.

4. **For each row in the Excel file:**

   a. **Column count check:** Row must have exactly 11 columns. If not → **403** `"Invalid Data"`.

   **Expected column order:**
   | Index | Field              | Example        |
   |-------|--------------------|----------------|
   | 0     | lp_no              | 101            |
   | 1     | nomenclature       | "Office Chair" |
   | 2     | category_appendix  | "A-1"          |
   | 3     | a_u                | "pieces"       |
   | 4     | vintage            | 2020-01-15     |
   | 5     | qty                | 10             |
   | 6     | rate               | 500.00         |
   | 7     | qty_ledger         | 10             |
   | 8     | qty_ground         | 10             |
   | 9     | qty_serv           | 8              |
   | 10    | dep_value          | 12.5           |

   b. **Duplicate check:** Queries DB for any item with same `lp_no` OR same `nomenclature`. If found → **402** `"Item already Exists"`.

   c. **Consolidated item check:** Queries `ConsolidatedItems` for the given `category_appendix` (index 2). If not found → **404** `"Consolidated Item Appendix Does Not Exists"`.

   d. **Update consolidated totals** (`compute_consolidated`):
      - Computes `qty_unsv = qty_ledger (index 7) - qty_serv (index 9)`.
      - Adds to `consolidated_item.prev_year_value += rate * qty`.
      - Adds to `consolidated_item.unsv_value += rate * qty_unsv`.
      - Adds to `consolidated_item.serv_value += rate * qty_serv`.
      - Adds to `consolidated_item.dep_value += (dep_value / 100) * rate * qty_serv`.

   e. **Create DB record:**
      - `qty_unsv` is computed as `qty_ledger - qty_serv` (not from Excel directly).
      - `nonexpendable_type` is set from the URL path parameter.
      - `remarks` is not set (defaults to `NULL`).

   f. **Commit** each item individually.

### Backend Response
```json
{ "msg": "Items Added" }
```

### Frontend Response Handling
- **200:** Shows "Successfully Created!" success banner for 1 second, then clears status and calls `handleGETRequest()` to refresh the list.
- **401:** Token refresh.
- **Other errors:** Shows "Invalid Details!" error banner.

---

## 4. PUT — Edit Item

### Frontend Trigger
1. User modifies any editable field on the detail page (LP No, Nomenclature, A/U, Vintage, Qty, Rate, Qty SERV, Qty UNSV, Dep percent).
2. Each change updates the `editItem` state via `onChange` handlers.
3. User clicks "Edit" button → calls `handleEdit()`.

### HTTP Request
```
PUT /non-expendable/edit-non-expendable-item/{ser_no}
Headers: Authorization: Bearer <access_token>
Body (JSON):
{
  "lp_no": 101,
  "nomenclature": "Office Chair",
  "appendix": "A-1",
  "a_u": "pieces",
  "vintage": "2020-01-15",
  "qty": 10,
  "rate": 500.00,
  "qty_unsv": 2,
  "qty_serv": 8,
  "dep_value": 12.5
}
```

**Note:** The frontend always sends ALL fields (not just changed ones). Values come from the input fields as strings, but Pydantic coerces them to the correct types (int, float, date).

### Backend Processing (`non_expendable.py:284-346`)

1. **Authentication:** JWT validation. 401 if invalid.

2. **Find item:** Query by `ser_no == item_id`. If not found → **404** `"No item Found"`.

3. **LP No uniqueness check** (if `lp_no` is not None):
   - Query for any other item (different `ser_no`) with the same `lp_no`.
   - If found → **402** `"Item Lp No already Exists"`.
   - Otherwise: update `item.lp_no`.

4. **Nomenclature uniqueness check** (if `nomenclature` is truthy):
   - Query for any other item with the same `nomenclature`.
   - If found → **402** `"Item Name already Exists"`.
   - Otherwise: update `item.nomenclature`.

5. **Appendix existence check** (if `appendix` is truthy):
   - Query `ConsolidatedItems` for the given appendix.
   - If not found → **404** `"Consolidated Item Category Does Not Exists"`.

6. **Quantity validation:**
   - Resolve each qty field: use new value if provided, else fall back to current DB value.
   - Check: `qty_unsv + qty_serv must == qty`. If not → **403** `"Invalid Qty Details!"`.

7. **Update consolidated totals** (`compute_consolidated_editing`):
   - Resolves all new values (falls back to old if None).
   - **Subtract old values** from the current consolidated item:
     - `prev_year_value -= old_rate * old_qty`
     - `serv_value -= old_rate * old_qty_serv`
     - `unsv_value -= old_rate * old_qty_unsv`
     - `dep_value -= (old_dep_value / 100) * old_rate * old_qty_serv`
   - **If appendix changed:** targets the NEW consolidated item for addition. Otherwise targets the same one.
   - **Add new values** to target consolidated item:
     - `prev_year_value += new_rate * new_qty`
     - `serv_value += new_rate * new_qty_serv`
     - `unsv_value += new_rate * new_qty_unsv`
     - `dep_value += (new_dep_value / 100) * new_rate * new_qty_serv`

8. **Apply field updates** (each only if not None):
   - `a_u`, `vintage`, `rate`, `qty_serv`, `qty_unsv`, `dep_value`, `category_appendix`.
   - If `qty` is updated: also sets `qty_ground = qty` and `qty_ledger = qty`.

9. **Commit.**

### Backend Response
```json
{ "msg": "Item Updated Successfully" }
```

### Frontend Response Handling
- **200:** Shows "Successfully Edited Item!" success banner for 2 seconds, then clears and calls `handleGETRequest()` to refresh detail data.
- **401:** Token refresh.
- **Other:** Error banner.

---

## 5. DELETE — Single Item Delete

### Frontend Trigger
- User clicks "Delete" button on the detail page → calls `handleDelete()`.

### HTTP Request
```
DELETE /non-expendable/delete-non-expendable-item/{ser_no}
Headers: Authorization: Bearer <access_token>
```

### Backend Processing (`non_expendable.py:352-369`)

1. **Authentication:** 401 if invalid.

2. **Find item:** Query by `ser_no`. If not found → **404** `"No item Found"`.

3. **Update consolidated totals** (`compute_consolidated_deletion`):
   - Finds the parent `ConsolidatedItems` by `category_appendix`.
   - Subtracts:
     - `prev_year_value -= rate * qty`
     - `unsv_value -= rate * qty_unsv`
     - `serv_value -= rate * qty_serv`
     - `dep_value -= (dep_value / 100) * rate * qty_serv`

4. **Delete the item** from DB.

5. **Commit.**

### Backend Response
```json
{ "msg": "Item Deleted Successfully" }
```

### Frontend Response Handling
- **200:** Shows "Successfully Deleted Item!" for 2 seconds, then navigates back to the list page (`/non-expendable-items-gf` or `/non-expendable-items-sf`).
- **401:** Token refresh.
- **Other:** Error banner.

---

## 6. DELETE — Bulk Delete Items

### Frontend Trigger
1. User clicks table rows on the list page to select/deselect items (toggles `ser_no` in/out of `item` array).
2. When at least 1 item is selected, a "Delete Items" button appears.
3. User clicks "Delete Items" → calls `handle_item_deletion()`.

### HTTP Request
```
DELETE /non-expendable/delete-non-expendable-items
Headers: Authorization: Bearer <access_token>
Body (JSON): { "item_ids": [1, 3, 7] }
```

**Note:** axios.delete sends the body via `{data: payload}` config (not as a 2nd positional argument).

### Backend Processing (`non_expendable.py:245-260`)

1. **Authentication:** 401 if invalid.

2. **Parse body:** Pydantic validates `DeleteItems` schema — expects `item_ids` as `list[int]`.

3. **For each `ser_no` in `item_ids`:**
   - Queries the item by `ser_no`.
   - Calls `compute_consolidated_deletion()` to subtract that item's values from its parent ConsolidatedItem.

4. **Bulk delete:** Deletes all items where `ser_no IN (item_ids)` in one query.

5. **Commit.**

**No 404 check:** If any `ser_no` doesn't exist, the loop will get `None` and `compute_consolidated_deletion` will fail with an AttributeError. This is a potential issue but only occurs with invalid IDs.

### Backend Response
```json
{ "msg": "Items Deleted Successfully" }
```

### Frontend Response Handling
- **200:** Shows "Successfully Deleted!" for 1 second, then clears the selected items array and refreshes the list via `handleGETRequest()`.
- **401:** Token refresh.
- **Other:** Error banner.

---

## 7. PUT — Add Remarks (Auction / Destroy / Used)

### Frontend Trigger
1. User clicks "Auction", "Destroy", or "Used Up" button on the detail page.
2. Opens `Status_dialog` with `statusType` set to the clicked type.
3. User enters a quantity and selects SERV or UNSV.
4. **Frontend validation** (in `Status_dialog.jsx:51`):
   - `qty` must be truthy and > 0.
   - `selectedType` must be set (SERV or UNSV).
   - If either fails → the submit is silently ignored (no request sent).
5. On valid submit → calls `handle_status_submit(status_type, {qty, qty_type})`.

### HTTP Request
```
PUT /non-expendable/add-remarks/{Auction|Destroy|Used}/{ser_no}
Headers: Authorization: Bearer <access_token>
Body (JSON): { "qty": 2, "qty_type": "UNSV" }
```

### Backend Processing (`non_expendable.py:372-420`)

1. **Authentication:** 401 if invalid.

2. **Validate remark_type:** Must be one of `"Auction"`, `"Destroy"`, `"Used"`. Otherwise → **400** `"Invalid remark type"`.

3. **Validate qty_type:** Must be `"SERV"` or `"UNSV"`. Otherwise → **400** `"Invalid qty type"`.

4. **Validate qty:** Must be > 0. Otherwise → **400** `"Qty must be greater than 0"`.

5. **Find item:** Query by `ser_no`. If not found → **404** `"No item Found"`.

6. **Sufficient quantity check:**
   - If `qty_type == "UNSV"`: checks `qty_unsv - payload.qty >= 0`. If not → **403** `"Invalid Request!"`.
   - If `qty_type == "SERV"`: checks `qty_serv - payload.qty >= 0`. If not → **403** `"Invalid Request!"`.

7. **Update consolidated totals** (`compute_consolidated_custom_deletion`):
   - Finds parent ConsolidatedItem. If not found → **404**.
   - Subtracts `prev_year_value -= rate * qty`.
   - If UNSV: subtracts `unsv_value -= rate * qty`.
   - If SERV: subtracts `serv_value -= rate * qty` AND `dep_value -= (dep_value/100) * rate * qty`.

8. **Decrement item quantities:**
   - If UNSV: `qty_unsv -= qty`, `qty -= qty`, `qty_ledger -= qty`, `qty_ground -= qty`.
   - If SERV: `qty_serv -= qty`, `qty -= qty`, `qty_ledger -= qty`, `qty_ground -= qty`.

9. **Append remark:** Format = `"Type:Qty"` (e.g., `"Auction:2"`).
   - If remarks already exist: append with space separator → `"Auction:2 Destroy:1"`.
   - If no existing remarks: set as the single remark string.

10. **Commit.**

### Backend Response
```json
{ "msg": "Remark Added Successfully" }
```

### Frontend Response Handling
- **200:** Shows success message ("Successfully Auctioned" / "Successfully Destroyed" / "Successfully Used up") for 2 seconds, then refreshes detail via `handleGETRequest()`.
- **401:** Token refresh.
- **Other:** Error banner.

### Remarks Storage Format
Remarks are stored as a single string in the DB column, space-separated:
```
"Auction:2 Destroy:1 Used:5 Auction:3"
```
Each token = `Type:Qty`. Multiple remarks of the same type can exist as separate tokens.

---

## 8. PUT — Remove Remarks

### Frontend Trigger
1. On the detail page, each remark badge has an "x" button.
2. Clicking "x" sets `deleteRemark = {type: "Auction", qty: 2}`.
3. A confirmation UI appears asking "Restore 2 Auction items to:" with SERV / UNSV / Cancel buttons.
4. User clicks SERV or UNSV → calls `handle_status_delete(type, {qty, qty_type})`.

### HTTP Request
```
PUT /non-expendable/remove-remarks/{Auction|Destroy|Used}/{ser_no}
Headers: Authorization: Bearer <access_token>
Body (JSON): { "qty": 2, "qty_type": "SERV" }
```

### Backend Processing (`non_expendable.py:424-469`)

1. **Authentication:** 401 if invalid.

2. **Validate remark_type:** Must be `"Auction"`, `"Destroy"`, or `"Used"`. Otherwise → **400**.

3. **Validate qty_type:** Must be `"SERV"` or `"UNSV"`. Otherwise → **400**.

4. **Validate qty:** Must be > 0. Otherwise → **400**.

5. **Find item:** Query by `ser_no`. If not found → **404**.

6. **Find the exact remark token:**
   - Splits remarks string by spaces, filters empty strings.
   - Builds target = `"Type:Qty"` (e.g., `"Auction:2"`).
   - Checks if target exists in the parts list. If not → **404** `"Remark not found"`.

7. **Update consolidated totals** (`compute_consolidated_custom_addition`):
   - Finds parent ConsolidatedItem. If not found → **404**.
   - Adds `prev_year_value += rate * qty`.
   - If UNSV: adds `unsv_value += rate * qty`.
   - If SERV: adds `serv_value += rate * qty` AND `dep_value += (dep_value/100) * rate * qty`.

8. **Increment item quantities** (restoring them):
   - If UNSV: `qty_unsv += qty`, `qty += qty`, `qty_ledger += qty`, `qty_ground += qty`.
   - If SERV: `qty_serv += qty`, `qty += qty`, `qty_ledger += qty`, `qty_ground += qty`.

9. **Remove the remark token:** Removes the first occurrence of the target from the parts list, then re-joins with spaces.

10. **Commit.**

### Backend Response
```json
{ "msg": "Remark Removed Successfully" }
```

### Frontend Response Handling
- **200:** Shows "Removed Remarks!" for 2 seconds, clears `deleteRemark`, refreshes detail.
- **401:** Token refresh.
- **Other:** Error banner.

### Important Detail
The user gets to choose whether the restored quantity goes to SERV or UNSV. The original remark doesn't track which pool it came from — that's why the confirmation dialog asks.

---

## 9. GET — Download Items (Excel)

### Frontend Trigger
- User clicks "Download" button on the list page → calls `handle_item_download()`.

### HTTP Request
```
GET /non-expendable/download-non-expendable-items/{gov|sch}
Headers: Authorization: Bearer <access_token>
```

### Backend Processing (`non_expendable.py:124-150`)

1. **Authentication:** 401 if invalid.

2. **Get all distinct categories** for this type, ordered alphabetically.

3. **For each category:**
   - Query all items in that category.
   - Serialize each via `to_dict()`.
   - Compute and append 4 calculated fields per item:
     - `last_yr_bid_value = rate * qty`
     - `serv_value = rate * qty_serv`
     - `unsv_value = rate * qty_unsv`
     - `dep_price = ((100 - dep_value) / 100) * rate * qty_serv`
   - Store as `final_response[category_appendix] = [items...]`.

### Backend Response
```json
{
  "items": {
    "A-1": [
      { "ser_no": 1, "lp_no": 101, ..., "last_yr_bid_value": 5000, "dep_price": 3500 },
      { "ser_no": 2, ... }
    ],
    "B-2": [
      { "ser_no": 5, ... }
    ]
  }
}
```

### Frontend Response Handling (`Non_Expendable_Items_GF.jsx:156-174` + `downloadExcel`)
- **200:**
  - Extracts `data.data.items` (object keyed by category appendix).
  - Calls `downloadExcel(dataset, "Non_Expendable_Gov_Fund.xlsx")`.

  **`downloadExcel` function:**
  1. Creates a new XLSX workbook.
  2. Iterates over each `[category, items_array]` entry.
  3. For each category:
     - Maps each item's raw keys to human-readable headers via `HEADERS_MAP`.
     - Creates an XLSX worksheet from the formatted rows.
     - Appends the worksheet with the category name as sheet name.
  4. Writes the file → triggers browser download.

  **HEADERS_MAP** (raw key → Excel column header):
  | Key | Header |
  |-----|--------|
  | ser_no | Serial No. |
  | lp_no | LP No. |
  | nomenclature | Nomenclature |
  | category_appendix | Consolidated Category |
  | a_u | A/U |
  | vintage | Vintage |
  | qty | Quantity |
  | rate | Rate |
  | qty_ledger | Quantity Ledger |
  | qty_serv | Quantity Serviciable |
  | qty_unsv | Quantity Unservicable |
  | last_yr_bid_value | Last Year Bid Value |
  | serv_value | Servicable Value |
  | unsv_value | Unservicable Value |
  | dep_value | Depreciation Percentage |
  | dep_price | Final Price |
  | remarks | Remarks |

- **401:** Token refresh.
- **Other:** Error banner.

---

## 10. Token Refresh Flow

### Trigger
Any API call that returns **401** sets `error = true`. A `useEffect` watching `error` calls `handleRefresh()`.

### Flow
1. Frontend reads `refresh_token` from sessionStorage (JSON.parse).
2. Sends `POST /auth/refresh/{refresh_token}`.
3. **On 200:** Stores new `access_token` in sessionStorage, then retries the original GET request via `handleGETRequest()`.
4. **On error (detail page only):** Shows error banner and navigates to home (`/`).
5. **On error (list page):** Shows error banner only.

---

## Consolidated Items Side-Effect Summary

Every non-expendable CRUD operation updates the parent `ConsolidatedItems` record to keep aggregate values in sync. Here's a summary:

| Operation | Consolidated Effect |
|-----------|-------------------|
| **Create** (each item) | `+= rate*qty` to prev_year_value, `+= rate*qty_unsv` to unsv_value, `+= rate*qty_serv` to serv_value, `+= (dep/100)*rate*qty_serv` to dep_value |
| **Delete** (each item) | Exact reverse of Create (subtract all the same values) |
| **Edit** | Subtracts old values from old category's consolidated, adds new values to new (or same) category's consolidated |
| **Add Remark** | Subtracts `rate*qty` from prev_year_value, plus from unsv_value or serv_value (and dep_value if SERV) |
| **Remove Remark** | Exact reverse of Add Remark (adds back the values) |

---

## Database Schema Quick Reference

### NonExpendableItems Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| ser_no | Integer | Auto-increment, unique, indexed |
| lp_no | Integer | Unique |
| nomenclature | String | Unique |
| nonexpendable_type | String | Not null ("gov" or "sch") |
| category_appendix | String | FK → consolidated_items.appendix (CASCADE delete) |
| a_u | String | Not null |
| vintage | Date | Not null |
| qty | Integer | Not null |
| rate | Numeric(12,2) | Not null |
| qty_ledger | Integer | Not null |
| qty_ground | Integer | Not null |
| qty_serv | Integer | Not null |
| qty_unsv | Integer | Not null |
| dep_value | Numeric(10,2) | Not null |
| remarks | String | Nullable |

### Pydantic Schemas
- **NonExpendableItem** (edit/create body): All fields optional (`int|None`, `str|None`, etc.) for partial updates.
- **NonExpendableRemarks** (add/remove remark body): `qty: int`, `qty_type: str`.
- **DeleteItems** (bulk delete body): `item_ids: list[int]`.
- **DefaultResponse** (standard reply): `msg: str`.
