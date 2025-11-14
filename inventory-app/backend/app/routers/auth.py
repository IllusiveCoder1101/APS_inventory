from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User
from app.schemas import UserCreate, UserLogin, Token
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    hash_data, verify_data
)


router = APIRouter(prefix="/auth", tags=["Auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register(data: UserCreate, db: Session = Depends(get_db)):
    # ... email check logic

    access_token = create_access_token({"sub": data.email})
    refresh_token = create_refresh_token({"sub": data.email})

    new_user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        hashed_refresh_token=hash_data(refresh_token)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token
    }



@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token({"sub": user.email})
    refresh_token = create_refresh_token({"sub": user.email})

    # save hashed refresh token
    user.hashed_refresh_token = hash_data(refresh_token)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token
    }

@router.post("/refresh", response_model=Token)
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    # Decode refresh token
    try:
        payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # validate refresh token against hashed version in DB
    if not verify_data(refresh_token, user.hashed_refresh_token):
        raise HTTPException(status_code=401, detail="Refresh token does not match latest session")

    # rotate refresh tokens (recommended)
    new_refresh_token = create_refresh_token({"sub": email})
    user.hashed_refresh_token = hash_data(new_refresh_token)

    # create new access token
    new_access_token = create_access_token({"sub": email})

    db.commit()

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token
    }
