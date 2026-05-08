from sqlalchemy.orm import Session
from .core.database import SessionLocal, engine
from .models import models
from .core.security import get_password_hash
import os

def init_db():
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Create default admin user if it doesn't exist
        admin = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin:
            admin = models.User(
                username="admin",
                hashed_password=get_password_hash("admin123") # Change this in production!
            )
            db.add(admin)
            db.commit()
            print("Admin user created: admin / admin123")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
