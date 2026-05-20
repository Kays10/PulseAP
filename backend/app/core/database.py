from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

DATABASE_URL = settings.DATABASE_URL

def get_fixed_database_url(url: str) -> str:
    if not url:
        return url
        
    # Fix 'postgres://' for SQLAlchemy compatibility
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    
    # Strip any query parameters that might cause issues
    base_url = url
    if "?" in url:
        base_url, _ = url.split("?", 1)
    
    return base_url

fixed_url = get_fixed_database_url(DATABASE_URL)

engine = create_engine(
    fixed_url,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=300,  # Shorter recycle time for Supabase pooler
    connect_args={
        "connect_timeout": 10,
        "application_name": "pulseap"
    }
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
