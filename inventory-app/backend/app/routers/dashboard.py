from fastapi import APIRouter, Depends, HTTPException,  UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import SessionLocal
from app.models import User,ConsolidatedItems,NonExpendableItems, ExpendableItems
from app.schemas import DeleteItems,ExpendableIssueCreate,ExpendableIssueEdit,ExpendableIssueGet, DefaultResponse
from app.core.security import ( get_current_user )
from fastapi import Query
from typing import Optional

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/get-dashboard-items")
async def get_expendable_issue(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(ExpendableItems)
    query1 = db.query(ConsolidatedItems)
    query2 = db.query(NonExpendableItems)

    total = query.count() + query1.count() + query2.count()

    total_asset_value = db.query(
        func.coalesce(func.sum(ConsolidatedItems.prev_year_value), 0)
    ).scalar()

    expendable_prev = db.query(func.coalesce(func.sum(ExpendableItems.qty_prev_month), 0)).scalar()
    expendable_purchased = db.query(func.coalesce(func.sum(ExpendableItems.purchase_curr_month), 0)).scalar()
    expendable_utilized = db.query(func.coalesce(func.sum(ExpendableItems.utilized_curr_month), 0)).scalar()
    current_expendable_stock = int(expendable_prev) + int(expendable_purchased) - int(expendable_utilized)

    ne_gf_count = db.query(NonExpendableItems).filter(NonExpendableItems.nonexpendable_type == "gov").count()
    ne_sf_count = db.query(NonExpendableItems).filter(NonExpendableItems.nonexpendable_type == "sch").count()

    consolidated_by_property_head = db.query(
        ConsolidatedItems.property_head,
        ConsolidatedItems.prev_year_value,
        ConsolidatedItems.serv_value,
        ConsolidatedItems.unsv_value,
        ConsolidatedItems.dep_value,
    ).order_by(ConsolidatedItems.prev_year_value.desc()).limit(10).all()

    expendable_stock_flow = {
        "qty_prev_month": expendable_prev,
        "purchase_curr_month": expendable_purchased,
        "utilized_curr_month": expendable_utilized,
    }

    items_by_fund = db.query(
        ConsolidatedItems.fund_details,
        func.count(ConsolidatedItems.id),
    ).group_by(ConsolidatedItems.fund_details).all()

    serv_vs_unsv = {
        "qty_serv": db.query(func.coalesce(func.sum(NonExpendableItems.qty_serv), 0)).scalar(),
        "qty_unsv": db.query(func.coalesce(func.sum(NonExpendableItems.qty_unsv), 0)).scalar(),
    }

    top_value_assets = db.query(
        NonExpendableItems.nomenclature,
        (NonExpendableItems.rate * NonExpendableItems.qty).label("total_value"),
    ).order_by((NonExpendableItems.rate * NonExpendableItems.qty).desc()).limit(10).all()

    expendableItems = (
        query.limit(5).all()
    )
    consolidatedItems= (
        query1.limit(5).all()
    )
    nonExpendableGFItems=(
        query2.filter(NonExpendableItems.nonexpendable_type == "gov").limit(5).all()
    )
    nonExpendableSFItems=(
        query2.filter(NonExpendableItems.nonexpendable_type == "sch").limit(5).all()
    )

    return {
        "total": total,
        "stats": {
            "total_asset_value": float(total_asset_value),
            "current_expendable_stock": current_expendable_stock,
            "ne_gf_count": ne_gf_count,
            "ne_sf_count": ne_sf_count,
        },
        "chart_data": {
            "consolidated_by_property_head": [
                {
                    "property_head": row.property_head,
                    "prev_year_value": float(row.prev_year_value or 0),
                    "serv_value": float(row.serv_value or 0),
                    "unsv_value": float(row.unsv_value or 0),
                    "dep_value": float(row.dep_value or 0),
                }
                for row in consolidated_by_property_head
            ],
            "expendable_stock_flow": [
                {"name": "Previous Stock", "value": int(expendable_stock_flow["qty_prev_month"])},
                {"name": "Purchased", "value": int(expendable_stock_flow["purchase_curr_month"])},
                {"name": "Utilized", "value": int(expendable_stock_flow["utilized_curr_month"])},
            ],
            "items_by_fund": [
                {"name": row[0], "value": row[1]}
                for row in items_by_fund
            ],
            "serv_vs_unsv": [
                {"name": "Serviceable", "value": int(serv_vs_unsv["qty_serv"])},
                {"name": "Unserviceable", "value": int(serv_vs_unsv["qty_unsv"])},
            ],
            "top_value_assets": [
                {"name": row.nomenclature, "value": float(row.total_value or 0)}
                for row in top_value_assets
            ],
        },
        "expendable_items": [item.to_dict() for item in expendableItems],
        "non_expendable_gf_items": [item.to_dict() for item in nonExpendableGFItems],
        "non_expendable_sf_items": [item.to_dict() for item in nonExpendableSFItems],
        "consolidated_items": [item.to_dict() for item in consolidatedItems],
    }

    