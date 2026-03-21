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

def compute_consolidated(item_data: NonExpendableItem,db: Session = Depends(get_db)):
    
    Consolidated_item=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==item_data["Category Appendix"]).first()

    Consolidated_item.prev_year_value+=item_data["Rate"]*item_data["Qty"]
    Consolidated_item.unsv_value+=item_data["Rate"]*(item_data["Qty"] - item_data["Serv"])
    Consolidated_item.serv_value+=item_data["Rate"]*item_data["Serv"]
    Consolidated_item.dep_value+=(item_data.dep_value/100) * item_data["Rate"]*item_data["Serv"]

    db.commit()

def compute_consolidated_deletion(item_data: NonExpendableItem,db: Session = Depends(get_db)):
    
    Consolidated_item=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==item_data.category_appendix).first()

    Consolidated_item.prev_year_value-=item_data.rate*item_data.qty
    Consolidated_item.unsv_value-=item_data.rate*item_data.qty_unsv
    Consolidated_item.serv_value-=item_data.rate*item_data.qty_serv
    Consolidated_item.dep_value-=(item_data.dep_value/100) * item_data.rate*item_data.qty_serv 

    db.commit()

def compute_consolidated_custom_deletion(item_data,qty_type,qty):


    Consolidated_item=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==item_data.category_appendix).first()
    Consolidated_item.prev_year_value-=item_data.rate*qty
    
    
    if qty_type=='UNSV':
        Consolidated_item.unsv_value-=item_data.rate*item_data.qty
    else:
        Consolidated_item.serv_value-=item_data.rate*item_data.qty
        Consolidated_item.dep_value-=(item_data.dep_value/100) * item_data.rate*item_data.qty
        
    db.commit()

def compute_consolidated_custom_addition(item_data,qty_type,qty):


    Consolidated_item=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==item_data.category_appendix).first()
    Consolidated_item.prev_year_value+=item_data.rate*qty
    
    
    if qty_type=='UNSV':
        Consolidated_item.unsv_value+=item_data.rate*item_data.qty
    else:
        Consolidated_item.serv_value+=item_data.rate*item_data.qty
        Consolidated_item.dep_value+=(item_data.dep_value/100) * item_data.rate*item_data.qty
        
    db.commit()

def compute_consolidated_editing(item_data: NonExpendableItem,new_item_data,db: Session = Depends(get_db)):
    
    Consolidated_item=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==item_data.category_appendix).first()

    if new_item_data.appendix:
        
        new_consolidated_item=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==new_item_data.category_appendix).first()
        Consolidated_item.prev_year_value-=item_data.rate*item_data.qty
        Consolidated_item.serv_value-=item_data.rate*item_data.qty_serv
        Consolidated_item.unsv_value-=item_data.rate*item_data.qty_unsv

        Consolidated_item.dep_value-=(item_data.dep_value/100) * item_data.rate*item_data.qty_serv 
        
        new_consolidated_item.prev_year_value+=new_item_data.rate*new_item_data.qty
        new_consolidated_item.serv_value+=new_item_data.rate*new_item_data.qty_serv
        new_consolidated_item.unsv_value+=new_item_data.rate*new_item_data.qty_unsv

        new_consolidated_item.dep_value+=(new_item_data.dep_value/100) * new_item_data.rate*new_item_data.qty_serv 
  
    else:
        
        Consolidated_item.prev_year_value-=item_data.rate*item_data.qty+new_item_data.rate*new_item_data.qty
        Consolidated_item.serv_value-=item_data.rate*item_data.qty_serv+new_item_data.rate*new_item_data.qty_serv
        Consolidated_item.unsv_value-=item_data.rate*item_data.qty_unsv+new_item_data.rate*new_item_data.qty_unsv

        Consolidated_item.dep_value-=(item_data.dep_value/100) * item_data.rate*item_data.qty_serv+(new_item_data.dep_value/100) * new_item_data.rate*new_item_data.qty_serv 

    db.commit()



def item_query_params(
    search: Optional[str] = Query(None),
    category_appendix_filter: Optional[int] = Query(None),
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
    
    if not query:
        raise HTTPException(status_code=404, detail="No Items Found")
    category_col = select(distinct(NonExpendableItems.category_appendix)).order_by(NonExpendableItems.category_appendix)
    filter_values = db.execute(category_col).scalars().all()
    final_response={}
    
    for i in filter_values:
        items=query.filter(NonExpendableItems.category_appendix==i).all()

        if items:
            k=[]
            
            for item in items:
                d=item.to_dict()
                d['last_yr_bd_vaue']=d['rate']*d['qty']
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

    category_col = select(distinct(NonExpendableItems.category_appendix)).order_by(NonExpendableItems.category_appendix)
    filter_values = db.execute(category_col).scalars().all()

    if not query:
        raise HTTPException(status_code=404, detail="No Items Found")

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

        item_check=db.query(NonExpendableItems).filter(NonExpendableItems.lp_no==item_data[0] | NonExpendableItems.nomenclature==item_data[1]).first()
            
        if item_check:
            raise HTTPException(status_code=402, detail="Item already Exists")
        
        consolidated_item_check=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==item_data[2]).first()


        if not consolidated_item_check:
            raise HTTPException(status_code=404, detail="Consolidated Item Appendix Does Not Exists")

        compute_consolidated(item_data)

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
        compute_consolidated_deletion(non_expendable)


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
    final_response['last_yr_bd_vaue'] = final_response['rate']*final_response['qty']
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
    
    if new_item.lp_no:
        item_check=db.query(NonExpendableItems).filter(NonExpendableItems.lp_no==new_item.lp_no).first()
        
        if item_check:
            raise HTTPException(status_code=402, detail="Item Lp No already Exists")
        item.lp_no=new_item.lp_no
    
    if new_item.nomenclature:
        item_check=db.query(NonExpendableItems).filter(NonExpendableItems.nomenclature==new_item.nomenclature).first()
        
        if item_check:
            raise HTTPException(status_code=402, detail="Item Name already Exists")
        item.items=new_item.items


    if new_item.appendix:
        item_check=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==new_item.appendix).first()
        
        if not item_check:
            raise HTTPException(status_code=404, detail="Consolidated Item Category Does Not Exists")

    
    if new_item.qty_unsv + new_item.qty_serv == new_item.qty:
        compute_consolidated_editing(item,new_item)
    else:
        raise HTTPException(status_code=403, detail="Invalid Qty Details!")

    item.a_u=new_item.a_u
    item.vintage=new_item.vintage 
    item.qty=new_item.qty 
    item.qty_ground=new_item.qty
    item.qty_ledger=new_item.qty
    item.rate=new_item.rate
    item.qty_serv= new_item.qty_serv
    item.qty_unsv = new_item.qty_unsv
    item.dep_value=new_item.dep_value
    item.category_appendix=new_item.appendix
    

    db.commit()

    return {
        "msg": "Item Updated Successfully"
    }





@router.delete("/delete-non-expendable-item/{item_id}")
async def delete_non_expendable_item(item_id: int,current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    
    
    non_expendable=db.query(NonExpendableItems).filter(NonExpendableItems.ser_no==item_id).first()
    
    if not non_expendable:
        raise HTTPException(status_code=404, detail="No item Found")

    compute_consolidated_deletion(non_expendable)
    
    deleted_item=db.query(NonExpendableItems).filter(NonExpendableItems.ser_no==item_id).delete(synchronize_session=False)

    db.commit()

    return {
        "msg": "Item Deleted Successfully"
    }


@router.put("/add-remarks/{remark_type}/{item_id}")
async def add_remarks(remark_type:str,item_id:int,payload:NonExpendableRemarks,current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    
    non_expendable=db.query(NonExpendableItems).filter(NonExpendableItems.ser_no==item_id).first()
    

    if not non_expendable:
        raise HTTPException(status_code=404, detail="No item Found")
    

    compute_consolidated_custom_deletion(non_expendable,payload.qty_type,payload.qty)

    if payload.qty_type=='UNSV':
        

        if non_expendable.qty_unsv-payload.qty>=0:
            non_expendable.qty_unsv-=payload.qty
            non_expendable.qty-=payload.qty
            non_expendable.qty_ledger-=payload.qty
            non_expendable.qty_ground-=payload.qty
        else:
            raise HTTPException(status_code=403, detail="Invalid Request!")

        if non_expendable.remarks:

            non_expendable.remarks+=f"{remark_type}:{payload.qty}"
            
        else:
            non_expendable.remarks=f"{remark_type}:{payload.qty}"
      
    elif payload.qty_type=='SERV':


        if non_expendable.qty_serv-payload.qty>=0:
            non_expendable.qty_serv-=payload.qty
            non_expendable.qty-=payload.qty
            non_expendable.qty_ledger-=payload.qty
            non_expendable.qty_ground-=payload.qty
        else:
            raise HTTPException(status_code=403, detail="Invalid Request!")

        if non_expendable.remarks:

            non_expendable.remarks+=f"{remark_type}:{payload.qty}"
            
        else:
            non_expendable.remarks=f"{remark_type}:{payload.qty}"
            
    db.commit()
    
    return {
        "msg": "Remark Added Successfully"
    }



@router.put("/remove-remarks/{remark_type}/{item_id}")
async def remove_remarks(remark_type:str,item_id:int,payload:NonExpendableRemarks,current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    
    non_expendable=db.query(NonExpendableItems).filter(NonExpendableItems.ser_no==item_id).first()
    

    if not non_expendable:
        raise HTTPException(status_code=404, detail="No item Found")
    
    compute_consolidated_custom_addition(non_expendable,payload.qty_type,payload.qty)

    if payload.qty_type=='UNSV':
        
        non_expendable.qty_unsv+=payload.qty
        non_expendable.qty+=payload.qty
        non_expendable.qty_ledger+=payload.qty
        non_expendable.qty_ground+=payload.qty
  
        remarks=non_expendable.remarks
        updated_remarks=""
        for item in remarks.split(" "):
            if item!=f"{remark_type}:{payload.qty}":
                updated_remarks+=f"{remark_type}:{payload.qty} "


        non_expendable.remarks=updated_remarks
      
    elif payload.qty_type=='SERV':

        non_expendable.qty_serv+=payload.qty
        non_expendable.qty+=payload.qty
        non_expendable.qty_ledger+=payload.qty
        non_expendable.qty_ground+=payload.qty

        remarks=non_expendable.remarks
        updated_remarks=""
        for item in remarks.split(" "):
            if item!=f"{remark_type}:{payload.qty}":
                updated_remarks+=f"{remark_type}:{payload.qty} "


        non_expendable.remarks=updated_remarks

    db.commit()

    return {
        "msg": "Remark Removed Successfully"
    }
