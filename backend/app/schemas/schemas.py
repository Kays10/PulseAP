from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.models import VPNType, ControllerType, SNMPVersion, APStatusEnum

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class VPNProfileBase(BaseModel):
    name: str
    type: VPNType
    host: str
    port: Optional[int] = None
    username: Optional[str] = None
    config_file_path: Optional[str] = None

class VPNProfileCreate(VPNProfileBase):
    password: Optional[str] = None

class VPNProfileResponse(VPNProfileBase):
    id: int
    status: str
    model_config = ConfigDict(from_attributes=True)

class ControllerBase(BaseModel):
    name: str
    ip_address: str
    snmp_version: SNMPVersion
    community_string: Optional[str] = None
    snmp_v3_credentials: Optional[Dict[str, Any]] = None
    vpn_profile_id: int
    controller_type: ControllerType
    poll_interval: int = 300

class ControllerCreate(ControllerBase):
    pass

class ControllerResponse(ControllerBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class SiteBase(BaseModel):
    name: str
    description: Optional[str] = None

class SiteCreate(SiteBase):
    pass

class SiteResponse(SiteBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ZoneBase(BaseModel):
    name: str
    site_id: int
    controller_id: int
    zone_id_on_controller: Optional[str] = None

class ZoneCreate(ZoneBase):
    pass

class ZoneResponse(ZoneBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class APBase(BaseModel):
    name: str
    mac_address: str
    ip_address: Optional[str] = None
    zone_id: int
    manually_added: bool = False

class APCreate(APBase):
    pass

class APResponse(APBase):
    id: int
    status: Optional[APStatusEnum] = None
    last_seen: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class DashboardStats(BaseModel):
    total_aps: int
    online_aps: int
    offline_aps: int
    total_sites: int

class SiteSummary(BaseModel):
    id: int
    name: str
    total_aps: int
    online_aps: int
    offline_aps: int
    health_percentage: float
