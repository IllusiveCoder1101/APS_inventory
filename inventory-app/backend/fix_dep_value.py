"""
One-time script to recalculate ALL consolidated values from non-expendable items.

The seed data set consolidated prev_year_value, serv_value, unsv_value, and dep_value
independently from the non-expendable items. This script recomputes them all from scratch
using the actual non-expendable item data:

  prev_year_value = sum(rate * qty)
  serv_value      = sum(rate * qty_serv)
  unsv_value      = sum(rate * qty_unsv)
  dep_value       = sum((dep_value/100) * rate * qty_serv)
"""

from app.database import SessionLocal
from app.models import NonExpendableItems, ConsolidatedItems


def main():
    db = SessionLocal()

    consolidated_items = db.query(ConsolidatedItems).all()

    for ci in consolidated_items:
        ne_items = db.query(NonExpendableItems).filter(
            NonExpendableItems.category_appendix == ci.appendix
        ).all()

        total_prev = sum(float(ne.rate) * ne.qty for ne in ne_items)
        total_serv = sum(float(ne.rate) * ne.qty_serv for ne in ne_items)
        total_unsv = sum(float(ne.rate) * ne.qty_unsv for ne in ne_items)
        total_dep = sum(
            (float(ne.dep_value) / 100) * float(ne.rate) * ne.qty_serv
            for ne in ne_items
        )

        old = {
            "prev": float(ci.prev_year_value or 0),
            "serv": float(ci.serv_value or 0),
            "unsv": float(ci.unsv_value or 0),
            "dep": float(ci.dep_value or 0),
        }

        ci.prev_year_value = round(total_prev, 2)
        ci.serv_value = round(total_serv, 2)
        ci.unsv_value = round(total_unsv, 2)
        ci.dep_value = round(total_dep, 2)

        present = total_prev + float(ci.prev_year_purchases or 0) + total_serv - total_dep
        print(
            f"  {ci.property_head[:35]:35s} | "
            f"prev: {old['prev']:>12,.0f} -> {total_prev:>12,.0f} | "
            f"serv: {old['serv']:>12,.0f} -> {total_serv:>12,.0f} | "
            f"unsv: {old['unsv']:>10,.0f} -> {total_unsv:>10,.0f} | "
            f"dep: {old['dep']:>12,.0f} -> {total_dep:>12,.0f} | "
            f"present: {present:>12,.0f}"
        )

    db.commit()
    print(f"\nRecalculated all values for {len(consolidated_items)} consolidated items.")
    db.close()
    print("Done.")


if __name__ == "__main__":
    main()
