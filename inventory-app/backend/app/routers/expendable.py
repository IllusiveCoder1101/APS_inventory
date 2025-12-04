from fastapi import APIRouter, Depends, HTTPException,  UploadFile, File
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, ExpendableItems, ConsolidatedItems
from app.schemas import DeleteItems,ExpendableItem,ExpendableItemsList, DefaultResponse
from app.core.security import ( get_current_user )


router = APIRouter(prefix="/expendable", tags=["expendable"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/get-expendable-items")
async def get_expendable_items(current_user=Depends(get_current_user), db: Session = Depends(get_db))->list[ExpendableItemsList] :
    items = db.query(ExpendableItems).all()

    if not items:
        raise HTTPException(status_code=404, detail="No Items Found")

    final_response=[item.to_dict() for item in items]
    return final_response

    


@router.post("/create-expendable-items")
async def create_expendable_items(file: UploadFile = File(...),current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    
    
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Invalid file format. Upload an Excel file.")

    contents = await file.read()
    df = pd.read_excel(contents)

    items_created = []

    for _, row in df.iterrows():
        item_data = row.to_dict()
        
        consolidated_item_check=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==item_data.appendix).first()


        if not consolidated_item_check:
            raise HTTPException(status_code=404, detail="Consolidated Item Category Does Not Exists")

        item = ExpendableItems(ser_no=item_data['ser_no'],
                               items=item_data['items'],
                               category_appendix=item_data['items'],
                               qty_prev_month=item_data['qty_prev_month'],
                               purchase_curr_month=0,
                               utilized_curr_month=0,
                               final_balance=item_data['qty_prev_month'],
                               remarks=item_data['remarks']
                            )
        db.add(item)
        items_created.append(item)

    db.commit()

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
async def get_expendable_item(item_id: str ,current_user=Depends(get_current_user),db: Session = Depends(get_db)) -> ExpendableItemsList:
    item = db.query(ExpendableItems).filter(ExpendableItems.ser_no==item_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="No item Found")

    final_response=item.to_dict()
    return final_response




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


    if new_items.appendix:
        item_check=db.query(ConsolidatedItems).filter(ConsolidatedItems.appendix==new_item.appendix).first()
        
        if not item_check:
            raise HTTPException(status_code=404, detail="Consolidated Item Category Does Not Exists")
        item.category_appendix=new_item.appendix

    item.remarks=new_item.remarks | item.remarks

    db.commit()

    return {
        "msg": "Item Updated Successfully"
    }


@router.delete("/delete-expendable-item/{item_id}")
async def delete_expendable_item(item_id: str,current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    
    deleted_item=db.query(ExpendableItems).filter(ExpendableItems.ser_no==item_id).delete(synchronize_session=False)

    db.commit()

    return {
        "msg": "Item Deleted Successfully"
    }

