import random
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from app.extensions import db
from app.models import Customer, Reservation
from app.validators import (
    normalize_email,
    validate_customer_name,
    validate_phone_number,
    validate_guests,
    parse_and_validate_time_slot,
    get_valid_slots_for_date,
)

reservations_bp = Blueprint("reservations", __name__)

@reservations_bp.route("/reservations/availability", methods=["GET"])
def check_availability():
    """Return all valid 30-minute dinner slots and remaining table counts for a date."""
    date_str = request.args.get("date")
    if not date_str:
        return jsonify({"error": "The 'date' query parameter is required (YYYY-MM-DD)."}), 400

    try:
        target_date = datetime.strptime(date_str.strip(), "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Expected YYYY-MM-DD."}), 400

    start_dt = datetime.combine(target_date, datetime.min.time())
    end_dt = datetime.combine(target_date, datetime.max.time())

    booked_counts = (
        db.session.query(Reservation.time_slot, func.count(Reservation.reservation_id))
        .filter(Reservation.time_slot >= start_dt, Reservation.time_slot <= end_dt)
        .group_by(Reservation.time_slot)
        .all()
    )
    booked_map = {slot: count for slot, count in booked_counts}

    valid_times = get_valid_slots_for_date(target_date)
    slots_output = []

    for t in valid_times:
        slot_dt = datetime.combine(target_date, t)
        booked = booked_map.get(slot_dt, 0)
        available = max(0, 30 - booked)
        slots_output.append({
            "time_slot": slot_dt.strftime("%Y-%m-%dT%H:%M"),
            "time_display": slot_dt.strftime("%I:%M %p"),
            "tables_booked": booked,
            "tables_available": available,
            "is_available": available > 0,
        })

    return jsonify({
        "date": target_date.isoformat(),
        "day_of_week": target_date.strftime("%A"),
        "total_tables": 30,
        "slots": slots_output,
    }), 200


@reservations_bp.route("/reservations", methods=["POST"])
def create_reservation():
    """Validate booking, upsert customer, and assign a random open table (1-30)."""
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request body. Expected JSON payload."}), 400

    # 1-5. Validate all fields cleanly
    try:
        customer_name = validate_customer_name(data.get("customer_name"), required=True)
        email = normalize_email(data.get("email"))
        num_guests = validate_guests(data.get("num_guests"))
        parsed_slot = parse_and_validate_time_slot(data.get("time_slot"))
        phone_number = validate_phone_number(data.get("phone_number"))
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400

    newsletter_signup = bool(data.get("newsletter_signup", False))

    # 6. Upsert & commit Customer BEFORE entering Reservation retry loop
    try:
        customer = Customer.query.filter_by(email=email).first()
        if not customer:
            customer = Customer(
                email=email,
                customer_name=customer_name,
                phone_number=phone_number,
                newsletter_signup=newsletter_signup,
            )
            db.session.add(customer)
        else:
            customer.customer_name = customer_name
            if phone_number:
                customer.phone_number = phone_number
            if newsletter_signup:
                customer.newsletter_signup = True

        db.session.commit()
    except IntegrityError:
        # Handle concurrent duplicate-email insert gracefully
        db.session.rollback()
        try:
            customer = Customer.query.filter_by(email=email).first()
            if not customer:
                current_app.logger.exception("Concurrent customer upsert failed")
                return jsonify({"error": "Unable to process your reservation right now. Please try again."}), 500
            customer.customer_name = customer_name
            if phone_number:
                customer.phone_number = phone_number
            if newsletter_signup:
                customer.newsletter_signup = True
            db.session.commit()
        except Exception:
            db.session.rollback()
            current_app.logger.exception("Customer upsert retry failed")
            return jsonify({"error": "Unable to process your reservation right now. Please try again."}), 500
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Failed to register customer")
        return jsonify({"error": "Unable to process your reservation right now. Please try again."}), 500

    # Store plain scalar values so rollback inside the reservation loop cannot detach them
    customer_id = customer.customer_id
    saved_name = customer.customer_name
    saved_email = customer.email
    saved_phone = customer.phone_number

    def _duplicate_response(existing_res):
        return jsonify({
            "error": (
                f"You already have an active reservation on "
                f"{existing_res.time_slot.strftime('%A, %B %d at %I:%M %p')} "
                f"(Table #{existing_res.table_number}). You can modify your existing reservation instead."
            ),
            "code": "EXISTING_ACTIVE_RESERVATION",
            "existing_reservation": {
                "reservation_id": existing_res.reservation_id,
                "table_number": existing_res.table_number,
                "time_slot": existing_res.time_slot.isoformat(),
                "num_guests": existing_res.num_guests,
                "customer_name": saved_name,
                "email": saved_email,
                "phone_number": saved_phone,
            },
        }), 409

    # 7. Enforce one active/upcoming reservation per customer at a time
    existing = (
        Reservation.query.filter(
            Reservation.customer_id == customer_id,
            Reservation.time_slot >= datetime.now(),
        )
        .order_by(Reservation.time_slot.asc())
        .first()
    )
    if existing:
        return _duplicate_response(existing)

    # 8. Check table availability and assign table (1-30)
    max_attempts = 3
    reservation = None

    for attempt in range(max_attempts):
        occupied_query = (
            db.session.query(Reservation.table_number)
            .filter(Reservation.time_slot == parsed_slot)
            .all()
        )
        occupied_tables = {row[0] for row in occupied_query}
        available_tables = [t for t in range(1, 31) if t not in occupied_tables]

        if not available_tables:
            return jsonify({
                "error": "All 30 tables are fully booked for this time slot. Please select another time."
            }), 409

        assigned_table = random.choice(available_tables)
        reservation = Reservation(
            customer_id=customer_id,
            time_slot=parsed_slot,
            table_number=assigned_table,
            num_guests=num_guests,
        )
        db.session.add(reservation)

        try:
            db.session.commit()
            break
        except IntegrityError:
            db.session.rollback()
            reservation = None
            existing = Reservation.query.filter_by(
                customer_id=customer_id,
                time_slot=parsed_slot,
            ).first()
            if existing:
                return _duplicate_response(existing)
            if attempt == max_attempts - 1:
                return jsonify({
                    "error": "All 30 tables are fully booked for this time slot. Please select another time."
                }), 409
        except Exception:
            db.session.rollback()
            current_app.logger.exception("Unexpected error creating reservation")
            return jsonify({"error": "Unable to complete your reservation right now. Please try again."}), 500

    if not reservation:
        return jsonify({
            "error": "All 30 tables are fully booked for this time slot. Please select another time."
        }), 409

    return jsonify({
        "status": "success",
        "message": f"Your reservation for {num_guests} guests on {parsed_slot.strftime('%A, %B %d at %I:%M %p')} is confirmed.",
        "reservation": {
            "reservation_id": reservation.reservation_id,
            "table_number": reservation.table_number,
            "time_slot": reservation.time_slot.isoformat(),
            "num_guests": reservation.num_guests,
            "customer_name": saved_name,
            "email": saved_email,
            "phone_number": saved_phone,
        },
    }), 201


@reservations_bp.route("/reservations/<int:reservation_id>", methods=["PUT"])
def update_reservation(reservation_id):
    """Modify an existing reservation's party size, contact info, or time slot."""
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request body. Expected JSON payload."}), 400

    try:
        customer_name = validate_customer_name(data.get("customer_name"), required=True)
        email = normalize_email(data.get("email"))
        num_guests = validate_guests(data.get("num_guests"))
        parsed_slot = parse_and_validate_time_slot(data.get("time_slot"))
        phone_number = validate_phone_number(data.get("phone_number"))
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400

    newsletter_signup = bool(data.get("newsletter_signup", False))

    reservation = db.session.get(Reservation, reservation_id)
    if not reservation:
        return jsonify({"error": "Reservation not found."}), 404

    customer = reservation.customer
    if not customer or customer.email.lower() != email.lower():
        return jsonify({"error": "Email does not match this reservation."}), 403

    customer.customer_name = customer_name
    if phone_number:
        customer.phone_number = phone_number
    if newsletter_signup:
        customer.newsletter_signup = True

    customer_id = customer.customer_id
    saved_name = customer.customer_name
    saved_email = customer.email
    saved_phone = customer.phone_number

    if parsed_slot == reservation.time_slot:
        reservation.num_guests = num_guests
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            current_app.logger.exception("Unexpected error updating reservation")
            return jsonify({"error": "Unable to update your reservation right now. Please try again."}), 500
    else:
        conflict = Reservation.query.filter(
            Reservation.customer_id == customer_id,
            Reservation.time_slot == parsed_slot,
            Reservation.reservation_id != reservation_id,
        ).first()
        if conflict:
            return jsonify({
                "error": (
                    f"You already have another reservation at that time slot "
                    f"(Table #{conflict.table_number})."
                ),
                "code": "DUPLICATE_RESERVATION",
            }), 409

        max_attempts = 3
        updated = False
        for attempt in range(max_attempts):
            occupied_query = (
                db.session.query(Reservation.table_number)
                .filter(Reservation.time_slot == parsed_slot)
                .all()
            )
            occupied_tables = {row[0] for row in occupied_query}
            available_tables = [t for t in range(1, 31) if t not in occupied_tables]

            if not available_tables:
                db.session.rollback()
                return jsonify({
                    "error": "All 30 tables are fully booked for the new time slot. Please select another time."
                }), 409

            reservation.time_slot = parsed_slot
            reservation.table_number = random.choice(available_tables)
            reservation.num_guests = num_guests
            try:
                db.session.commit()
                updated = True
                break
            except IntegrityError:
                db.session.rollback()
                reservation = db.session.get(Reservation, reservation_id)
                if attempt == max_attempts - 1:
                    return jsonify({
                        "error": "All 30 tables are fully booked for the new time slot. Please select another time."
                    }), 409
            except Exception:
                db.session.rollback()
                current_app.logger.exception("Unexpected error moving reservation")
                return jsonify({"error": "Unable to update your reservation right now. Please try again."}), 500

        if not updated:
            return jsonify({
                "error": "All 30 tables are fully booked for the new time slot. Please select another time."
            }), 409

    return jsonify({
        "status": "success",
        "message": f"Your reservation for {num_guests} guests on {parsed_slot.strftime('%A, %B %d at %I:%M %p')} has been updated.",
        "reservation": {
            "reservation_id": reservation.reservation_id,
            "table_number": reservation.table_number,
            "time_slot": reservation.time_slot.isoformat(),
            "num_guests": reservation.num_guests,
            "customer_name": saved_name,
            "email": saved_email,
            "phone_number": saved_phone,
        },
    }), 200
