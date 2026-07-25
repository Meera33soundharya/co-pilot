import os
import time
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────
# Database URL — Render provides "postgres://" but SQLAlchemy
# requires "postgresql://"  Fix it automatically.
# ─────────────────────────────────────────────────────────────
raw_url = os.environ.get("DATABASE_URL", "sqlite:///./govpilot.db")
if raw_url.startswith("postgres://"):
    raw_url = raw_url.replace("postgres://", "postgresql://", 1)

SQLALCHEMY_DATABASE_URL = raw_url

# SQLite needs check_same_thread=False; PostgreSQL does not
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

# ─────────────────────────────────────────────────────────────
# Engine with connection retry — important for Render cold starts
# ─────────────────────────────────────────────────────────────
MAX_RETRIES = 5
RETRY_DELAY = 3  # seconds

engine = None
for attempt in range(1, MAX_RETRIES + 1):
    try:
        engine = create_engine(
            SQLALCHEMY_DATABASE_URL,
            connect_args=connect_args,
            pool_pre_ping=True,       # reconnect dropped connections
            pool_recycle=300,          # recycle connections every 5 min
        )
        # Test the connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info(f"✅ Database connected successfully on attempt {attempt}")
        break
    except Exception as e:
        logger.warning(f"⚠️  Database connection attempt {attempt}/{MAX_RETRIES} failed: {e}")
        if attempt < MAX_RETRIES:
            time.sleep(RETRY_DELAY)
        else:
            logger.error("❌ Could not connect to the database after multiple retries. Starting anyway.")
            # Still create engine without testing — let the app handle errors
            engine = create_engine(
                SQLALCHEMY_DATABASE_URL,
                connect_args=connect_args,
                pool_pre_ping=True,
            )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency to get a database session for each request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
