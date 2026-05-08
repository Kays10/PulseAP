from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, Boolean, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum

class VPNType(str, enum.Enum):
    FORTI = "FORTI"
    OPENVPN = "OPENVPN"
    WIREGUARD = "WIREGUARD"

class ControllerType(str, enum.Enum):
    SMARTZONE = "SmartZone"
    ZONEDIRECTOR = "ZoneDirector"

class SNMPVersion(str, enum.Enum):
    V2C = "v2c"
    V3 = "v3"

class APStatusEnum(str, enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"

class VPNProfile(Base):
    __tablename__ = "vpn_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    type = Column(Enum(VPNType))
    host = Column(String)
    port = Column(Integer, nullable=True)
    username = Column(String, nullable=True)
    encrypted_password = Column(Text, nullable=True)
    config_file_path = Column(String, nullable=True)
    status = Column(String, default="disconnected")
    
    controllers = relationship("Controller", back_populates="vpn_profile")

class Controller(Base):
    __tablename__ = "controllers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    ip_address = Column(String)
    snmp_version = Column(Enum(SNMPVersion))
    community_string = Column(String, nullable=True)
    snmp_v3_credentials = Column(JSON, nullable=True)
    vpn_profile_id = Column(Integer, ForeignKey("vpn_profiles.id"))
    controller_type = Column(Enum(ControllerType))
    poll_interval = Column(Integer, default=300)
    
    vpn_profile = relationship("VPNProfile", back_populates="controllers")
    zones = relationship("Zone", back_populates="controller")

class Site(Base):
    __tablename__ = "sites"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    
    zones = relationship("Zone", back_populates="site")

class Zone(Base):
    __tablename__ = "zones"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    site_id = Column(Integer, ForeignKey("sites.id"))
    controller_id = Column(Integer, ForeignKey("controllers.id"))
    zone_id_on_controller = Column(String, nullable=True)
    
    site = relationship("Site", back_populates="zones")
    controller = relationship("Controller", back_populates="zones")
    access_points = relationship("AccessPoint", back_populates="zone")

class AccessPoint(Base):
    __tablename__ = "access_points"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    mac_address = Column(String, unique=True, index=True)
    ip_address = Column(String, nullable=True)
    zone_id = Column(Integer, ForeignKey("zones.id"))
    manually_added = Column(Boolean, default=False)
    
    zone = relationship("Zone", back_populates="access_points")
    status = relationship("APStatus", back_populates="ap", uselist=False)
    history = relationship("APStatusHistory", back_populates="ap")

class APStatus(Base):
    __tablename__ = "ap_status"
    
    id = Column(Integer, primary_key=True, index=True)
    ap_id = Column(Integer, ForeignKey("access_points.id"), unique=True)
    status = Column(Enum(APStatusEnum))
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_status_change = Column(DateTime(timezone=True), server_default=func.now())
    
    ap = relationship("AccessPoint", back_populates="status")

class APStatusHistory(Base):
    __tablename__ = "ap_status_history"
    
    id = Column(Integer, primary_key=True, index=True)
    ap_id = Column(Integer, ForeignKey("access_points.id"))
    status = Column(Enum(APStatusEnum))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    ap = relationship("AccessPoint", back_populates="history")

class AlertEvent(Base):
    __tablename__ = "alert_events"
    
    id = Column(Integer, primary_key=True, index=True)
    ap_id = Column(Integer, ForeignKey("access_points.id"))
    event_type = Column(String)  # offline / recovery
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    acknowledged = Column(Boolean, default=False)

class SMTPConfig(Base):
    __tablename__ = "smtp_config"
    
    id = Column(Integer, primary_key=True, index=True)
    host = Column(String)
    port = Column(Integer)
    username = Column(String)
    encrypted_password = Column(Text)
    from_address = Column(String)
    to_addresses = Column(String) # Comma separated

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)
