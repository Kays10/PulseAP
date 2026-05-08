import subprocess
import os
import signal
import logging
from typing import Dict
from ..models.models import VPNType, VPNProfile
from ..core.security import decrypt_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VPNManager:
    _processes: Dict[int, subprocess.Popen] = {}

    @classmethod
    def connect(cls, vpn: VPNProfile) -> bool:
        if vpn.id in cls._processes:
            if cls.is_connected(vpn.id):
                return True
            else:
                cls.disconnect(vpn.id)

        try:
            cmd = []
            password = decrypt_password(vpn.encrypted_password) if vpn.encrypted_password else None

            if vpn.type == VPNType.FORTI:
                cmd = ["openfortivpn", f"{vpn.host}:{vpn.port}", "-u", vpn.username, "-p", password]
            elif vpn.type == VPNType.OPENVPN:
                cmd = ["openvpn", "--config", vpn.config_file_path]
            elif vpn.type == VPNType.WIREGUARD:
                cmd = ["wg-quick", "up", vpn.config_file_path]
            else:
                return False

            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=os.setsid
            )
            cls._processes[vpn.id] = process
            logger.info(f"Started VPN {vpn.name} (ID: {vpn.id})")
            return True
        except Exception as e:
            logger.error(f"Failed to connect VPN {vpn.name}: {e}")
            return False

    @classmethod
    def disconnect(cls, vpn_id: int):
        if vpn_id in cls._processes:
            process = cls._processes[vpn_id]
            try:
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                process.wait(timeout=5)
            except Exception as e:
                logger.error(f"Error disconnecting VPN {vpn_id}: {e}")
                try:
                    os.killpg(os.getpgid(process.pid), signal.SIGKILL)
                except:
                    pass
            finally:
                del cls._processes[vpn_id]
                logger.info(f"Disconnected VPN ID: {vpn_id}")

    @classmethod
    def is_connected(cls, vpn_id: int) -> bool:
        if vpn_id not in cls._processes:
            return False
        
        process = cls._processes[vpn_id]
        if process.poll() is None:
            return True
        
        # Process died
        del cls._processes[vpn_id]
        return False

vpn_manager = VPNManager()
