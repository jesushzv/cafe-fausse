import random
from datetime import datetime, date
from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from app.extensions import db
from app.models import Customer, Reservation
from app.validators import (
    normalize_email,
    validate_guests,
    parse_and_validate_time_slot,
    get_valid_slots_for_date,
)

reservations_bp = Blueprint("reservations", __name__)

@reservations_bp.route("/reservations/availability", methods=["GET"])
def check_availability():
    date_str = request.args.get("date")
    if not date_str:
        return jsonify({"error": "The 'date' query parameter is required (YYYY-MM-DD)."}), 400

    try:
        target_date = datetime.strptime(date_str.strip(), "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Expected YYYY-MM-DD."}), 400

    # Query reservations booked for target_date
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
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request body. Expected JSON payload."}), 400

    # 1. Validate customer name
    raw_name = data.get("customer_name")
    if not raw_name or not isinstance(raw_name, str) or not raw_name.strip():
        return jsonify({"error": "Customer name is required."}), 400
    customer_name = raw_name.strip()

    # 2. Validate email
    try:
        email = normalize_email(data.get("email"))
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400

    # 3. Validate number of guests (1-12)
    try:
        num_guests = validate_guests(data.get("num_guests"))
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400

    # 4. Validate time slot
    try:
        parsed_slot = parse_and_validate_time_slot(data.get("time_slot"))
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400

    # 5. Optional fields
    raw_phone = data.get("phone_number")
    phone_number = raw_phone.strip() if raw_phone and isinstance(raw_phone, str) else None
    newsletter_signup = bool(data.get("newsletter_signup", False))

    # 6. Upsert Customer record
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
        # Update details without overwriting newsletter=True with False
        customer.customer_name = customer_name
        if phone_number:
            customer.phone_number = phone_number
        if newsletter_signup:
            customer.newsletter_signup = True

    try:
        db.session.flush()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to register customer: {str(e)}"}), 500

    # 7. Check table availability and assign table (1-30)
    # Attempt table assignment with retry on concurrency collision
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
            db.session.rollback()
            return jsonify({
                "error": "All 30 tables are fully booked for this time slot. Please select another time."
            }), 409

        assigned_table = random.choice(available_tables)
        reservation = Reservation(
            customer_id=customer.customer_id,
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
            if attempt == max_attempts - 1:
                return jsonify({
                    "error": "All 30 tables are fully booked for this time slot. Please select another time."
                }), 409

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
            "customer_name": customer.customer_name,
            "email": customer.email,
            "phone_number": customer.phone_number,
        },
    }), 201

