from fastapi import APIRouter, Depends, HTTPException,  UploadFile, File
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, ExpendableItemsIssue, ExpendableItems
from app.schemas import DeleteItems,ExpendableIssue,ExpendableIssueList, DefaultResponse
from app.core.security import ( get_current_user )


router = APIRouter(prefix="/expendable-issue", tags=["expendable-issue"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/get-expendable-issue/{category_id}")
async def get_expendable_issue(category_id: int,current_user=Depends(get_current_user), db: Session = Depends(get_db))->list[ExpendableIssueList] :
    items = db.query(ExpendableItemsIssue).filter(ExpendableItemsIssue.category_id==category_id).all()

    if not items:
        raise HTTPException(status_code=404, detail="No Items Found")

    final_response=[item.to_dict() for item in items]
    return final_response

    


@router.post("/create-expendable-issue/{category_id}")
async def create_expendable_issue(payload: ExpendableIssueList,current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    item_data=payload

    item_check= db.query(ExpendableItems.ser_no==item_data.category_id).first()

    if not item_check:
        raise HTTPException(status_code=404, detail="No Category Found")

    if item_data['qty_received']!=0:
        item = ExpendableIssue(ser_no=item_data['ser_no'],
                               date=item_data['date'],
                               rv_iv=item_data['rv_iv'],
                               category_id=item_data['category_id'],
                               whom_id_issue="Na",
                               qty_received=item_data['qty_received'],
                               qty_issued=0,  
                               remarks=item_data['remarks']
                            )
        item_check.final_balance+=item_data['qty_received']
    else:
        if item_check.final_balance-item_data['qty_issued']>=0:
            item = ExpendableIssue(ser_no=item_data['ser_no'],
                               date=item_data['date'],
                               rv_iv='Na',
                               category_id=item_data['category_id'],
                               whom_id_issue=item_data['whom_id_issue'],
                               qty_received=0,
                               qty_issued=item_data['qty_issued'], 
                               remarks=item_data['remarks'] 
                            )
    
            item_check.final_balance-=item_data['qty_issued']
        else:
            return {
                "msg":"Item cannot be issued."
            }


    db.add(item)
    db.commit()
    return {
        "msg": "Issue Added"
    }
    



@router.delete("/delete-expendable-issues")
async def delete_expendable_issues(payload:DeleteItems, current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    item_ids=payload.item_ids
    for issue_id in item_ids:
        item_query=db.query(ExpendableIssue).filter(ExpendableIssue.ser_no==issue_id).first()
        exp_item=db.query(ExpendableItems).filter(ExpendableItems.ser_no==item_query.category_id).first()
        if item_query.qty_received>0:
            if exp_item.final_balance-item_query.qty_received>=0:
                exp_item.final_balance-=item_query.qty_received
            else:
                return {
                    "msg":"Invalid request"
                }
        elif item_query.qty_issued>0:
            exp_item.final_balance+=item_query.qty_issued
        deleted_item=db.query(ExpendableIssue).filter(ExpendableIssue.ser_no==issue_id).delete(synchronize_session=False)

        db.commit()

    return {
        "msg": "Items Deleted Successfully"
    }

@router.put("/edit-expendable-issue/{issue_id}")
async def edit_expendable_issue(new_item: ExpendableIssue,issue_id: int,current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    
    
    item = db.query(ExpendableIssue).filter(ExpendableIssue.ser_no==issue_id).first()
    item_update=db.query(ExpendableItems).filter(ExpendableItems.ser_no==item.category_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="No item Found")
    
    if new_item.qty_received>0 and new_item.qty_issued>0:
        return {
            "msg":"Invalid request"
        }
    elif new_item.qty_received>0:
        if item.qty_received>0:
            if item_update.final_balance-item.qty_received+new_item.qty_received>=0:
                item_update.final_balance-=item.qty_received+new_item.qty_received
            
                item.qty_received=new_item.qty_received
                
            else:
                return {
                    "msg":"Invalid request"
                }
        elif item.qty_issued>0:
            item_update.final_balance+=item.qty_issued+new_item.qty_received
            item.qty_received=new_item.qty_received
    elif new_item.qty_issued>0:
        if item.qty_received>0:
            if item_update.final_balance-item.qty_received-new_item.qty_issued>=0:
                item_update.final_balance-=item.qty_received-new_item.qty_issued
                item.qty_issued=new_item.qty_issued
            else:
                return {
                    "msg":"Invalid request"
                }
        elif item.qty_issued>0:
            if item_update.final_balance+item.qty_issued-new_item.qty_issued>=0:
                item_update.final_balance+=item.qty_issued-new_item.qty_issued
                item.qty_issued=new_item.qty_issued
            else:
                return {
                    "msg":"Invalid request"
                }


    if new_item.category_id:
        item_check=db.query(ExpendableItems).filter(ExpendableItems.ser_no==new_item.category_id).first()
        
        if not item_check:
            raise HTTPException(status_code=404, detail="Consolidated Item Category Does Not Exists")
        item.category_id=new_item.category_id


    

    item.whom_id_issue=new_item.whom_id_issue | item.whom_id_issue
    item.remarks=new_item.remarks | item.remarks

    db.commit()

    return {
        "msg": "Item Updated Successfully"
    }


@router.delete("/delete-expendable-issue/{issue_id}")
async def delete_expendable_issue(issue_id: int,current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> DefaultResponse:
    
    item_query=db.query(ExpendableIssue).filter(ExpendableIssue.ser_no==issue_id).first()
    exp_item=db.query(ExpendableItems).filter(ExpendableItems.ser_no==item_query.category_id).first()
    if item_query.qty_received>0:
        if exp_item.final_balance-item_query.qty_received>=0:
            exp_item.final_balance-=item_query.qty_received
        else:
            return {
                "msg":"Invalid request"
            }
    elif item_query.qty_issued>0:
        exp_item.final_balance+=item_query.qty_issued
    deleted_item=db.query(ExpendableIssue).filter(ExpendableIssue.ser_no==issue_id).delete(synchronize_session=False)

    db.commit()

    return {
        "msg": "Item Deleted Successfully"
    }

