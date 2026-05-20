from cryptography.fernet import Fernet
from .config import settings
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from typing import Optional

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_fernet():
    try:
        return Fernet(settings.ENCRYPTION_KEY.encode())
    except Exception as e:
        print(f"Encryption Key Error: {e}. Key must be 32-byte base64.")
        # Return a dummy fernet for build time/safety, but it will fail on use
        return Fernet(Fernet.generate_key())

def encrypt_password(password: str) -> str:
    if not password:
        return None
    return get_fernet().encrypt(password.encode()).decode()

def decrypt_password(token: str) -> str:
    if not token:
        return None
    return get_fernet().decrypt(token.encode()).decode()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
