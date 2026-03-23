"""
One-time script to fix expendable items with negative balances.
For each item with negative balance, remove issue records (newest first)
until balance >= 0, then recalculate utilized_curr_month.
"""

from app.database import SessionLocal
from app.models import ExpendableItems, ExpendableItemsIssue


def main():
    db = SessionLocal()

    items = db.query(ExpendableItems).all()
    fixed = 0

    for exp in items:
        balance = exp.qty_prev_month + exp.purchase_curr_month - exp.utilized_curr_month
        if balance >= 0:
            continue

        print(f"\n  {exp.items}: balance={balance} (prev={exp.qty_prev_month}, purch={exp.purchase_curr_month}, util={exp.utilized_curr_month})")

        # Get issue records ordered by newest first
        issue_records = db.query(ExpendableItemsIssue).filter(
            ExpendableItemsIssue.category_id == exp.ser_no,
            ExpendableItemsIssue.qty_issued > 0,
        ).order_by(ExpendableItemsIssue.ser_no.desc()).all()

        available = exp.qty_prev_month + exp.purchase_curr_month
        running_util = 0

        keep = []
        remove = []

        for rec in reversed(issue_records):  # oldest first
            if running_util + rec.qty_issued <= available:
                running_util += rec.qty_issued
                keep.append(rec)
            else:
                remove.append(rec)

        for rec in remove:
            print(f"    Removing issue ser={rec.ser_no}: whom={rec.whom_id_issue}, qty={rec.qty_issued}")
            db.delete(rec)

        exp.utilized_curr_month = running_util
        new_balance = exp.qty_prev_month + exp.purchase_curr_month - exp.utilized_curr_month
        print(f"    Fixed: util={exp.utilized_curr_month}, new balance={new_balance}, removed {len(remove)} records")
        fixed += 1

    db.commit()
    print(f"\nFixed {fixed} items with negative balances.")
    db.close()


if __name__ == "__main__":
    main()
