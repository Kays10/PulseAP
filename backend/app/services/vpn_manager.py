import subprocess
import os
import signal
import logging
import tempfile
from typing import Dict
from ..models.models import VPNType, VPNProfile
from ..core.security import decrypt_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VPNManager:
    _processes: Dict[int, subprocess.Popen] = {}
    _config_files: Dict[int, str] = {}

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
                # Create a temporary config file for openfortivpn
                config_content = f"""host = {vpn.host}
port = {vpn.port}
username = {vpn.username}
password = {password}
set-dns = 0
pppd-use-peerdns = 0
"""
                # Create temp file
                fd, config_path = tempfile.mkstemp(suffix='.conf', prefix='fortivpn-')
                with os.fdopen(fd, 'w') as f:
                    f.write(config_content)
                
                cls._config_files[vpn.id] = config_path
                
                # Use full path to openfortivpn
                cmd = ["/opt/homebrew/bin/openfortivpn", "-c", config_path]
                
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
            # Clean up temp file if created
            if vpn.id in cls._config_files:
                try:
                    os.unlink(cls._config_files[vpn.id])
                    del cls._config_files[vpn.id]
                except:
                    pass
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
        
        # Clean up temporary config file if it exists
        if vpn_id in cls._config_files:
            try:
                os.unlink(cls._config_files[vpn_id])
                del cls._config_files[vpn_id]
                logger.info(f"Cleaned up config file for VPN ID: {vpn_id}")
            except Exception as e:
                logger.error(f"Error cleaning up config file: {e}")

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
