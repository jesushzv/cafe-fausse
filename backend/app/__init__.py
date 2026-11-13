from datetime import datetime
import click
from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from app.config import Config
from app.extensions import db
from app.models import Customer, Reservation
from app.routes.health import health_bp
from app.routes.newsletter import newsletter_bp
from app.routes.reservations import reservations_bp
from app.validators import parse_and_validate_time_slot

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)

    # Enable CORS for /api/*
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(newsletter_bp, url_prefix="/api")
    app.register_blueprint(reservations_bp, url_prefix="/api")

    # Global JSON error handlers (NFR-6)
    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        return jsonify({
            "status": "error",
            "code": e.code,
            "error": e.description,
        }), e.code

    @app.errorhandler(Exception)
    def handle_unhandled_exception(e):
        # Prevent leaking raw tracebacks in HTML (NFR-6)
        return jsonify({
            "status": "error",
            "code": 500,
            "error": "An internal server error occurred. Please try again later.",
        }), 500

    # Register CLI commands
    @app.cli.command("init-db")
    def init_db_command():
        """Create database tables."""
        with app.app_context():
            db.create_all()
            click.echo("Successfully initialized database tables: customers, reservations")

    @app.cli.command("seed-full-slot")
    @click.option("--slot", default="2026-12-05T19:00", help="Time slot in ISO format YYYY-MM-DDTHH:MM")
    def seed_full_slot_command(slot):
        """Populates all 30 tables for a specific time slot to test full capacity rejection."""
        with app.app_context():
            try:
                parsed_slot = parse_and_validate_time_slot(slot)
            except ValueError as ve:
                click.echo(f"Error parsing slot: {ve}")
                return

            # Check currently booked tables
            occupied_query = (
                db.session.query(Reservation.table_number)
                .filter(Reservation.time_slot == parsed_slot)
                .all()
            )
            occupied_tables = {row[0] for row in occupied_query}
            needed_tables = [t for t in range(1, 31) if t not in occupied_tables]

            if not needed_tables:
                click.echo(f"Slot {parsed_slot.isoformat()} is already fully booked (30 tables).")
                return

            # Ensure a test seed customer exists
            seed_customer = Customer.query.filter_by(email="seed_vip@cafefausse.com").first()
            if not seed_customer:
                seed_customer = Customer(
                    customer_name="Seed VIP Guest",
                    email="seed_vip@cafefausse.com",
                    phone_number="555-0199",
                    newsletter_signup=False,
                )
                db.session.add(seed_customer)
                db.session.flush()

            for table_num in needed_tables:
                res = Reservation(
                    customer_id=seed_customer.customer_id,
                    time_slot=parsed_slot,
                    table_number=table_num,
                    num_guests=2,
                )
                db.session.add(res)

            db.session.commit()
            click.echo(
                f"Successfully booked {len(needed_tables)} tables. "
                f"Slot {parsed_slot.isoformat()} is now fully booked (30/30 tables)."
            )

    @app.cli.command("clear-test-data")
    @click.option("--slot", default=None, help="Optional specific slot to clear")
    def clear_test_data_command(slot):
        """Removes test bookings and seed customers."""
        with app.app_context():
            if slot:
                try:
                    parsed_slot = datetime.fromisoformat(slot)
                    deleted = Reservation.query.filter_by(time_slot=parsed_slot).delete()
                    db.session.commit()
                    click.echo(f"Deleted {deleted} reservations for slot {slot}.")
                except ValueError as ve:
                    click.echo(f"Error: {ve}")
            else:
                del_res = Reservation.query.delete()
                del_cust = Customer.query.delete()
                db.session.commit()
                click.echo(f"Cleared {del_res} reservations and {del_cust} customers.")

    return app
