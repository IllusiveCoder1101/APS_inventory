from datetime import datetime, timedelta
from app.database import SessionLocal
from sqlalchemy.orm import Session
from io import BytesIO
import polars as pl
from app.email_utils import send_html_email
from app.models import ExpendableItems, ExpendableItemsIssue, ConsolidatedItems, NonExpendableItems


# --- Monthly email worker --- #
async def send_monthly_email():
    print(f"[{datetime.utcnow()}] Generating monthly email with Polars Excel attachments...")

    db = SessionLocal()
    try:
        expendable_items = db.query(ExpendableItems).all()
        consolidated_items = db.query(ConsolidatedItems).all()

        excel1 = BytesIO()
        with pl.ExcelWriter(excel1) as writer:
            for items in expendable_items:
                item = items.to_dict()
                expendable_issue = db.query(ExpendableItemsIssue).filter(ExpendableItemsIssue.category_id == item["ser_no"]).all()
                issue_list = []

                df2 = pl.DataFrame({
                    "Ser No": [item["ser_no"]],
                    "Item Name": [item["items"]],
                    "Unit": [item["unit"]],
                    "Quantity Prev Month": [item["qty_prev_month"]],
                    "Purchase Current Month": [item["purchase_curr_month"]],
                    "Utilized Current Month": [item["utilized_curr_month"]],
                    "Final Balance": [(item["qty_prev_month"] + item["purchase_curr_month"] - item["utilized_curr_month"])],
                    "Remarks": [item["remarks"]]
                })

                for issue in expendable_issue:
                    issue_dict = issue.to_dict()
                    issue_list.append({
                        "Ser No": issue_dict["ser_no"],
                        "Date": issue_dict["date"],
                        "RV/IV": issue_dict["rv_iv"],
                        "Whom ID Issue": issue_dict["whom_id_issue"],
                        "Qty Received": issue_dict["qty_received"],
                        "Qty Issued": issue_dict["qty_issued"],
                    })

                sheet_name = str(item["items"])[:31]

                df2.write_excel(
                    writer,
                    sheet_name=f"{sheet_name} Report",
                    position="A1",
                    table_name="Item Summary"
                )

                # Calculate next position
                padding = 3
                rows_used = df2.height + 1
                next_row_number = rows_used + padding + 1
                next_position = f"A{next_row_number}"

                if issue_list:
                    df3 = pl.DataFrame(issue_list)

                    df3.write_excel(
                        writer,
                        sheet_name=f"{sheet_name} Report",
                        position=next_position,
                        table_name="Item Issue"
                    )
        excel1.seek(0)


        # --- Generate second Excel ---

        excel2 = BytesIO()
        with pl.ExcelWriter(excel2) as writer:
            for items in consolidated_items:
                item = items.to_dict()
                non_expendable = db.query(NonExpendableItems).filter(NonExpendableItems.category_appendix == item["appendix"]).all()
                non_expendable_list = []

                df2 = pl.DataFrame({
                    "Property Head": [item["property_head"]],
                    "Appendix": [item["appendix"]],
                    "Fund Details": [item["fund_details"]],
                    "Last Year Value": [item["prev_year_value"]],
                    "Last Year Purchases": [item["prev_year_purchases"]],
                    "UNSV Value": [item["unsv_value"]],
                    "SERV Value": [item["serv_value"]],
                    "Deprecated Value": [item["dep_value"]],
                    "Present Value": [((item["prev_year_value"] or 0) + (item["prev_year_purchases"] or 0) - (item["unsv_value"] or 0) - (item["dep_value"] or 0))],
                })

                for non_expendable_item in non_expendable:
                    ne = non_expendable_item.to_dict()
                    non_expendable_list.append({
                        "Ser No": ne["ser_no"],
                        "Lp No": ne["lp_no"],
                        "Nomenclature": ne["nomenclature"],
                        "A/U": ne["a_u"],
                        "Vintage": ne["vintage"],
                        "Qty": ne["qty"],
                        "Rate": ne["rate"],
                        "Qty Ledger": ne["qty_ledger"],
                        "Qty Ground": ne["qty_ground"],
                        "Last Year Bid Value": ne['rate'] * ne['qty'],
                        "Qty SERV": ne["qty_serv"],
                        "SERV Value": ne['rate'] * ne['qty_serv'],
                        "Qty UNSV": ne["qty_unsv"],
                        "UNSV Value": ne['rate'] * ne['qty_unsv'],
                        "Deprecated Value": ne["dep_value"],
                        "Deprecated Price": (100 - ne["dep_value"]) / 100 * ne['rate'] * ne['qty_serv'],
                    })

                sheet_name = str(item["property_head"])[:31]

                df2.write_excel(
                    writer,
                    sheet_name=f"{sheet_name} Report",
                    position="A1",
                    table_name="Item Summary"
                )

                # Calculate next position
                padding = 3
                rows_used = df2.height + 1
                next_row_number = rows_used + padding + 1
                next_position = f"A{next_row_number}"

                if non_expendable_list:
                    df3 = pl.DataFrame(non_expendable_list)

                    df3.write_excel(
                        writer,
                        sheet_name=f"{sheet_name} Report",
                        position=next_position,
                        table_name="Non Expendable Summary"
                    )

        excel2.seek(0)

        context = {
            "title": "Monthly Update",
            "recipient_name": "John Doe",
            "message_body": "Here is your monthly report with the latest updates. Please review both attachments.",
            "attachments": ["Report1.xlsx", "Report2.xlsx"],
            "link": "https://internaltool.example.com/reports"
        }

        attachments = [
            ("Report1.xlsx", excel1),
            ("Report2.xlsx", excel2)
        ]

        await send_html_email(
            to_email="user@example.com",
            subject="Monthly Update - Your Reports",
            context=context,
            attachments=attachments
        )
    except Exception as e:
        print(f"[{datetime.utcnow()}] Monthly email failed: {e}")
    finally:
        db.close()

# --- Monthly expendable rollover worker --- #
async def rollover_expendable_monthly():
    print(f"[{datetime.utcnow()}] Running monthly expendable rollover...")
    db = SessionLocal()
    try:
        expendable_items = db.query(ExpendableItems).all()

        for item in expendable_items:
            # Final balance becomes next month's starting balance
            final_balance = item.qty_prev_month + item.purchase_curr_month - item.utilized_curr_month
            item.qty_prev_month = final_balance
            item.purchase_curr_month = 0
            item.utilized_curr_month = 0

        # Clear all expendable issues (transactions are now rolled into qty_prev_month)
        db.query(ExpendableItemsIssue).delete(synchronize_session=False)

        db.commit()
        print(f"[{datetime.utcnow()}] Monthly expendable rollover completed. {len(expendable_items)} items rolled over.")
    except Exception as e:
        db.rollback()
        print(f"[{datetime.utcnow()}] Monthly expendable rollover failed: {e}")
    finally:
        db.close()


# --- Yearly non-expendable & consolidated rollover worker --- #
def rollover_yearly():
    print(f"[{datetime.utcnow()}] Running yearly rollover...")
    db = SessionLocal()
    try:
        # Clear remarks on non-expendable items (auction/destroy/used-up are year-end settled)
        non_expendable_items = db.query(NonExpendableItems).filter(NonExpendableItems.remarks != None).all()
        for item in non_expendable_items:
            item.remarks = None

        # Recalculate consolidated values from non-expendable items
        consolidated_items = db.query(ConsolidatedItems).all()

        for consolidated in consolidated_items:
            ne_items = db.query(NonExpendableItems).filter(
                NonExpendableItems.category_appendix == consolidated.appendix
            ).all()

            total_value = 0
            total_serv = 0
            total_unsv = 0
            total_dep = 0

            for ne in ne_items:
                total_value += ne.rate * ne.qty
                total_serv += ne.rate * ne.qty_serv
                total_unsv += ne.rate * ne.qty_unsv
                total_dep += (ne.dep_value / 100) * ne.rate * ne.qty_serv

            # Current total becomes prev_year_value, purchases reset for new year
            consolidated.prev_year_value = total_value
            consolidated.prev_year_purchases = 0
            consolidated.serv_value = total_serv
            consolidated.unsv_value = total_unsv
            consolidated.dep_value = total_dep

        db.commit()
        print(f"[{datetime.utcnow()}] Yearly rollover completed. {len(consolidated_items)} consolidated items recalculated.")
    except Exception as e:
        db.rollback()
        print(f"[{datetime.utcnow()}] Yearly rollover failed: {e}")
    finally:
        db.close()
