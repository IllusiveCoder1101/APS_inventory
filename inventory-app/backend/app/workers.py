from datetime import datetime, timedelta
from app.database import SessionLocal
from sqlalchemy.orm import Session
from io import BytesIO
import polars as pl
from fastapi import Depends
from email_utils import send_html_email
from db import AsyncSessionLocal
from models import ExpendableItems, ExpendableItemsIssue, ConsolidatedItems, NonExpendableItems


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Monthly email worker --- #
async def send_monthly_email(db: Session = Depends(get_db)):
    print(f"[{datetime.utcnow()}] Generating monthly email with Polars Excel attachments...")

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
                "purchase_current_month": [item["purchase_curr_month"]],
                "Utilized Current Month": [item["utilized_curr_month"]],
                "Final Balance": [(item["qty_prev_month"] + item["purchase_curr_month"] - item["utilized_curr_month"])],
                "Remarks": [item["remarks"]]
            })

            for issue in expendable_issue:
                issue_list.append({
                    "Ser No": issue["ser_no"],
                    "date": issue["date"],
                    "RV/IV": issue["rv_iv"],
                    "Whom ID Issue": issue["whom_id_issue"],
                    "Qty Received": issue["qty_received"],
                    "Qty Issued": issue["qty_issued"],
                })

        

            df2.write_excel(
                writer,
                sheet_name=f"{item["items"]} Report",
                position="A1",
                table_name="Item Summary"
            )

            # Calculate next position
            padding = 3  # blank rows between tables
            rows_used = df2.height + 1  # +1 for header

            next_row_number = rows_used + padding + 1
            next_position = f"A{next_row_number}"


            df3 = pl.DataFrame(issue_list)

            df3.write_excel(
                writer,
                sheet_name=f"{item["items"]} Report",
                position=next_position,
                table_name="Item Issue"
            )
    excel1.seek(0)


    # --- Generate second Excel ---
    
    excel2 = BytesIO()
    with pl.ExcelWriter(excel2) as writer:
        for items in consolidated_items:
            item = items.to_dict()
            non_expendable = db.query(NonExpendableItems).filter(NonExpendableItems.category_id == item["appendix"]).all()
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
                "Present Value": [(item["prev_year_value"] + item["prev_year_purchases"] - item["dep_value"])],
            })

            for non_expendable_item in non_expendable:
                non_expendable_list.append({
                    "Ser No": non_expendable_item["ser_no"],
                    "Lp No": non_expendable_item["lp_no"],
                    "Nomenclature": non_expendable_item["nomenclature"],
                    "A/U": non_expendable_item["a_u"],
                    "Vintage": non_expendable_item["vintage"],
                    "Qty": non_expendable_item["qty"],
                    "Rate": non_expendable_item["rate"],
                    "Qty Ledger": non_expendable_item["qty_ledger"],
                    "Qty Ground": non_expendable_item["qty_ground"],
                    "Last Year Bid Value": non_expendable_item['rate']*non_expendable_item['qty'],
                    "Qty SERV" : non_expendable_item["qty_serv"],
                    "SERV Value" : non_expendable_item['rate']*non_expendable_item['qty_serv'],
                    "Qty UNSV": non_expendable_item["qty_unsv"],
                    "UNSV Value" : non_expendable_item['rate']*non_expendable_item['qty_unsv'],
                    "Deprecated Value": non_expendable_item["dep_value"],
                    "Deprecated Price": (100-non_expendable_item["dep_value"])/100 * non_expendable_item['rate']*non_expendable_item['qty_serv'],
                })

        

            df2.write_excel(
                writer,
                sheet_name=f"{item["items"]} Report",
                position="A1",
                table_name="Item Summary"
            )

            # Calculate next position
            padding = 3  # blank rows between tables
            rows_used = df2.height + 1  # +1 for header

            next_row_number = rows_used + padding + 1
            next_position = f"A{next_row_number}"


            df3 = pl.DataFrame(issue_list)

            df3.write_excel(
                writer,
                sheet_name=f"{item["items"]} Report",
                position=next_position,
                table_name="Non Expendable Summary"
            )

    excel1.seek(0)

    

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

# --- Yearly database cleanup worker --- #
async def clean_database_yearly():
    print(f"[{datetime.utcnow()}] Running yearly database cleanup...")
    async with AsyncSessionLocal() as session:
        # Example: Delete user_activity older than 1 year
        cutoff_date = datetime.utcnow() - timedelta(days=365)
        await session.execute(
            "DELETE FROM user_activity WHERE created_at < :cutoff_date",
            {"cutoff_date": cutoff_date}
        )
        await session.commit()
    print(f"[{datetime.utcnow()}] Yearly database cleanup completed.")