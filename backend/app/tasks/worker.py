from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from datetime import datetime
import logging
from ..core.database import SessionLocal
from ..models import models
from ..services.snmp_service import snmp_service
from ..services.vpn_manager import vpn_manager

logger = logging.getLogger(__name__)

def poll_all_controllers():
    db = SessionLocal()
    try:
        controllers = db.query(models.Controller).all()
        for controller in controllers:
            # Check VPN status
            vpn = controller.vpn_profile
            if not vpn_manager.is_connected(vpn.id):
                logger.info(f"VPN {vpn.name} disconnected, attempting reconnect before polling {controller.name}")
                if not vpn_manager.connect(vpn):
                    logger.error(f"Failed to reconnect VPN {vpn.name}, skipping controller {controller.name}")
                    continue

            # Poll controller
            logger.info(f"Polling controller {controller.name} at {controller.ip_address}")
            ap_results = snmp_service.poll_controller(
                host=controller.ip_address,
                version=controller.snmp_version,
                controller_type=controller.controller_type,
                community=controller.community_string,
                v3_creds=controller.snmp_v3_credentials
            )

            # Update AP statuses
            for ap_data in ap_results:
                ap = db.query(models.AccessPoint).filter(models.AccessPoint.mac_address == ap_data['mac']).first()
                if not ap:
                    # Auto-discovery: Create new AP if not found
                    # We'd need to map to a zone here, for now we skip or add to a default zone
                    continue
                
                status_record = db.query(models.APStatus).filter(models.APStatus.ap_id == ap.id).first()
                new_status = models.APStatusEnum.ONLINE if ap_data['status'] == 'online' else models.APStatusEnum.OFFLINE
                
                if not status_record:
                    status_record = models.APStatus(ap_id=ap.id, status=new_status)
                    db.add(status_record)
                else:
                    if status_record.status != new_status:
                        # Status changed
                        status_record.status = new_status
                        status_record.last_status_change = datetime.utcnow()
                        
                        # Log history
                        history = models.APStatusHistory(ap_id=ap.id, status=new_status)
                        db.add(history)
                        
                        # Create alert event
                        alert = models.AlertEvent(
                            ap_id=ap.id, 
                            event_type='recovery' if new_status == models.APStatusEnum.ONLINE else 'offline'
                        )
                        db.add(alert)
                        
                    if new_status == models.APStatusEnum.ONLINE:
                        status_record.last_seen = datetime.utcnow()
                
                # Update IP if changed
                if ap.ip_address != ap_data['ip']:
                    ap.ip_address = ap_data['ip']

            db.commit()
    except Exception as e:
        logger.error(f"Error in polling task: {e}")
        db.rollback()
    finally:
        db.close()

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(poll_all_controllers, 'interval', minutes=5)
    scheduler.start()
    logger.info("Scheduler started")
    return scheduler
