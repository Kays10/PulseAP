from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ...core.database import get_db
from ...api.deps import get_current_user
from ...models import models
from ...schemas import schemas

router = APIRouter()

@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    total_aps = db.query(models.AccessPoint).count()
    online_aps = db.query(models.APStatus).filter(models.APStatus.status == models.APStatusEnum.ONLINE).count()
    offline_aps = total_aps - online_aps
    total_sites = db.query(models.Site).count()
    
    return {
        "total_aps": total_aps,
        "online_aps": online_aps,
        "offline_aps": offline_aps,
        "total_sites": total_sites
    }

@router.get("/sites-summary", response_model=List[schemas.SiteSummary])
def get_sites_summary(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    sites = db.query(models.Site).all()
    summary = []
    for site in sites:
        zone_ids = [z.id for z in site.zones]
        aps = db.query(models.AccessPoint).filter(models.AccessPoint.zone_id.in_(zone_ids)).all()
        ap_ids = [ap.id for ap in aps]
        
        total = len(aps)
        online = db.query(models.APStatus).filter(
            models.APStatus.ap_id.in_(ap_ids),
            models.APStatus.status == models.APStatusEnum.ONLINE
        ).count() if ap_ids else 0
        
        health = (online / total * 100) if total > 0 else 100
        
        summary.append({
            "id": site.id,
            "name": site.name,
            "total_aps": total,
            "online_aps": online,
            "offline_aps": total - online,
            "health_percentage": health
        })
    return summary
