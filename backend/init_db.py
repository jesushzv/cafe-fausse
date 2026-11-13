from app import create_app
from app.extensions import db
from app.models import Customer, Reservation
from sqlalchemy import inspect

app = create_app()

with app.app_context():
    db.create_all()
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print("Database tables initialized successfully.")
    print("Existing tables in database:", tables)

