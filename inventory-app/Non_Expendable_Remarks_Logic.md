# Non Expendable Remarks Logic

## Overview

Non-expendable items support structured remarks for tracking items that have been **Auctioned**, **Destroyed**, or **Used Up**. Each action deducts stock from the item and its parent consolidated record, and appends a remark entry. Remarks can also be removed, which reverses the stock changes.

---

## Data Format

The `remarks` column on `NonExpendableItems` stores a **space-separated string** of `type:qty` pairs:

```
"Auction:5 Destroy:2 Used:1"
```

Each token represents one remark action. Multiple remarks of the same type can coexist (e.g. `"Auction:3 Auction:2"`).

---

## Adding a Remark

### Flow

1. User clicks **Auction** / **Destroy** / **Used** button on the detail page
2. `Status_dialog` opens, collecting:
   - **Qty** (number) - how many items to mark
   - **SERV / UNSV** toggle - which stock type to deduct from
3. On submit, frontend sends:
   ```
   PUT /non-expendable/add-remarks/{remark_type}/{item_id}
   Body: { "qty": 3, "qty_type": "UNSV" }
   ```
4. Backend validates, deducts stock, appends remark, commits
5. Frontend re-fetches and displays updated badges

### Frontend Validation (Status_dialog)

- `qty` must not be empty and `parseInt(qty)` must be `> 0`
- `selectedType` must be selected (SERV or UNSV)
- If either fails, submit is blocked (dialog stays open)

### Backend Validation (add_remarks endpoint)

| Check | Condition | Error |
|-------|-----------|-------|
| Remark type | Must be `"Auction"`, `"Destroy"`, or `"Used"` | 400 Invalid remark type |
| Qty type | Must be `"SERV"` or `"UNSV"` | 400 Invalid qty type |
| Qty | Must be `> 0` | 400 Qty must be greater than 0 |
| Item exists | Found by `ser_no` | 404 No item Found |
| Stock available (UNSV) | `qty_unsv - qty >= 0` | 403 Invalid Request! |
| Stock available (SERV) | `qty_serv - qty >= 0` | 403 Invalid Request! |
| Consolidated exists | Found by `category_appendix` | 404 Consolidated Item Not Found |

### Backend Updates (single transaction)

**Consolidated record:**
- `prev_year_value -= rate * qty`
- If UNSV: `unsv_value -= rate * qty`
- If SERV: `serv_value -= rate * qty` and `dep_value -= (dep_value / 100) * rate * qty`

**Item record:**
- If UNSV: `qty_unsv -= qty`
- If SERV: `qty_serv -= qty`
- Both cases: `qty -= qty`, `qty_ledger -= qty`, `qty_ground -= qty`

**Remarks string:**
- Appends `"{remark_type}:{qty}"` (e.g. `"Auction:3"`)
- If remarks was `None` -> `"Auction:3"`
- If remarks was `"Destroy:2"` -> `"Destroy:2 Auction:3"`

---

## Removing a Remark

### Flow

1. User clicks the **x** button on a remark badge (e.g. `Auction: 3`)
2. Inline confirmation bar appears: *"Restore 3 Auction items to: SERV / UNSV / Cancel"*
   - Backend does not store which stock type was originally deducted, so user must choose where to restore
3. On selection, frontend sends:
   ```
   PUT /non-expendable/remove-remarks/{remark_type}/{item_id}
   Body: { "qty": 3, "qty_type": "SERV" }
   ```
4. Backend validates, checks remark exists, restores stock, removes remark, commits
5. Frontend re-fetches and badge disappears

### Backend Validation (remove_remarks endpoint)

| Check | Condition | Error |
|-------|-----------|-------|
| Remark type | Must be `"Auction"`, `"Destroy"`, or `"Used"` | 400 Invalid remark type |
| Qty type | Must be `"SERV"` or `"UNSV"` | 400 Invalid qty type |
| Qty | Must be `> 0` | 400 Qty must be greater than 0 |
| Item exists | Found by `ser_no` | 404 No item Found |
| **Remark exists** | Exact match `"{remark_type}:{qty}"` found in remarks string | 404 Remark not found |
| Consolidated exists | Found by `category_appendix` | 404 Consolidated Item Not Found |

> The remark existence check is critical - without it, repeated calls could infinitely inflate stock.

### Backend Updates (exact reverse of add)

**Consolidated record:**
- `prev_year_value += rate * qty`
- If UNSV: `unsv_value += rate * qty`
- If SERV: `serv_value += rate * qty` and `dep_value += (dep_value / 100) * rate * qty`

**Item record:**
- If UNSV: `qty_unsv += qty`
- If SERV: `qty_serv += qty`
- Both cases: `qty += qty`, `qty_ledger += qty`, `qty_ground += qty`

**Remarks string:**
- Removes the first occurrence of `"{remark_type}:{qty}"` from the space-separated string
- e.g. `"Destroy:2 Auction:3"` -> remove `"Auction:3"` -> `"Destroy:2"`

---

## Display Logic

### Detail Pages (Non_Expendable_item_SF / GF)

The remarks string is parsed and rendered as **colored badges with x (delete) buttons**:

- **Auction** -> Blue badge (`--primary-color-`)
- **Destroy** -> Red badge (`--error-accent-color-`)
- **Used** -> Green badge (`--success-accent-color-`)

If no remarks exist, displays "No Remarks" in grey.

### List Pages (Non_Expendable_Items_SF / GF)

Same colored badges in the Remarks table column, but **read-only** (no x buttons).

### Expendable / Consolidated Pages

Remarks are plain free-form text (not structured), displayed as-is in inputs or table cells.

---

## Key Files

| File | Role |
|------|------|
| `backend/app/routers/non_expendable.py` | `add_remarks` and `remove_remarks` endpoints, consolidated helper functions |
| `backend/app/models.py` | `NonExpendableItems.remarks` column (String, nullable) |
| `backend/app/schemas.py` | `NonExpendableRemarks` schema (`qty: int`, `qty_type: str`) |
| `frontend/src/components/Status_dialog.jsx` | Dialog for adding remarks (collects qty + SERV/UNSV) |
| `frontend/src/pages/Non_Expendable_item_SF.jsx` | SF detail page (add/remove remarks, badge display) |
| `frontend/src/pages/Non_Expendable_item_GF.jsx` | GF detail page (add/remove remarks, badge display) |
| `frontend/src/pages/Non_Expendable_Items_SF.jsx` | SF list page (read-only badge display) |
| `frontend/src/pages/Non_Expendable_Items_GF.jsx` | GF list page (read-only badge display) |
| `frontend/src/App.css` | Styles for `.remark_badge`, `.remark_delete_btn`, `.remark_delete_confirm` |
