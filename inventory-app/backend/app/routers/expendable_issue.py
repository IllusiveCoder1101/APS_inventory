from fastapi import APIRouter, Depends, HTTPException,  UploadFile, File
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, ExpendableItemsIssue, ExpendableItems
from app.schemas import DeleteItems,ExpendableIssueCreate,ExpendableIssueEdit,ExpendableIssueGet, DefaultResponse
from app.core.security import ( get_current_user )
from fastapi import Query
from typing import Optional

router = APIRouter(prefix="/expendable-issue", tags=["expendable-issue"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def item_query_params(
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    return {
        "search": search,
       
        "skip": skip,
        "limit": limit,
    }

@router.get("/get-expendable-issue/{category_id}")
async def get_expendable_issue(category_id: int,params=Depends(item_query_params),current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(ExpendableItemsIssue).filter(ExpendableItemsIssue.category_id==category_id)

    if params["search"]:
        query = query.filter(
            ExpendableItemsIssue.whom_id_issue.ilike(f"%{params['search']}%")
        )

    total = query.count()
    
    items = (
        query
        .order_by(ExpendableItemsIssue.ser_no)
        .offset(params["skip"]*params["limit"])
        .limit(params["limit"])
        .all()
    )
    

    return {
        "total": total,
        "skip": params["skip"],
        "limit": params["limit"],
        "items": [item.to_dict() for item in items],
    }

    
@router.post("/create-expendable-issue/{category_id}")
async def create_expendable_issue(category_id: int, payload: ExpendableIssueCreate,current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:

    exp_item = db.query(ExpendableItems).filter(ExpendableItems.ser_no==category_id).first()

    if not exp_item:
        raise HTTPException(status_code=404, detail="No Category Found")

    if payload.rv_iv and payload.whom_id_issue:
        raise HTTPException(status_code=400, detail="Invalid Data Request - cannot set both RV/IV and Whom ID Issue")

    if not payload.rv_iv and not payload.whom_id_issue:
        raise HTTPException(status_code=400, detail="Invalid Data Request - must set either RV/IV or Whom ID Issue")

    if payload.qty_received > 0 or payload.qty_issued > 0:

        if payload.whom_id_issue:
            balance = exp_item.qty_prev_month + exp_item.purchase_curr_month - exp_item.utilized_curr_month
            if balance - payload.qty_issued < 0:
                raise HTTPException(status_code=400, detail=f"Insufficient stock. Available balance: {balance}, requested: {payload.qty_issued}")

        item = ExpendableItemsIssue(
            date=payload.date,
            rv_iv=payload.rv_iv or "NA",
            category_id=category_id,
            whom_id_issue=payload.whom_id_issue or "NA",
            qty_received=payload.qty_received if payload.rv_iv else 0,
            qty_issued=payload.qty_issued if payload.whom_id_issue else 0,
        )

        if payload.rv_iv:
            exp_item.purchase_curr_month += payload.qty_received
        else:
            exp_item.utilized_curr_month += payload.qty_issued
    else:
        raise HTTPException(status_code=400, detail="Invalid Data Request - quantity must be greater than 0")

    db.add(item)
    db.commit()
    db.refresh(item)

    return {
        "msg": "Issue Added"
    }

@router.put("/edit-expendable-issues/{item_id}")
async def edit_expendable_issues(item_id: int ,payload:ExpendableIssueEdit, current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:


    item=db.query(ExpendableItemsIssue).filter(ExpendableItemsIssue.ser_no==item_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="No Item Found")

    exp_item=db.query(ExpendableItems).filter(ExpendableItems.ser_no==item.category_id).first()

    if payload.qty_issued is None and payload.qty_received is None and not payload.rv_iv and not payload.whom_id_issue:
        raise HTTPException(status_code=400, detail="Invalid Details - no fields provided")

    if payload.qty_issued is not None and payload.qty_issued > 0:
        if item.qty_issued == 0:
            raise HTTPException(status_code=400, detail="Invalid Details - this issue has no issued quantity to edit")
        else:
            balance = exp_item.qty_prev_month + exp_item.purchase_curr_month - exp_item.utilized_curr_month
            if balance + item.qty_issued - payload.qty_issued >= 0:
                exp_item.utilized_curr_month = exp_item.utilized_curr_month - item.qty_issued + payload.qty_issued
                item.qty_issued = payload.qty_issued
            else:
                raise HTTPException(status_code=400, detail="Invalid Details - would result in negative balance")

    if payload.qty_received is not None and payload.qty_received > 0:
        if item.qty_received == 0:
            raise HTTPException(status_code=400, detail="Invalid Details - this issue has no received quantity to edit")
        else:
            balance = exp_item.qty_prev_month + exp_item.purchase_curr_month - exp_item.utilized_curr_month
            if balance - item.qty_received + payload.qty_received >= 0:
                exp_item.purchase_curr_month = exp_item.purchase_curr_month - item.qty_received + payload.qty_received
                item.qty_received = payload.qty_received
            else:
                raise HTTPException(status_code=400, detail="Invalid Details - would result in negative balance")

    if payload.rv_iv:
        if item.rv_iv != "NA":
            item.rv_iv = payload.rv_iv
        else:
            raise HTTPException(status_code=400, detail="Invalid Details - cannot edit RV/IV on an issuance record")

    if payload.whom_id_issue:
        if item.whom_id_issue != "NA":
            item.whom_id_issue = payload.whom_id_issue
        else:
            raise HTTPException(status_code=400, detail="Invalid Details - cannot edit Whom ID on a receipt record")
    
    
    db.commit()

    return {
        "msg" : "Item Edited Successfully"
    }



@router.delete("/delete-expendable-issues")
async def delete_expendable_issues(payload:DeleteItems, current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    
    item_ids=payload.item_ids

    for issue_id in item_ids:
        item_query=db.query(ExpendableItemsIssue).filter(ExpendableItemsIssue.ser_no==issue_id).first()

        if not item_query:
            raise HTTPException(status_code=404, detail="No Item Found")

        exp_item=db.query(ExpendableItems).filter(ExpendableItems.ser_no==item_query.category_id).first()

        if item_query.qty_received>0:

            if (exp_item.qty_prev_month +exp_item.purchase_curr_month-exp_item.utilized_curr_month)-item_query.qty_received>=0:
                exp_item.purchase_curr_month-=item_query.qty_received
            else:
                raise HTTPException(status_code=400, detail="Cannot delete issue: would result in negative balance")
        elif item_query.qty_issued>0:
            exp_item.utilized_curr_month-=item_query.qty_issued
        deleted_item=db.query(ExpendableItemsIssue).filter(ExpendableItemsIssue.ser_no==issue_id).delete(synchronize_session=False)

        db.commit()

    return {
        "msg": "Items Deleted Successfully"
    }
