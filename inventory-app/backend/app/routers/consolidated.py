from fastapi import APIRouter, Depends, HTTPException,  UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import select, distinct
from app.database import SessionLocal
from app.models import ConsolidatedItems,NonExpendableItems
from app.schemas import ConsolidatedAppendixList,ConsolidatedItemEdit,DefaultResponse
from app.core.security import ( get_current_user )
import polars as pl
from fastapi import Query
from typing import Optional,List

router = APIRouter(prefix="/consolidated", tags=["consolidated"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def item_query_params(
    search: Optional[str] = Query(None),
    fund_details_filter: List[str] | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    return {
        "search": search,
        "fund_details_filter": fund_details_filter,
        "skip": skip,
        "limit": limit,
    }

@router.get("/get-consolidated-items")
async def get_consolidated_items(current_user=Depends(get_current_user),params=Depends(item_query_params), db: Session = Depends(get_db)):
    query = db.query(ConsolidatedItems)

    category_col = select(distinct(ConsolidatedItems.fund_details)).order_by(ConsolidatedItems.fund_details)
    filter_values = db.execute(category_col).scalars().all()

    if params["search"]:
        search_term = f"%{params['search']}%"
        query = query.filter(
            ConsolidatedItems.property_head.ilike(search_term) |
            ConsolidatedItems.appendix.ilike(search_term) |
            ConsolidatedItems.fund_details.ilike(search_term)
        )

    if params["fund_details_filter"]:
        query = query.filter(ConsolidatedItems.fund_details.in_(params["fund_details_filter"]))

    
    total = query.count()

    
    items = (
        query
        .order_by(ConsolidatedItems.id)
        .offset(params["skip"])
        .limit(params["limit"])
        .all()
    )
    

    return {
        "total": total,
        "skip": params["skip"],
        "limit": params["limit"],
        "filter_values":filter_values,
        "items": [item.to_dict() for item in items],
    }

@router.get("/download-consolidated-items")
async def download_consolidated_item(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(ConsolidatedItems)

    total = query.count()

    items = query.all()
    
    final_items = []
    for item in items:
        
        consolidated=item.to_dict()
        consolidated['present_value']=(consolidated['prev_year_value'] or 0)+(consolidated['prev_year_purchases'] or 0)-(consolidated['unsv_value'] or 0)-(consolidated['dep_value'] or 0)

        final_items.append(consolidated)


    return {
        "total": total,
        "items": final_items,
    }

@router.post("/create-consolidated-items")
async def create_consolidated_items(file: UploadFile = File(...),current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    
    
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Invalid file format. Upload an Excel file.")

    contents = await file.read()
    df = pl.read_excel(contents)

    for row in df.iter_rows():
        item_data = list(row)
        
        if len(item_data) != 3:
            raise HTTPException(status_code=400, detail="Invalid Data")


        consolidated_item_check=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==item_data[1]).first()
        property_head_check=db.query(ConsolidatedItems).filter(ConsolidatedItems.property_head==item_data[0]).first()

        if consolidated_item_check:
            raise HTTPException(status_code=409, detail="Consolidated Item Category Already Exists")

        if property_head_check:
            raise HTTPException(status_code=409, detail="Property Head Already Exists")

        item = ConsolidatedItems(
            property_head=item_data[0],
            appendix=item_data[1],
            fund_details=item_data[2],
            prev_year_value=0,
            prev_year_purchases=0,
            unsv_value=0,
            serv_value=0,
            dep_value=0
        )
        db.add(item)

    db.commit()

    return {
        "msg":"Items Added",
    }

@router.delete("/delete-consolidated-items")
async def delete_consolidated_items(payload:ConsolidatedAppendixList, current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    appendix_list=payload.appendix_list

    deleted_items=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix.in_(appendix_list)).delete(synchronize_session=False)

    db.commit()

    return {
        "msg": "Items Deleted Successfully"
    }
        
@router.get("/get-consolidated-item/{item_id}")
async def get_consolidated_item(item_id: str,current_user=Depends(get_current_user),db: Session = Depends(get_db)):
    item = db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==item_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="No item Found")

    final_response=item.to_dict()
    final_response['present_value']=(final_response['prev_year_value'] or 0)+(final_response['prev_year_purchases'] or 0)-(final_response['unsv_value'] or 0)-(final_response['dep_value'] or 0)
    return {
        "items":final_response
    }

@router.put("/edit-consolidated-item/{item_id}")
async def edit_consolidated_item(new_item: ConsolidatedItemEdit,item_id: str,current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    
    
    item = db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="No item Found")
    
    if new_item.property_head:
        item_check=db.query(ConsolidatedItems).filter(ConsolidatedItems.property_head==new_item.property_head, ConsolidatedItems.id!=item.id).first()

        if item_check:
            raise HTTPException(status_code=409, detail="Item already Exists")
        item.property_head=new_item.property_head


    if new_item.appendix:
        item_check=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==new_item.appendix, ConsolidatedItems.id!=item.id).first()
        update_non_expendable=db.query(NonExpendableItems).filter(NonExpendableItems.category_appendix==item.appendix).all()

        if item_check:
            raise HTTPException(status_code=409, detail="Consolidated Item Appendix already Exists")

        for ne_item in update_non_expendable:
            ne_item.category_appendix=new_item.appendix

        item.appendix=new_item.appendix

    item.fund_details=new_item.fund_details or item.fund_details

    db.commit()

    return {
        "msg": "Item Updated Successfully"
    }

@router.delete("/delete-consolidated-item/{item_id}")
async def delete_consolidated_item(item_id: str,current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:

    deleted_item=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==item_id).delete(synchronize_session=False)

    if not deleted_item:
        raise HTTPException(status_code=404, detail="No item Found")

    db.commit()

    return {
        "msg": "Item Deleted Successfully"
    }

