from flask import Blueprint, jsonify
from sqlalchemy import text
from app.extensions import db

health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def health_check():
    db_status = "disconnected"
    try:
        db.session.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        return jsonify({
            "status": "error",
            "service": "cafe-fausse-api",
            "database": db_status,
            "error": str(e),
        }), 503

    return jsonify({
        "status": "ok",
        "service": "cafe-fausse-api",
        "database": db_status,
    }), 200
