from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db, engine
from ...api.deps import get_current_user, get_admin_user
from ...models import models
from ...schemas import schemas
from ...services.snmp_service import snmp_service

from datetime import datetime

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
    
    # Trigger discovery immediately after adding controller
    # This ensures "seamless" population of APs
    try:
        discover_and_sync_aps(db_controller.id, db)
    except Exception as e:
        print(f"Post-creation discovery failed: {e}")
        
    return db_controller

def discover_and_sync_aps(controller_id: int, db: Session):
    controller = db.query(models.Controller).filter(models.Controller.id == controller_id).first()
    if not controller:
        return
    
    ap_results = snmp_service.poll_controller(
        host=controller.ip_address,
        version=controller.snmp_version,
        controller_type=controller.controller_type,
        community=controller.community_string,
        v3_creds=controller.snmp_v3_credentials
    )
    
    # Find or create a default zone for this controller if one doesn't exist
    default_zone = db.query(models.Zone).filter(models.Zone.controller_id == controller.id).first()
    if not default_zone:
        # Try to find a site to link to
        site = db.query(models.Site).first()
        if site:
            default_zone = models.Zone(
                name=f"Default {controller.name} Zone",
                site_id=site.id,
                controller_id=controller.id
            )
            db.add(default_zone)
            db.flush()
    
    if not default_zone:
        return # Cannot add APs without a zone

    for ap_data in ap_results:
        ap = db.query(models.AccessPoint).filter(models.AccessPoint.mac_address == ap_data['mac']).first()
        if not ap:
            ap = models.AccessPoint(
                name=ap_data['name'],
                mac_address=ap_data['mac'],
                ip_address=ap_data['ip'],
                zone_id=default_zone.id
            )
            db.add(ap)
            db.flush()
        
        # Update/Create status
        status_record = db.query(models.APStatus).filter(models.APStatus.ap_id == ap.id).first()
        new_status = models.APStatusEnum.ONLINE if ap_data['status'] == 'online' else models.APStatusEnum.OFFLINE
        
        if not status_record:
            status_record = models.APStatus(
                ap_id=ap.id, 
                status=new_status,
                last_seen=datetime.utcnow() if new_status == models.APStatusEnum.ONLINE else None
            )
            db.add(status_record)
        else:
            status_record.status = new_status
            if new_status == models.APStatusEnum.ONLINE:
                status_record.last_seen = datetime.utcnow()
    
    db.commit()

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

@router.post("/system/init-db")
def run_init_db(current_user: models.User = Depends(get_admin_user)):
    try:
        models.Base.metadata.create_all(bind=engine)
        return {"status": "success", "message": "Database tables initialized successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database Init Error: {str(e)}")
