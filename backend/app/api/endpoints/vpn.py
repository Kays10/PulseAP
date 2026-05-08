from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...api.deps import get_current_user
from ...models import models
from ...schemas import schemas
from ...core.security import encrypt_password
from ...services.vpn_manager import vpn_manager

router = APIRouter()

@router.get("/", response_model=List[schemas.VPNProfileResponse])
def get_vpns(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    vpns = db.query(models.VPNProfile).all()
    for vpn in vpns:
        vpn.status = "connected" if vpn_manager.is_connected(vpn.id) else "disconnected"
    return vpns

@router.post("/", response_model=schemas.VPNProfileResponse)
def create_vpn(vpn_in: schemas.VPNProfileCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_vpn = models.VPNProfile(
        **vpn_in.model_dump(exclude={"password"}),
        encrypted_password=encrypt_password(vpn_in.password) if vpn_in.password else None
    )
    db.add(db_vpn)
    db.commit()
    db.refresh(db_vpn)
    return db_vpn

@router.post("/{vpn_id}/connect")
def connect_vpn(vpn_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    vpn = db.query(models.VPNProfile).filter(models.VPNProfile.id == vpn_id).first()
    if not vpn:
        raise HTTPException(status_code=404, detail="VPN not found")
    if vpn_manager.connect(vpn):
        return {"status": "success", "message": "VPN connected"}
    raise HTTPException(status_code=500, detail="Failed to connect VPN")

@router.post("/{vpn_id}/disconnect")
def disconnect_vpn(vpn_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    vpn_manager.disconnect(vpn_id)
    return {"status": "success", "message": "VPN disconnected"}
