from fastapi import APIRouter, Depends, HTTPException,  UploadFile, File
from sqlalchemy.orm import Session
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

   

    if not query and not query1 and not query2:
        raise HTTPException(status_code=404, detail="No Items Found")

   
    
    
    total = query.count() + query1.count() + query2.count()

    
    expendableItems = (
        query.limit(10).all()
    )
    consolidatedItems= (
        query1.limit(10).all()
    )
    nonExpendableItems=(
        query2.limit(10).all()
    )
    

    return {
        "total": total,
        "expendable_items": [item.to_dict() for item in expendableItems],
        "non_expendable_items": [item.to_dict() for item in nonExpendableItems],
        "consolidated_items": [item.to_dict() for item in consolidatedItems]
    }

    