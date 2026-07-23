# app/db/seed.py
import uuid
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import User, Game  # Adjust path to your models file
from app.core.security import get_password_hash

def seed_db():
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.email == "test@example.com").first()
        if existing_user:
            print("Database already seeded!")
            return

        print("Seeding database...")

        # Create test user
        test_user = User(
            id=uuid.uuid4(),
            name="Test Gamer",
            email="test@example.com",
            hashed_password=get_password_hash("password123"),
        )
        
        # Create a sample game
        catan = Game(
            name="Catan",
            min_players=3,
            max_players=4,
        )
        
        test_user.games.append(catan)

        db.add(test_user)
        db.add(catan)
        db.commit()

        print("Successfully seeded database! Login with: test@example.com / password123")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()