from fastapi import APIRouter, Header, HTTPException
import os
from .worker import poll_all_controllers

router = APIRouter()

@router.get("/poll")
def trigger_poll(x_vercel_cron: str = Header(None)):
    # Verify the request comes from Vercel Cron
    # In development, you can bypass this or check an env secret
    if not os.environ.get("VERCEL") or x_vercel_cron == "1":
        poll_all_controllers()
        return {"status": "success", "message": "Polling completed"}
    
    raise HTTPException(status_code=401, detail="Unauthorized")
