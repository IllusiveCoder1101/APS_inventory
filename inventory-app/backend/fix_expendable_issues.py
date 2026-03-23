"""
One-time script to fix expendable issue records.

Problem: seed data created rows with BOTH rv_iv and whom_id_issue filled,
and both qty_received and qty_issued non-zero in the same row.
They should be separate: one row per receive, one row per issue.

This script:
1. Splits mixed rows into separate receive/issue rows
2. Cleans up single-purpose rows (set unused fields to "NA"/0)
3. Recalculates parent expendable item purchase_curr_month and utilized_curr_month
"""

from app.database import SessionLocal
from app.models import ExpendableItemsIssue, ExpendableItems


def main():
    db = SessionLocal()

    issues = db.query(ExpendableItemsIssue).all()
    print(f"Found {len(issues)} issue records.\n")

    split_count = 0
    cleaned_recv = 0
    cleaned_issue = 0

    for issue in issues:
        has_recv = issue.qty_received and issue.qty_received > 0
        has_issued = issue.qty_issued and issue.qty_issued > 0

        if has_recv and has_issued:
            # Split: keep current row as receive, create new row for issue
            new_issue = ExpendableItemsIssue(
                date=issue.date,
                rv_iv="NA",
                category_id=issue.category_id,
                whom_id_issue=issue.whom_id_issue,
                qty_received=0,
                qty_issued=issue.qty_issued,
            )
            db.add(new_issue)

            # Current row becomes receive-only
            issue.whom_id_issue = "NA"
            issue.qty_issued = 0

            split_count += 1
            print(f"  Split ser={issue.ser_no}: recv={issue.qty_received} kept, issued={new_issue.qty_issued} -> new row")

        elif has_recv:
            # Receive only — clear issue fields
            if issue.whom_id_issue != "NA":
                issue.whom_id_issue = "NA"
                issue.qty_issued = 0
                cleaned_recv += 1

        elif has_issued:
            # Issue only — clear receive fields
            if issue.rv_iv != "NA":
                old_rv = issue.rv_iv
                issue.rv_iv = "NA"
                issue.qty_received = 0
                cleaned_issue += 1

    db.commit()
    print(f"\nSplit {split_count} mixed rows into separate records.")
    print(f"Cleaned {cleaned_recv} receive-only rows (removed whom_id_issue).")
    print(f"Cleaned {cleaned_issue} issue-only rows (removed rv_iv).")

    # --- Recalculate parent expendable items ---
    print("\nRecalculating parent expendable item totals...")

    exp_items = db.query(ExpendableItems).all()
    for exp in exp_items:
        child_issues = db.query(ExpendableItemsIssue).filter(
            ExpendableItemsIssue.category_id == exp.ser_no
        ).all()

        total_purchased = sum(i.qty_received or 0 for i in child_issues)
        total_utilized = sum(i.qty_issued or 0 for i in child_issues)

        old_p = exp.purchase_curr_month
        old_u = exp.utilized_curr_month
        exp.purchase_curr_month = total_purchased
        exp.utilized_curr_month = total_utilized

        if old_p != total_purchased or old_u != total_utilized:
            print(f"  {exp.items[:35]:35s} | purchase: {old_p:>4} -> {total_purchased:>4} | utilized: {old_u:>4} -> {total_utilized:>4}")

    db.commit()

    new_total = db.query(ExpendableItemsIssue).count()
    print(f"\nDone. Total issue records: {len(issues)} -> {new_total}")
    db.close()


if __name__ == "__main__":
    main()
