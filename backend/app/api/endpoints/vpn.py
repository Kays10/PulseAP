from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...api.deps import get_current_user, get_admin_user
from ...models import models
from ...schemas import schemas
from ...core.security import encrypt_password
from ...services.vpn_manager import vpn_manager

router = APIRouter()

@router.get("", response_model=List[schemas.VPNProfileResponse])
def get_vpns(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    vpns = db.query(models.VPNProfile).all()
    for vpn in vpns:
        vpn.status = "connected" if vpn_manager.is_connected(vpn.id) else "disconnected"
    return vpns

@router.post("", response_model=schemas.VPNProfileResponse)
def create_vpn(vpn_in: schemas.VPNProfileCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User {current_user.username} is not an admin. Admin metadata check failed."
        )
    
    # Validate required fields for specific VPN types
    if vpn_in.type == models.VPNType.FORTI and not vpn_in.port:
        raise HTTPException(status_code=400, detail="Port is required for FortiGate VPN")
    
    if (vpn_in.type == models.VPNType.OPENVPN or vpn_in.type == models.VPNType.WIREGUARD) and not vpn_in.config_file_path:
        raise HTTPException(status_code=400, detail=f"Config file path is required for {vpn_in.type}")

    try:
        # Check for duplicate names
        existing = db.query(models.VPNProfile).filter(models.VPNProfile.name == vpn_in.name).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"A VPN profile with the name '{vpn_in.name}' already exists.")

        db_vpn = models.VPNProfile(
            **vpn_in.model_dump(exclude={"password"}),
            encrypted_password=encrypt_password(vpn_in.password) if vpn_in.password else None
        )
        db.add(db_vpn)
        db.commit()
        db.refresh(db_vpn)
        return db_vpn
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        error_detail = str(e)
        if "unique constraint" in error_detail.lower():
            error_detail = "A profile with this name or host already exists."
        raise HTTPException(status_code=500, detail=f"Database System Error: {error_detail}")

@router.post("/{vpn_id}/connect")
def connect_vpn(vpn_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_admin_user)):
    vpn = db.query(models.VPNProfile).filter(models.VPNProfile.id == vpn_id).first()
    if not vpn:
        raise HTTPException(status_code=404, detail="VPN not found")
    if vpn_manager.connect(vpn):
        return {"status": "success", "message": "VPN connected"}
    raise HTTPException(status_code=500, detail="Failed to connect VPN")

@router.post("/{vpn_id}/disconnect")
def disconnect_vpn(vpn_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_admin_user)):
    vpn_manager.disconnect(vpn_id)
    return {"status": "success", "message": "VPN disconnected"}
