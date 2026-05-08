from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...api.deps import get_current_user
from ...models import models
from ...schemas import schemas
from ...core.security import get_password_hash, verify_password

router = APIRouter()

@router.post("/change-password")
def change_password(pwd_in: schemas.PasswordChange, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not verify_password(pwd_in.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_user.hashed_password = get_password_hash(pwd_in.new_password)
    db.commit()
    return {"status": "success", "message": "Password updated successfully"}

@router.get("/", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Only allow 'admin' to list users
    if current_user.username != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(models.User).all()

@router.post("/", response_model=schemas.UserResponse)
def create_user(user_in: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Only allow 'admin' to create users
    if current_user.username != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if user already exists
    if db.query(models.User).filter(models.User.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_user = models.User(
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Only allow 'admin' to delete users
    if current_user.username != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Cannot delete the main admin
    user_to_delete = db.query(models.User).filter(models.User.id == user_id).first()
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_to_delete.username == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete main admin account")
        
    db.delete(user_to_delete)
    db.commit()
    return {"status": "success", "message": "User deleted"}
