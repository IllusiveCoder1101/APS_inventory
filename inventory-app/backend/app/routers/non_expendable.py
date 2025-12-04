from fastapi import APIRouter, Depends, HTTPException,  UploadFile, File
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, NonExpendableItems, ConsolidatedItems
from app.schemas import DeleteItems,NonExpendableItem,NonExpendableItemsList, DefaultResponse
from app.core.security import ( get_current_user )



router = APIRouter(prefix="/non-expendable", tags=["non-expendable"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/get-non-expendable-items")
async def get_non_expendable_items(current_user=Depends(get_current_user), db: Session = Depends(get_db))->list[NonExpendableItemsList] :
    items = db.query(NonExpendableItems).all()

    if not items:
        raise HTTPException(status_code=404, detail="No Items Found")

    final_response=[item.to_dict() for item in items]
    return final_response

    


@router.post("/create-non-expendable-items")
async def create_non_expendable_items(file: UploadFile = File(...),current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    
    
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Invalid file format. Upload an Excel file.")

    contents = await file.read()
    df = pd.read_excel(contents)

    items_created = []

    for _, row in df.iterrows():
        item_data = row.to_dict()
        item_check=db.query(NonExpendableItems).filter(NonExpendableItems.lp_no==item_data.lp_no | NonExpendableItems.ser_no==item_data.ser_no | NonExpendableItems.nomenclature==item_data.nomenclature).first()
            
        if item_check:
            raise HTTPException(status_code=402, detail="Item already Exists")
        
        consolidated_item_check=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==item_data.appendix).first()


        if not consolidated_item_check:
            raise HTTPException(status_code=404, detail="Consolidated Item Category Does Not Exists")

        item = NonExpendableItems(**item_data)
        db.add(item)
        items_created.append(item)

    db.commit()

    return {
        "msg":"Items Added",
    }



@router.delete("/delete-non-expendable-items")
async def delete_non_expendable_items(payload:DeleteItems, current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    item_ids=payload.item_ids
    
    deleted_items=db.query(NonExpendableItems).filter(NonExpendableItems.ser_no.in_(item_ids)).delete(synchronize_session=False)

    db.commit()

    return {
        "msg": "Items Deleted Successfully"
    }
        


@router.get("/get-non-expendable-item/{item_id}")
async def get_non_expendable_item(item_id: str ,current_user=Depends(get_current_user),db: Session = Depends(get_db)) -> NonExpendableItemsList:
    item = db.query(NonExpendableItems).filter(NonExpendableItems.ser_no==item_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="No item Found")

    final_response=item.to_dict()
    return final_response




@router.put("/edit-non-expendable-item/{item_id}")
async def edit_non_expendable_item(new_item: NonExpendableItem,item_id: str,current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    
    
    item = db.query(NonExpendableItems).filter(NonExpendableItems.ser_no==item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="No item Found")
    
    if new_item.lp_no:
        item_check=db.query(NonExpendableItems).filter(NonExpendableItems.lp_no==new_item.lp_no).first()
        
        if item_check:
            raise HTTPException(status_code=402, detail="Item already Exists")
        item.lp_no=new_item.lp_no
    
    if new_item.nomenclature:
        item_check=db.query(NonExpendableItems).filter(NonExpendableItems.nomenclature==new_item.nomenclature).first()
        
        if item_check:
            raise HTTPException(status_code=402, detail="Item already Exists")
        item.items=new_item.items


    if new_items.appendix:
        item_check=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==new_item.appendix).first()
        
        if not item_check:
            raise HTTPException(status_code=404, detail="Consolidated Item Category Does Not Exists")
        item.category_appendix=new_item.appendix

    item.a_u=new_item.a_u | item.a_u
    item.vintage=new_item.vintage | item.vintage
    item.qty=new_item.qty | item.qty
    item.rate=new_item.rate | item.rate
    item.qty_ledger=new_item.qty_ledger | item.qty_ledger
    item.qty_ground= new_item.qty_ground | item.qty_ground
    item.qty_serv= new_item.qty_serv | item.qty_serv
    item.qty_unsv = new_item.qty_unsv | item.qty_unsv
    item.dep_value=new_item.dep_value | item.dep_value
    item.remarks=new_item.remarks | item.remarks

    db.commit()

    return {
        "msg": "Item Updated Successfully"
    }


@router.delete("/delete-non-expendable-item/{item_id}")
async def delete_non_expendable_item(item_id: str,current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    
    deleted_item=db.query(NonExpendableItems).filter(NonExpendableItems.ser_no==item_id).delete(synchronize_session=False)

    db.commit()

    return {
        "msg": "Item Deleted Successfully"
    }

