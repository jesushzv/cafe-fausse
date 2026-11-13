from flask import Blueprint, jsonify, current_app
from sqlalchemy import text
from app.extensions import db

health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def health_check():
    """Verify API and database connectivity without leaking raw SQL errors."""
    try:
        db.session.execute(text("SELECT 1"))
    except Exception:
        current_app.logger.exception("Database health check failed")
        return jsonify({
            "status": "error",
            "service": "cafe-fausse-api",
            "database": "disconnected",
            "error": "Database connection is currently unavailable.",
        }), 503

    return jsonify({
        "status": "ok",
        "service": "cafe-fausse-api",
        "database": "connected",
    }), 200
