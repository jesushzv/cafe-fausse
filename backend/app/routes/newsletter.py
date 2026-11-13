from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Customer
from app.validators import normalize_email, validate_customer_name

newsletter_bp = Blueprint("newsletter", __name__)

@newsletter_bp.route("/newsletter", methods=["POST"])
def subscribe_newsletter():
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request body. Expected JSON payload."}), 400

    raw_email = data.get("email")
    try:
        email = normalize_email(raw_email)
        customer_name = validate_customer_name(data.get("customer_name"), required=False)
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400

    customer = Customer.query.filter_by(email=email).first()

    if not customer:
        customer = Customer(
            email=email,
            customer_name=customer_name,
            newsletter_signup=True,
        )
        db.session.add(customer)
        db.session.commit()
        return jsonify({
            "status": "success",
            "message": "Thank you for subscribing to the Café Fausse seasonal newsletter.",
            "customer": customer.to_dict(),
        }), 201

    # Customer exists
    if not customer.newsletter_signup:
        customer.newsletter_signup = True
        if customer_name and not customer.customer_name:
            customer.customer_name = customer_name
        db.session.commit()
        return jsonify({
            "status": "success",
            "message": "Your newsletter subscription has been successfully activated.",
            "customer": customer.to_dict(),
        }), 200

    # Already subscribed
    return jsonify({
        "status": "success",
        "message": "You are already subscribed to the Café Fausse seasonal newsletter.",
        "customer": customer.to_dict(),
    }), 200

