from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "PulseAP"
    SECRET_KEY: str = "placeholder-for-build"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    DATABASE_URL: str = "postgresql://placeholder"
    ENCRYPTION_KEY: str = "92fnZO3aL3Nc0yzTYGXHHzQJrrv8tNTiRBrPG3Zz9mI=" # Valid base64 32-byte key
    
    SUPABASE_URL: str = "https://placeholder.supabase.co"
    SUPABASE_KEY: str = "placeholder-key"
    
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: Optional[str] = None
    SMTP_TO: Optional[str] = None
    
    POLL_INTERVAL: int = 300

    class Config:
        env_file = ".env"

settings = Settings()
