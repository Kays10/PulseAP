from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...api.deps import get_current_user, get_admin_user
from ...models import models
from ...schemas import schemas
from ...services.snmp_service import snmp_service

router = APIRouter()

# Sites
@router.get("/sites", response_model=List[schemas.SiteResponse])
def get_sites(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Site).all()

@router.post("/sites", response_model=schemas.SiteResponse)
def create_site(site: schemas.SiteCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_admin_user)):
    db_site = models.Site(**site.model_dump())
    db.add(db_site)
    db.commit()
    db.refresh(db_site)
    return db_site

# Zones
@router.get("/zones", response_model=List[schemas.ZoneResponse])
def get_zones(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Zone).all()

@router.post("/zones", response_model=schemas.ZoneResponse)
def create_zone(zone: schemas.ZoneCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_admin_user)):
    db_zone = models.Zone(**zone.model_dump())
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    return db_zone

# Controllers
@router.get("/controllers", response_model=List[schemas.ControllerResponse])
def get_controllers(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Controller).all()

@router.post("/controllers", response_model=schemas.ControllerResponse)
def create_controller(controller: schemas.ControllerCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_admin_user)):
    db_controller = models.Controller(**controller.model_dump())
    db.add(db_controller)
    db.commit()
    db.refresh(db_controller)
    return db_controller

# APs
@router.get("/aps", response_model=List[schemas.APResponse])
def get_aps(zone_id: int = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = db.query(models.AccessPoint)
    if zone_id:
        query = query.filter(models.AccessPoint.zone_id == zone_id)
    aps = query.all()
    
    # Map status
    results = []
    for ap in aps:
        res = schemas.APResponse.model_validate(ap)
        if ap.status:
            res.status = ap.status.status
            res.last_seen = ap.status.last_seen
        results.append(res)
    return results

@router.post("/aps/discover/{controller_id}")
def discover_aps(controller_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_admin_user)):
    controller = db.query(models.Controller).filter(models.Controller.id == controller_id).first()
    if not controller:
        raise HTTPException(status_code=404, detail="Controller not found")
    
    # In a real app, we'd trigger the SNMP service here
    # and return the results for the user to confirm/assign to zones
    return {"message": f"Discovery triggered for {controller.name}. Check logs."}
