from fastapi import FastAPI, Depends
from app.routers import auth,expendable,non_expendable, expendable_issue
from app.core.security import get_current_user

app = FastAPI()

app.include_router(auth.router)

app.include_router(expendable.router)

app.include_router(expendable_issue.router)

app.include_router(non_expendable.router)



