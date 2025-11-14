from fastapi import FastAPI, Depends
from app.routers import auth
from app.core.security import get_current_user

app = FastAPI()

app.include_router(auth.router)

@app.get("/protected")
def protected(user = Depends(get_current_user)):
    return {"message": "You are authenticated!", "email": user.email}
