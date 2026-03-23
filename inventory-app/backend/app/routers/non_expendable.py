from fastapi import APIRouter, Depends, HTTPException,  UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import select, distinct
from app.database import SessionLocal
from app.models import User, NonExpendableItems, ConsolidatedItems
from app.schemas import DeleteItems,NonExpendableItem,NonExpendableRemarks,NonExpendableItemsList, DefaultResponse
from app.core.security import ( get_current_user )
import polars as pl
from fastapi import Query
from typing import Optional


router = APIRouter(prefix="/non-expendable", tags=["non-expendable"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def compute_consolidated(item_data, db):

    consolidated_item=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==item_data[2]).first()

    rate = item_data[6]
    qty = item_data[5]
    qty_serv = item_data[9]
    qty_unsv = item_data[7] - item_data[9]
    dep_value = item_data[10]

    consolidated_item.prev_year_value += rate * qty
    consolidated_item.unsv_value += rate * qty_unsv
    consolidated_item.serv_value += rate * qty_serv
    consolidated_item.dep_value += (dep_value / 100) * rate * qty_serv


def compute_consolidated_deletion(item_data, db):

    consolidated_item=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==item_data.category_appendix).first()

    consolidated_item.prev_year_value -= item_data.rate * item_data.qty
    consolidated_item.unsv_value -= item_data.rate * item_data.qty_unsv
    consolidated_item.serv_value -= item_data.rate * item_data.qty_serv
    consolidated_item.dep_value -= (item_data.dep_value / 100) * item_data.rate * item_data.qty_serv


def compute_consolidated_custom_deletion(item_data, qty_type, qty, db):

    consolidated_item=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==item_data.category_appendix).first()

    if not consolidated_item:
        raise HTTPException(status_code=404, detail="Consolidated Item Not Found")

    consolidated_item.prev_year_value -= item_data.rate * qty

    if qty_type=='UNSV':
        consolidated_item.unsv_value -= item_data.rate * qty
    elif qty_type=='SERV':
        consolidated_item.serv_value -= item_data.rate * qty
        consolidated_item.dep_value -= (item_data.dep_value / 100) * item_data.rate * qty


def compute_consolidated_custom_addition(item_data, qty_type, qty, db):

    consolidated_item=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==item_data.category_appendix).first()

    if not consolidated_item:
        raise HTTPException(status_code=404, detail="Consolidated Item Not Found")

    consolidated_item.prev_year_value += item_data.rate * qty

    if qty_type=='UNSV':
        consolidated_item.unsv_value += item_data.rate * qty
    elif qty_type=='SERV':
        consolidated_item.serv_value += item_data.rate * qty
        consolidated_item.dep_value += (item_data.dep_value / 100) * item_data.rate * qty


def compute_consolidated_editing(old_item, new_item_data, db):

    # Resolve None values by falling back to old item's current values
    new_rate = new_item_data.rate if new_item_data.rate is not None else old_item.rate
    new_qty = new_item_data.qty if new_item_data.qty is not None else old_item.qty
    new_qty_serv = new_item_data.qty_serv if new_item_data.qty_serv is not None else old_item.qty_serv
    new_qty_unsv = new_item_data.qty_unsv if new_item_data.qty_unsv is not None else old_item.qty_unsv
    new_dep_value = new_item_data.dep_value if new_item_data.dep_value is not None else old_item.dep_value

    consolidated_item=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==old_item.category_appendix).first()

    # Remove old values from current consolidated item
    consolidated_item.prev_year_value -= old_item.rate * old_item.qty
    consolidated_item.serv_value -= old_item.rate * old_item.qty_serv
    consolidated_item.unsv_value -= old_item.rate * old_item.qty_unsv
    consolidated_item.dep_value -= (old_item.dep_value / 100) * old_item.rate * old_item.qty_serv

    # Add new values to target consolidated item (may be different if appendix changed)
    if new_item_data.appendix and new_item_data.appendix != old_item.category_appendix:
        target = db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==new_item_data.appendix).first()
    else:
        target = consolidated_item

    target.prev_year_value += new_rate * new_qty
    target.serv_value += new_rate * new_qty_serv
    target.unsv_value += new_rate * new_qty_unsv
    target.dep_value += (new_dep_value / 100) * new_rate * new_qty_serv



def item_query_params(
    search: Optional[str] = Query(None),
    category_appendix_filter: list[str] | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    return {
        "search": search,
        "category_appendix_filter": category_appendix_filter,  
        "skip": skip,
        "limit": limit,
    }


@router.get("/download-non-expendable-items/{nonexpendable_type}")
async def download_non_expendable_items(nonexpendable_type : str,current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(NonExpendableItems).filter(NonExpendableItems.nonexpendable_type==nonexpendable_type)

    category_col = select(distinct(NonExpendableItems.category_appendix)).where(NonExpendableItems.nonexpendable_type==nonexpendable_type).order_by(NonExpendableItems.category_appendix)
    filter_values = db.execute(category_col).scalars().all()
    final_response={}
    
    for i in filter_values:
        items=query.filter(NonExpendableItems.category_appendix==i).all()

        if items:
            k=[]
            
            for item in items:
                d=item.to_dict()
                d['last_yr_bid_value']=d['rate']*d['qty']
                d['serv_value']=d['rate']*d['qty_serv']
                d['unsv_value']=d['rate']*d['qty_unsv']
                d['dep_price']=(100-d["dep_value"])/100 * d['rate']*d['qty_serv']
                k.append(d)
            
            final_response[i]=k

    return {
        "items": final_response,
    }

@router.get("/get-non-expendable-items/{nonexpendable_type}")
async def get_non_expendable_items(nonexpendable_type : str,current_user=Depends(get_current_user),params=Depends(item_query_params), db: Session = Depends(get_db)) :
    query = db.query(NonExpendableItems).filter(NonExpendableItems.nonexpendable_type==nonexpendable_type)

    category_col = select(distinct(NonExpendableItems.category_appendix)).where(NonExpendableItems.nonexpendable_type==nonexpendable_type).order_by(NonExpendableItems.category_appendix)
    filter_values = db.execute(category_col).scalars().all()

    if params["search"]:
        query = query.filter(
            NonExpendableItems.nomenclature.ilike(f"%{params['search']}%")
        )

    if params["category_appendix_filter"]:
        query = query.filter(NonExpendableItems.category_appendix.in_(params["category_appendix_filter"]))

    
    total = query.count()

    
    items = (
        query
        .order_by(NonExpendableItems.ser_no)
        .offset(params["skip"]*params["limit"])
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

@router.post("/create-non-expendable-items/{nonexpendable_type}")
async def create_non_expendable_items(nonexpendable_type:str,file: UploadFile = File(...),current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    
    
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Invalid file format. Upload an Excel file.")

    contents = await file.read()
    df = pl.read_excel(contents)

    items_created = []

    for row in df.iter_rows():
        item_data = list(row)

        if not len(item_data) == 11:
            raise HTTPException(status_code=403, detail="Invalid Data")

        dep_value = item_data[10]
        if dep_value < 0 or dep_value > 100:
            raise HTTPException(status_code=400, detail=f"Invalid dep_value ({dep_value}) for item '{item_data[1]}'. Must be between 0 and 100 (percentage).")

        item_check=db.query(NonExpendableItems).filter((NonExpendableItems.lp_no==item_data[0]) | (NonExpendableItems.nomenclature==item_data[1])).first()
            
        if item_check:
            raise HTTPException(status_code=402, detail="Item already Exists")
        
        consolidated_item_check=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==item_data[2]).first()


        if not consolidated_item_check:
            raise HTTPException(status_code=404, detail="Consolidated Item Appendix Does Not Exists")

        compute_consolidated(item_data, db)

        item = NonExpendableItems(
            lp_no=item_data[0],
            nomenclature=item_data[1],
            a_u=item_data[3],
            vintage=item_data[4],
            qty=item_data[5],
            rate=item_data[6],
            qty_ledger=item_data[7],
            qty_ground=item_data[8],
            qty_serv=item_data[9],
            qty_unsv=item_data[7]-item_data[9],
            dep_value=item_data[10],
            category_appendix=item_data[2],
            nonexpendable_type=nonexpendable_type,
        )
        
        db.add(item)
        db.commit()
        db.refresh(item)

    return {
        "msg":"Items Added",
    }



@router.delete("/delete-non-expendable-items")
async def delete_non_expendable_items(payload:DeleteItems, current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    item_ids=payload.item_ids
    
    for item in item_ids:
        non_expendable=db.query(NonExpendableItems).filter(NonExpendableItems.ser_no==item).first()
        compute_consolidated_deletion(non_expendable, db)


    deleted_items=db.query(NonExpendableItems).filter(NonExpendableItems.ser_no.in_(item_ids)).delete(synchronize_session=False)

    db.commit()

    return {
        "msg": "Items Deleted Successfully"
    }
        


@router.get("/get-non-expendable-item/{item_id}")
async def get_non_expendable_item(item_id: int ,current_user=Depends(get_current_user),db: Session = Depends(get_db)):
    item = db.query(NonExpendableItems).filter(NonExpendableItems.ser_no==item_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="No item Found")

    final_response = item.to_dict()
    final_response['last_yr_bid_value'] = final_response['rate']*final_response['qty']
    final_response['serv_value'] = final_response['rate']*final_response['qty_serv']
    final_response['unsv_value'] = final_response['rate']*final_response['qty_unsv']
    final_response['dep_price'] = (100-final_response["dep_value"])/100 * final_response['rate'] * final_response['qty_serv']
    
    return {
        "items":final_response
    }




@router.put("/edit-non-expendable-item/{item_id}")
async def edit_non_expendable_item(new_item: NonExpendableItem,item_id: int,current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    
    
    item = db.query(NonExpendableItems).filter(NonExpendableItems.ser_no==item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="No item Found")
    
    if new_item.lp_no is not None:
        item_check=db.query(NonExpendableItems).filter(NonExpendableItems.lp_no==new_item.lp_no, NonExpendableItems.ser_no!=item.ser_no).first()

        if item_check:
            raise HTTPException(status_code=402, detail="Item Lp No already Exists")
        item.lp_no=new_item.lp_no

    if new_item.nomenclature:
        item_check=db.query(NonExpendableItems).filter(NonExpendableItems.nomenclature==new_item.nomenclature, NonExpendableItems.ser_no!=item.ser_no).first()

        if item_check:
            raise HTTPException(status_code=402, detail="Item Name already Exists")
        item.nomenclature=new_item.nomenclature

    if new_item.appendix:
        item_check=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==new_item.appendix).first()

        if not item_check:
            raise HTTPException(status_code=404, detail="Consolidated Item Category Does Not Exists")

    qty = new_item.qty if new_item.qty is not None else item.qty
    qty_serv = new_item.qty_serv if new_item.qty_serv is not None else item.qty_serv
    qty_unsv = new_item.qty_unsv if new_item.qty_unsv is not None else item.qty_unsv

    if qty_unsv + qty_serv != qty:
        raise HTTPException(status_code=403, detail="Invalid Qty Details!")

    compute_consolidated_editing(item, new_item, db)

    if new_item.a_u is not None:
        item.a_u = new_item.a_u
    if new_item.vintage is not None:
        item.vintage = new_item.vintage
    if new_item.qty is not None:
        item.qty = new_item.qty
        item.qty_ground = new_item.qty
        item.qty_ledger = new_item.qty
    if new_item.rate is not None:
        item.rate = new_item.rate
    if new_item.qty_serv is not None:
        item.qty_serv = new_item.qty_serv
    if new_item.qty_unsv is not None:
        item.qty_unsv = new_item.qty_unsv
    if new_item.dep_value is not None:
        item.dep_value = new_item.dep_value
    if new_item.appendix is not None:
        item.category_appendix = new_item.appendix
    

    db.commit()

    return {
        "msg": "Item Updated Successfully"
    }





@router.delete("/delete-non-expendable-item/{item_id}")
async def delete_non_expendable_item(item_id: int,current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    
    
    non_expendable=db.query(NonExpendableItems).filter(NonExpendableItems.ser_no==item_id).first()
    
    if not non_expendable:
        raise HTTPException(status_code=404, detail="No item Found")

    compute_consolidated_deletion(non_expendable, db)

    deleted_item=db.query(NonExpendableItems).filter(NonExpendableItems.ser_no==item_id).delete(synchronize_session=False)

    db.commit()

    return {
        "msg": "Item Deleted Successfully"
    }


@router.put("/add-remarks/{remark_type}/{item_id}")
async def add_remarks(remark_type:str,item_id:int,payload:NonExpendableRemarks,current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:

    if remark_type not in ("Auction", "Destroy", "Used"):
        raise HTTPException(status_code=400, detail="Invalid remark type")

    if payload.qty_type not in ("SERV", "UNSV"):
        raise HTTPException(status_code=400, detail="Invalid qty type")

    if payload.qty <= 0:
        raise HTTPException(status_code=400, detail="Qty must be greater than 0")

    non_expendable=db.query(NonExpendableItems).filter(NonExpendableItems.ser_no==item_id).first()

    if not non_expendable:
        raise HTTPException(status_code=404, detail="No item Found")

    if payload.qty_type=='UNSV':
        if non_expendable.qty_unsv-payload.qty < 0:
            raise HTTPException(status_code=403, detail="Invalid Request!")
    elif payload.qty_type=='SERV':
        if non_expendable.qty_serv-payload.qty < 0:
            raise HTTPException(status_code=403, detail="Invalid Request!")

    compute_consolidated_custom_deletion(non_expendable,payload.qty_type,payload.qty,db)

    if payload.qty_type=='UNSV':
        non_expendable.qty_unsv-=payload.qty
        non_expendable.qty-=payload.qty
        non_expendable.qty_ledger-=payload.qty
        non_expendable.qty_ground-=payload.qty

    elif payload.qty_type=='SERV':
        non_expendable.qty_serv-=payload.qty
        non_expendable.qty-=payload.qty
        non_expendable.qty_ledger-=payload.qty
        non_expendable.qty_ground-=payload.qty

    new_remark = f"{remark_type}:{payload.qty}"
    if non_expendable.remarks:
        non_expendable.remarks += f" {new_remark}"
    else:
        non_expendable.remarks = new_remark

    db.commit()

    return {
        "msg": "Remark Added Successfully"
    }



@router.put("/remove-remarks/{remark_type}/{item_id}")
async def remove_remarks(remark_type:str,item_id:int,payload:NonExpendableRemarks,current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:

    if remark_type not in ("Auction", "Destroy", "Used"):
        raise HTTPException(status_code=400, detail="Invalid remark type")

    if payload.qty_type not in ("SERV", "UNSV"):
        raise HTTPException(status_code=400, detail="Invalid qty type")

    if payload.qty <= 0:
        raise HTTPException(status_code=400, detail="Qty must be greater than 0")

    non_expendable=db.query(NonExpendableItems).filter(NonExpendableItems.ser_no==item_id).first()

    if not non_expendable:
        raise HTTPException(status_code=404, detail="No item Found")

    remarks=non_expendable.remarks or ""
    target = f"{remark_type}:{payload.qty}"
    parts = [p for p in remarks.split(" ") if p]

    if target not in parts:
        raise HTTPException(status_code=404, detail="Remark not found")

    compute_consolidated_custom_addition(non_expendable,payload.qty_type,payload.qty,db)

    if payload.qty_type=='UNSV':
        non_expendable.qty_unsv+=payload.qty
        non_expendable.qty+=payload.qty
        non_expendable.qty_ledger+=payload.qty
        non_expendable.qty_ground+=payload.qty

    elif payload.qty_type=='SERV':
        non_expendable.qty_serv+=payload.qty
        non_expendable.qty+=payload.qty
        non_expendable.qty_ledger+=payload.qty
        non_expendable.qty_ground+=payload.qty

    parts.remove(target)
    non_expendable.remarks = " ".join(parts)

    db.commit()

    return {
        "msg": "Remark Removed Successfully"
    }
