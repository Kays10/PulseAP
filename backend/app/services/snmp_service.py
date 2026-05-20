from pysnmp.hlapi import *
import logging
from typing import List, Dict, Any
from ..models.models import ControllerType, SNMPVersion

logger = logging.getLogger(__name__)

class SNMPService:
    # OIDs for SmartZone
    SZ_OIDS = {
        'ap_table': '1.3.6.1.4.1.25053.1.4.1.1.1.15.1.1', # ruckusSZAPTable
        'mac': '1.3.6.1.4.1.25053.1.4.1.1.1.15.1.1.1.1',
        'name': '1.3.6.1.4.1.25053.1.4.1.1.1.15.1.1.1.2',
        'status': '1.3.6.1.4.1.25053.1.4.1.1.1.15.1.1.1.10', # 1=online, 0=offline
        'ip': '1.3.6.1.4.1.25053.1.4.1.1.1.15.1.1.1.4',
        'zone': '1.3.6.1.4.1.25053.1.4.1.1.1.15.1.1.1.21',
    }

    # OIDs for ZoneDirector
    ZD_OIDS = {
        'ap_table': '1.3.6.1.4.1.25053.1.2.2.1.1.2.1', # ruckusZDWLANAPTable
        'mac': '1.3.6.1.4.1.25053.1.2.2.1.1.2.1.1.1',
        'name': '1.3.6.1.4.1.25053.1.2.2.1.1.2.1.1.2',
        'status': '1.3.6.1.4.1.25053.1.2.2.1.1.2.1.1.3', # 1=online, 0=offline
        'ip': '1.3.6.1.4.1.25053.1.2.2.1.1.2.1.1.10',
        'group': '1.3.6.1.4.1.25053.1.2.2.1.1.2.1.1.21',
    }

    @staticmethod
    def get_snmp_auth(version: SNMPVersion, community: str = None, v3_creds: Dict = None):
        if version == SNMPVersion.V2C:
            return CommunityData(community or 'public')
        else:
            # v3 credentials: username, auth_key, priv_key, auth_proto, priv_proto
            # Simplification for now
            return UsmUserData(v3_creds.get('username'))

    @classmethod
    def poll_controller(cls, host: str, version: SNMPVersion, controller_type: ControllerType, 
                        community: str = None, v3_creds: Dict = None) -> List[Dict[str, Any]]:
        # For production "live" readiness, we return empty results if host is dummy
        if host == "127.0.0.1" or not host:
            return []

        auth = cls.get_snmp_auth(version, community, v3_creds)
        target = UdpTransportTarget((host, 161), timeout=2, retries=1)
        
        oids = cls.SZ_OIDS if controller_type == ControllerType.SMARTZONE else cls.ZD_OIDS
        
        results = []
        try:
            # Walk the AP table
            # This is a simplified walk. In a real app, we'd walk multiple columns.
            # For brevity, I'll focus on the pattern.
            iterator = nextCmd(
                SnmpEngine(),
                auth,
                target,
                ContextData(),
                ObjectType(ObjectIdentity(oids['mac'])),
                ObjectType(ObjectIdentity(oids['name'])),
                ObjectType(ObjectIdentity(oids['status'])),
                ObjectType(ObjectIdentity(oids['ip'])),
                lexicographicMode=False
            )

            for errorIndication, errorStatus, errorIndex, varBinds in iterator:
                if errorIndication:
                    logger.error(f"SNMP Error: {errorIndication}")
                    break
                elif errorStatus:
                    logger.error(f"SNMP Error: {errorStatus.prettyPrint()}")
                    break
                else:
                    ap_data = {
                        'mac': varBinds[0][1].prettyPrint(),
                        'name': varBinds[1][1].prettyPrint(),
                        'status': 'online' if int(varBinds[2][1]) == 1 else 'offline',
                        'ip': varBinds[3][1].prettyPrint(),
                    }
                    results.append(ap_data)
        except Exception as e:
            logger.error(f"Failed to poll controller {host}: {e}")

        return results

snmp_service = SNMPService()
