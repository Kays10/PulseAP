from sqlalchemy.orm import Session
from .core.database import SessionLocal, engine
from .models import models
from .core.security import get_password_hash
import os

def init_db():
    models.Base.metadata.create_all(bind=engine)
    print("Database tables created.")

if __name__ == "__main__":
    init_db()
