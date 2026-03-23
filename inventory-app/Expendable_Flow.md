# Expendable Items - Complete Flow Documentation

## Architecture Overview

The Expendable system tracks consumable inventory items using a **monthly ledger model**. Each item has an opening balance (`qty_prev_month`), and throughout the month, transactions (issues) either add to purchases or deplete via utilization. At month-end, a worker rolls over the final balance as the next month's opening balance and clears all issue records.

---

## Database Models

### ExpendableItems (`expendable_items` table)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Primary key |
| ser_no | Integer | Identity, unique, indexed | Auto-incrementing serial number |
| items | String | unique, not null | Item name |
| unit | String | not null | Unit of measurement |
| qty_prev_month | Integer | not null | Opening balance (previous month's final balance) |
| purchase_curr_month | Integer | not null | Total received this month (sum of all receipt issues) |
| utilized_curr_month | Integer | not null | Total issued this month (sum of all issuance issues) |
| remarks | String | nullable | Optional remarks |

**Computed field**: `final_balance = qty_prev_month + purchase_curr_month - utilized_curr_month`

### ExpendableItemsIssue (`expendable_items_issue` table)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Primary key |
| ser_no | Integer | Identity, unique, indexed | Auto-incrementing serial number |
| date | Date | not null | Transaction date |
| rv_iv | String | nullable | Receipt Voucher/Issue Voucher number (set for receipts, "NA" for issuances) |
| category_id | Integer | FK -> expendable_items.ser_no, CASCADE | Parent item reference |
| whom_id_issue | String | not null | Whom ID / Issue reference (set for issuances, "NA" for receipts) |
| qty_received | Integer | nullable | Quantity received (>0 for receipts, 0 for issuances) |
| qty_issued | Integer | not null | Quantity issued (>0 for issuances, 0 for receipts) |

**Key rule**: An issue is either a **receipt** (has `rv_iv`, `qty_received > 0`) or an **issuance** (has `whom_id_issue`, `qty_issued > 0`), never both.

---

## Pydantic Schemas

### ExpendableItem (Edit schema)
- `items: str | None` - Item name
- `unit: str | None` - Unit
- `qty_prev_month: int | None` - Ledger balance
- `remarks: str | None` - Remarks

### ExpendableItemsList (List schema)
- `ser_no, items, unit, qty_prev_month, purchase_curr_month, utilized_curr_month, remarks`

### ExpendableIssueGet
- `ser_no, rv_iv, date, category_id, whom_id_issue, qty_received, qty_issued`

### ExpendableIssueCreate
- `date: date` (required)
- `rv_iv: str | None` - Set for receipt transactions
- `whom_id_issue: str | None` - Set for issuance transactions
- `qty_received: int = 0` - Quantity received
- `qty_issued: int = 0` - Quantity issued

### ExpendableIssueEdit
- `rv_iv: str | None`
- `whom_id_issue: str | None`
- `qty_received: int | None`
- `qty_issued: int | None`

### DeleteItems (shared)
- `item_ids: list[int]` - List of ser_no values to delete

---

## API Endpoints

### Expendable Items Router (`/expendable`)

#### 1. GET `/expendable/get-expendable-items`
**Purpose**: List all expendable items with search and pagination.

**Query params**: `search` (optional), `skip` (default 0), `limit` (default 20, max 100)

**Flow**:
1. Query `ExpendableItems` table
2. If `search` provided, filter by `items.ilike(%search%)`
3. Count total matching records
4. Apply `order_by(ser_no)`, `offset(skip * limit)`, `limit(limit)`
5. Return `{total, skip, limit, items: [to_dict()]}`

**Frontend**: `Expendable_Items.jsx` calls this on mount, search (Enter key), and page change. Sends `skip: page-1`, `limit: 10`.

---

#### 2. GET `/expendable/download-expendable-items`
**Purpose**: Download all items with their issue details for Excel export.

**Flow**:
1. Query all `ExpendableItems` ordered by `ser_no`
2. For each item, compute `final_balance` and fetch all related `ExpendableItemsIssue` records
3. Return `{total, items: [{item_details: {..., final_balance}, inner_items: [...]}]}`

**Frontend**: `Expendable_Items.jsx` calls this on Download click. Uses `XLSX` library to generate a multi-sheet Excel file with:
- One sheet per item (metadata + issue table)
- A summary sheet with all items

---

#### 3. POST `/expendable/create-expendable-items`
**Purpose**: Bulk create items from Excel upload.

**Body**: `multipart/form-data` with `file` (xlsx/xls)

**Flow**:
1. Validate file is Excel format
2. Read with `polars.read_excel()`
3. For each row (expects 4 columns: item_name, unit, qty_prev_month, remarks):
   - Validate row has exactly 4 columns
   - Validate item_name and unit are not empty
   - Default remarks to "NA" if empty, qty_prev_month to 0 if empty
   - Check for duplicate item names
   - Create `ExpendableItems` object
4. Add all items to DB in single transaction (commit once after loop)
5. Return `{msg: "Items Added"}`

**Frontend**: `Add_Expendable_dialog.jsx` provides a file upload. `Expendable_Items.jsx` sends via `FormData`.

---

#### 4. DELETE `/expendable/delete-expendable-items`
**Purpose**: Bulk delete expendable items by ser_no list.

**Body**: `{item_ids: [int]}`

**Flow**:
1. Delete all `ExpendableItems` where `ser_no in item_ids` (cascade deletes related issues)
2. Commit and return `{msg: "Items Deleted Successfully"}`

**Frontend**: `Expendable_Items.jsx` tracks selected items in `item` state array. Sends via `axios.delete` with `{data: payload}` config.

---

#### 5. GET `/expendable/get-expendable-item/{item_id}`
**Purpose**: Get a single expendable item's details.

**Path param**: `item_id: int` (ser_no)

**Flow**:
1. Query `ExpendableItems` by `ser_no == item_id`
2. Return 404 if not found
3. Compute `final_balance = qty_prev_month + purchase_curr_month - utilized_curr_month`
4. Return `{items: to_dict(), final_balance}`

**Frontend**: `Expendable_Item.jsx` calls this on mount. Populates both display fields (disabled inputs) and edit fields.

---

#### 6. PUT `/expendable/edit-expendable-item/{item_id}`
**Purpose**: Edit an expendable item's editable fields.

**Path param**: `item_id: int` (ser_no)
**Body**: `ExpendableItem` schema (all fields optional)

**Flow**:
1. Find item by `ser_no == item_id`, return 404 if not found
2. If `items` is not None: check for duplicate names (excluding self), return 409 if duplicate, else update
3. If `qty_prev_month` is not None: validate `new_qty + purchase - utilized >= 0` (no negative balance), return 400 if invalid, else update
4. If `unit` is not None: update unit
5. If `remarks` is not None: update remarks
6. Commit and return `{msg: "Item Updated Successfully"}`

**Frontend**: `Expendable_Item.jsx` sends `{items, unit, remarks}` from `editItem` state. Editable fields: Item Name, Unit, Remarks. Read-only fields: Ledger Balance, New Purchase, Utilized, Ground Balance.

---

#### 7. DELETE `/expendable/delete-expendable-item/{item_id}`
**Purpose**: Delete a single expendable item.

**Path param**: `item_id: int` (ser_no)

**Flow**:
1. Delete `ExpendableItems` where `ser_no == item_id` (cascade deletes issues)
2. Commit and return `{msg: "Item Deleted Successfully"}`

**Frontend**: `Expendable_Item.jsx` Delete button. On success, navigates back to `/expendable-items`.

---

### Expendable Issue Router (`/expendable-issue`)

#### 8. GET `/expendable-issue/get-expendable-issue/{category_id}`
**Purpose**: List issues for a specific expendable item with search and pagination.

**Path param**: `category_id: int` (parent item ser_no)
**Query params**: `search` (searches `whom_id_issue`), `skip`, `limit`

**Flow**:
1. Query `ExpendableItemsIssue` filtered by `category_id`
2. If `search`, filter by `whom_id_issue.ilike(%search%)`
3. Count total, apply pagination (`offset(skip * limit)`)
4. Return `{total, skip, limit, items: [to_dict()]}`

**Frontend**: `Expendable_Item.jsx` calls on mount and search. Sends `skip: page-1`, `limit: 10`.

---

#### 9. POST `/expendable-issue/create-expendable-issue/{category_id}`
**Purpose**: Create a new issue (receipt or issuance) for an expendable item.

**Path param**: `category_id: int` (parent item ser_no)
**Body**: `ExpendableIssueCreate` schema

**Flow**:
1. Find parent `ExpendableItems` by `category_id`, return 404 if not found
2. Validate: cannot set BOTH `rv_iv` AND `whom_id_issue` (return 400)
3. Validate: must set at LEAST ONE of `rv_iv` or `whom_id_issue` (return 400)
4. Validate: at least one of `qty_received` or `qty_issued` must be > 0 (return 400)
5. Create `ExpendableItemsIssue`:
   - If receipt (`rv_iv` set): `qty_received = payload.qty_received`, `qty_issued = 0`, `whom_id_issue = "NA"`
   - If issuance (`whom_id_issue` set): `qty_issued = payload.qty_issued`, `qty_received = 0`, `rv_iv = "NA"`
6. Update parent item:
   - Receipt: `purchase_curr_month += qty_received`
   - Issuance: `utilized_curr_month += qty_issued`
7. Commit and return `{msg: "Issue Added"}`

**Frontend**: `Add_Expendable_Issue_dialog.jsx` collects: date, rv_iv, whom_id_issue, qty_received, qty_issued. `Expendable_Item.jsx` sends with `category_id` as URL path param.

---

#### 10. PUT `/expendable-issue/edit-expendable-issues/{item_id}`
**Purpose**: Edit an existing issue's fields.

**Path param**: `item_id: int` (issue ser_no)
**Body**: `ExpendableIssueEdit` schema (all fields optional)

**Flow**:
1. Find issue by `ser_no == item_id`, return 404 if not found
2. Find parent `ExpendableItems`, needed for balance checks
3. If no fields provided at all, return 400
4. If `qty_issued` is not None and > 0:
   - Validate issue originally had `qty_issued > 0` (can't change receipt to issuance)
   - Check: `current_balance + old_issued - new_issued >= 0` (no negative balance)
   - Update: `parent.utilized_curr_month = utilized - old + new`, `issue.qty_issued = new`
5. If `qty_received` is not None and > 0:
   - Validate issue originally had `qty_received > 0`
   - Check: `current_balance - old_received + new_received >= 0`
   - Update: `parent.purchase_curr_month = purchase - old + new`, `issue.qty_received = new`
6. If `rv_iv` provided: validate issue is a receipt (rv_iv != "NA"), then update
7. If `whom_id_issue` provided: validate issue is an issuance (whom_id_issue != "NA"), then update
8. Multiple fields can be edited in a single request
9. Commit and return `{msg: "Item Edited Successfully"}`

**Frontend**: `Edit_Expendable_Issue_dialog.jsx` pre-populates with current issue data. Shows date (disabled), rv_iv, whom_id_issue, qty_received, qty_issued. Sends edited fields.

---

#### 11. DELETE `/expendable-issue/delete-expendable-issues`
**Purpose**: Bulk delete issues and reverse their effect on parent item totals.

**Body**: `{item_ids: [int]}` (list of issue ser_no values)

**Flow**:
For each issue_id:
1. Find issue by `ser_no`, return 404 if not found
2. Find parent `ExpendableItems`
3. If receipt (`qty_received > 0`):
   - Check: `current_balance - qty_received >= 0` (return 400 if would go negative)
   - Reverse: `parent.purchase_curr_month -= qty_received`
4. If issuance (`qty_issued > 0`):
   - Reverse: `parent.utilized_curr_month -= qty_issued`
5. Delete the issue record
6. Commit after each issue
7. Return `{msg: "Items Deleted Successfully"}`

**Frontend**: `Expendable_Item.jsx` tracks selected issues in `item` state. Sends `{item_ids: [...]}` via `axios.delete` with `{data: payload}`.

---

## Frontend Pages & Components

### Expendable_Items.jsx (List Page)
**Route**: `/expendable-items`

**State**:
- `ExpendableItems`: array of items from API
- `search`: search term
- `page/totalPage`: pagination state
- `item`: array of selected ser_nos for bulk delete
- `addDialog`: file upload dialog visibility
- `status`: toast notification `{type, msg}`
- `error`: triggers token refresh

**User Actions**:
1. **Search**: Type and press Enter -> `handleGETRequest()` with search param
2. **Pagination**: Click page buttons -> `handlePageChange(pg)` sends page directly to avoid stale closure
3. **View Item**: Click "View More" -> stores `ser_no` in sessionStorage, navigates to detail page
4. **Add Items**: Click "New Items" -> opens `Add_Expendable_dialog` for Excel upload
5. **Delete Items**: Select rows (click to toggle), click "Delete Items" -> `handle_item_deletion()`
6. **Download**: Click "Download" -> `handle_item_download()` fetches all data, generates multi-sheet Excel

---

### Expendable_Item.jsx (Detail Page)
**Route**: `/expendable-items/:id`

**State**:
- `expendableItem`: full item data (read-only display)
- `editItem`: editable fields `{items, unit, remarks}`
- `issue`: array of issues
- `item`: array of selected issue ser_nos for deletion
- `editIssue`: `{item_id, data}` for the issue being edited
- `addDialog/editDialog`: dialog visibility
- `page/totalPage`: issue pagination state

**User Actions**:
1. **Edit Item**: Modify Item Name, Unit, or Remarks fields -> click "Edit" button -> `handleEdit()`
2. **Delete Item**: Click "Delete" -> `handleDelete()` -> navigates back to list
3. **Search Issues**: Type and press Enter -> `handleGETIssueRequest()`
4. **Pagination**: Click page buttons -> `handlePageChange(pg)` calls `handleGETIssueRequest(pg)`
5. **Add Issue**: Click "Add Issue" -> opens `Add_Expendable_Issue_dialog`
6. **Edit Issue**: Click edit icon on row -> stores full row data in `editIssue`, opens `Edit_Expendable_Issue_dialog`
7. **Delete Issues**: Select rows, click "Delete Issues" -> `handleDeleteIssueRequest()`

---

### Add_Expendable_Issue_dialog.jsx
**Fields**: date, rv_iv, whom_id_issue, qty_received, qty_issued
**Behavior**: User fills either rv_iv OR whom_id_issue (not both), sets the corresponding quantity, picks a date, and submits.

### Edit_Expendable_Issue_dialog.jsx
**Props**: `editData` (current issue row data)
**Fields**: date (disabled), rv_iv, whom_id_issue, qty_received, qty_issued
**Behavior**: Pre-populates with current values (converts "NA" to empty). User modifies and submits.

### Add_Expendable_dialog.jsx
**Behavior**: Simple file upload dialog for Excel bulk import.

---

## Workers (Scheduled Tasks)

### Monthly Email (`send_monthly_email`) - Async
**Schedule**: 1st of every month

**Flow**:
1. Query all `ExpendableItems` and `ConsolidatedItems`
2. Generate Excel 1 (Expendable Report):
   - One sheet per expendable item with summary + issue table
   - Handles empty issue lists gracefully
3. Generate Excel 2 (Consolidated/Non-Expendable Report):
   - One sheet per consolidated item with summary + non-expendable items table
4. Send HTML email with both Excel files as attachments

### Monthly Rollover (`rollover_expendable_monthly`) - Async
**Schedule**: 1st of every month

**Flow**:
1. For each `ExpendableItems`:
   - `final_balance = qty_prev_month + purchase_curr_month - utilized_curr_month`
   - Set `qty_prev_month = final_balance`
   - Reset `purchase_curr_month = 0`, `utilized_curr_month = 0`
2. Delete ALL `ExpendableItemsIssue` records (transactions rolled into qty_prev_month)
3. Commit all changes in single transaction
4. Has error handling with rollback on failure

---

## Authentication Flow
All endpoints require `current_user = Depends(get_current_user)` (JWT Bearer token).

**Frontend token handling**:
1. Access token stored in `sessionStorage` as JSON string
2. On 401 error: `setError(true)` triggers useEffect -> `handleRefresh()`
3. `handleRefresh()` calls `POST /auth/refresh/{refresh_token}` to get new access token
4. On refresh success: stores new token, retries GET request
5. On refresh failure: navigates to login page (`/`)

---

## Key Business Rules

1. **Receipt vs Issuance**: Each issue is either a receipt (has rv_iv, qty_received > 0) or an issuance (has whom_id_issue, qty_issued > 0). Cannot be both.
2. **Balance Protection**: Edits and deletions check that `final_balance` never goes negative.
3. **Cascade Delete**: Deleting an `ExpendableItems` row cascade-deletes all its issues via FK constraint.
4. **Issue Deletion Reversal**: When deleting issues, the parent item's `purchase_curr_month` or `utilized_curr_month` is reversed first.
5. **Monthly Reset**: On the 1st of each month, final balance becomes next month's opening balance, counters reset to 0, all issue records are purged.
6. **Unique Item Names**: Item names must be unique across all expendable items.
7. **Atomic Bulk Create**: Excel upload validates all rows first, then commits all in one transaction. If any row fails validation, nothing is created.
