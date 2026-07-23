# app/db/seed.py
import uuid
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import User, Game, Category, Mechanic
from app.core.security import get_password_hash

# Standard BGG-style categories and mechanics, enough to populate onboarding's
# selection UI. Real BGG IDs can be layered in later via a sync job (see
# docs/learning-roadmap.md); these are just names for now.
CATEGORIES = [
    "Strategy",
    "Party",
    "Card Game",
    "Cooperative",
    "Family",
    "Abstract",
    "Wargame",
    "Deduction",
    "Economic",
    "Dexterity",
]

MECHANICS = [
    "Worker Placement",
    "Deck Building",
    "Area Control",
    "Tile Placement",
    "Set Collection",
    "Push Your Luck",
    "Cooperative Play",
    "Drafting",
    "Hand Management",
    "Dice Rolling",
]

SAMPLE_GAMES = [
    {"name": "Catan", "min_players": 3, "max_players": 4},
    {"name": "Wingspan", "min_players": 1, "max_players": 5},
    {"name": "Codenames", "min_players": 2, "max_players": 8},
    {"name": "Ticket to Ride", "min_players": 2, "max_players": 5},
    {"name": "Pandemic", "min_players": 2, "max_players": 4},
    {"name": "Splendor", "min_players": 2, "max_players": 4},
    {"name": "Azul", "min_players": 2, "max_players": 4},
    {"name": "7 Wonders", "min_players": 3, "max_players": 7},
]


def seed_db():
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # --- Categories ---
        existing_categories = {c.name for c in db.query(Category).all()}
        new_categories = [Category(name=name) for name in CATEGORIES if name not in existing_categories]
        if new_categories:
            print(f"Seeding {len(new_categories)} categories...")
            db.add_all(new_categories)
            db.commit()
        else:
            print("Categories already seeded.")

        # --- Mechanics ---
        existing_mechanics = {m.name for m in db.query(Mechanic).all()}
        new_mechanics = [Mechanic(name=name) for name in MECHANICS if name not in existing_mechanics]
        if new_mechanics:
            print(f"Seeding {len(new_mechanics)} mechanics...")
            db.add_all(new_mechanics)
            db.commit()
        else:
            print("Mechanics already seeded.")

        # --- Sample games ---
        existing_games = {g.name for g in db.query(Game).all()}
        new_games = [Game(**g) for g in SAMPLE_GAMES if g["name"] not in existing_games]
        if new_games:
            print(f"Seeding {len(new_games)} games...")
            db.add_all(new_games)
            db.commit()
        else:
            print("Games already seeded.")

        # --- Test user ---
        existing_user = db.query(User).filter(User.email == "test@example.com").first()
        if existing_user:
            print("Test user already seeded.")
        else:
            print("Seeding test user...")
            test_user = User(
                id=uuid.uuid4(),
                name="Test Gamer",
                email="test@example.com",
                hashed_password=get_password_hash("password123"),
                city="Seattle",
            )
            catan = db.query(Game).filter(Game.name == "Catan").first()
            if catan:
                test_user.games.append(catan)
            db.add(test_user)
            db.commit()
            print("Successfully seeded test user! Login with: test@example.com / password123")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
