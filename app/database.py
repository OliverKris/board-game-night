import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Read from an environment variable, never hardcode credentials.
# In docker-compose this points at the "db" service; locally you can
# override it to point at localhost
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "prostgresql://boardgame:boardgame@localhost:5432/meeple_up",
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency that yield a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()