from fastapi import FastAPI, Depends
from app.routers import auth,expendable,non_expendable, expendable_issue,consolidated, dashboard
from app.core.security import get_current_user
from .database import engine
from .models import Base
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from app.workers import send_monthly_email, rollover_expendable_monthly, rollover_yearly
import logging

logging.basicConfig(level=logging.INFO)
app = FastAPI()
scheduler = AsyncIOScheduler()

# Monthly: roll over expendable items, then send email report (1st of every month)
scheduler.add_job(rollover_expendable_monthly, CronTrigger(day=1, hour=0, minute=0))
scheduler.add_job(send_monthly_email, CronTrigger(day=1, hour=0, minute=5))

# Yearly: roll over consolidated & non-expendable items (Jan 1st at 00:00)
scheduler.add_job(rollover_yearly, CronTrigger(month=1, day=1, hour=0, minute=0))

@app.on_event("startup")
async def startup_event():
    scheduler.start()
    
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)

app.include_router(dashboard.router)

app.include_router(expendable.router)

app.include_router(expendable_issue.router)

app.include_router(consolidated.router)

app.include_router(non_expendable.router)



