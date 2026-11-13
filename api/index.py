"""Vercel Python Serverless Function entrypoint wrapping the Flask application."""

import os
import sys
from flask import abort, send_from_directory

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
DIST_DIR = os.path.join(ROOT_DIR, "frontend", "dist")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import create_app  # noqa: E402

app = create_app()


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_spa(path):
    """Serve built Vite assets and SPA fallback for non-API routes."""
    if path.startswith("api/"):
        abort(404)
    if path:
        candidate = os.path.join(DIST_DIR, path)
        if os.path.isfile(candidate):
            return send_from_directory(DIST_DIR, path)
    index_file = os.path.join(DIST_DIR, "index.html")
    if os.path.isfile(index_file):
        return send_from_directory(DIST_DIR, "index.html")
    abort(404)
