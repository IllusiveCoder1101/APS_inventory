from fastapi import APIRouter, Depends, HTTPException,  UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import select, distinct
from app.database import SessionLocal
from app.models import User, ExpendableItems,ExpendableItemsIssue
from app.schemas import DeleteItems,ExpendableItem,ExpendableItemsList, DefaultResponse
from app.core.security import ( get_current_user )
import polars as pl
from fastapi import Query
from typing import Optional

router = APIRouter(prefix="/expendable", tags=["expendable"])

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

@router.get("/get-expendable-items")
async def get_expendable_items(current_user=Depends(get_current_user),params=Depends(item_query_params),db: Session = Depends(get_db)) :
    query = db.query(ExpendableItems)

    if not query:
        raise HTTPException(status_code=404, detail="No Items Found")

    if params["search"]:
        query = query.filter(
            ExpendableItems.items.ilike(f"%{params['search']}%")
        )

    total = query.count()

    items = (
        query
        .order_by(ExpendableItems.ser_no)
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

@router.get("/download-expendable-items")
async def download_expendable_item(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(ExpendableItems)

    if not query:
        raise HTTPException(status_code=404, detail="No Items Found")

    total = query.count()

    items = (
        query
        .order_by(ExpendableItems.ser_no)
        .all()
    )
    final_response=[]
    
    for item in items:
        d=item.to_dict()
        d["final_balance"]=d['qty_prev_month']+d['purchase_curr_month']-d['utilized_curr_month']
        query1=db.query(ExpendableItemsIssue).filter(ExpendableItemsIssue.category_id==d.ser_no).all()
        final_response.append({"item_details":d,"inner_items":[item.to_dict() for item in query1]})

    return {
        "total": total,
        "items": final_response,
    }

@router.post("/create-expendable-items")
async def create_expendable_items(file: UploadFile = File(...),current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    
    
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Invalid file format. Upload an Excel file.")

    contents = await file.read()
    df = pl.read_excel(contents)

    items_created = []

    for row in df.iter_rows():
        item_data = list(row)

        if not len(item_data) == 4:
            raise HTTPException(status_code=403, detail="Invalid Data Provided.")

        if not item_data[0] or not item_data[1]:
            raise HTTPException(status_code=401, detail="No Data Provided.")
            
        if not item_data[3]:
            item_data[3]="NA"

        if not item_data[2]:
            item_data[2] = 0
        item = db.query(ExpendableItems).filter(ExpendableItems.items==item_data[0]).first()
    
        if item:
            raise HTTPException(status_code=400, detail="Item Already Exists !")
        
        item = ExpendableItems(items=item_data[0],
                               qty_prev_month=item_data[2],
                               unit=item_data[1],
                               purchase_curr_month=0,
                               utilized_curr_month=0,
                               remarks=item_data[3])
        
        
        db.add(item)
        db.commit()
        db.refresh(item)

    return {
        "msg":"Items Added",
    }

@router.delete("/delete-expendable-items")
async def delete_expendable_items(payload:DeleteItems, current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    item_ids=payload.item_ids
    
    deleted_items=db.query(ExpendableItems).filter(ExpendableItems.ser_no.in_(item_ids)).delete(synchronize_session=False)

    db.commit()

    return {
        "msg": "Items Deleted Successfully"
    }
        
@router.get("/get-expendable-item/{item_id}")
async def get_expendable_item(item_id: str ,current_user=Depends(get_current_user),db: Session = Depends(get_db)):
    item = db.query(ExpendableItems).filter(ExpendableItems.ser_no==item_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="No item Found")

    final_response=item.to_dict()

    return {"items":final_response,"final_balance":final_response['qty_prev_month']+final_response['purchase_curr_month']-final_response['utilized_curr_month']}


@router.put("/edit-expendable-item/{item_id}")
async def edit_expendable_item(new_item: ExpendableItem,item_id: str,current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    
    
    item = db.query(ExpendableItems).filter(ExpendableItems.ser_no==item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="No item Found")
    
    if new_item.items:
        item_check=db.query(ExpendableItems).filter(ExpendableItems.items==new_item.items).first()
        
        if item_check:
            raise HTTPException(status_code=402, detail="Item already Exists")
        item.items=new_item.items

    if new_item.qty_prev_month:

        if new_item.qty_prev_month + item.purchase_curr_month - item.utilized_curr_month >= 0:
            item.qty_prev_month = new_item.qty_prev_month
        else:
            raise HTTPException(status_code=403, detail="Ledger Balance Update Not Possible!")

    item.unit = new_item.unit | item.unit
    item.remarks=new_item.remarks | item.remarks

    db.commit()

    return {
        "msg": "Item Updated Successfully"
    }

@router.delete("/delete-expendable-item/{item_id}")
async def delete_expendable_item(item_id: int,current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    
    deleted_item=db.query(ExpendableItems).filter(ExpendableItems.ser_no==item_id).delete(synchronize_session=False)

    db.commit()

    return {
        "msg": "Item Deleted Successfully"
    }

