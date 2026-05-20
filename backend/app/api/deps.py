from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from ..core.config import settings
from ..core.database import get_db
from ..core.supabase_client import supabase
from ..models import models
from ..schemas import schemas

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Verify the token with Supabase
        res = supabase.auth.get_user(token)
        if not res.user:
            raise credentials_exception
        
        supabase_user = res.user
        email = supabase_user.email
        
        # Determine if user is admin from Supabase metadata
        is_admin = supabase_user.user_metadata.get("is_admin", False)
        
        try:
            # Check if user exists in our local database
            user = db.query(models.User).filter(models.User.username == email).first()
            
            if user is None:
                user = models.User(
                    username=email,
                    hashed_password="SUPABASE_AUTH",
                    is_admin=is_admin
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            elif user.is_admin != is_admin:
                # Sync admin status if it changed in Supabase
                user.is_admin = is_admin
                db.commit()
                db.refresh(user)
            return user
        except Exception as db_err:
            # If the database tables don't exist yet, we still return a temporary user object
            # so that the 'init-db' endpoint can be called by an authenticated Supabase admin.
            print(f"Database error (likely missing tables): {db_err}")
            return models.User(username=email, is_admin=is_admin)
            
    except Exception as e:
        print(f"Auth error: {e}")
        raise credentials_exception

def get_admin_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have administrative privileges."
        )
    return current_user
