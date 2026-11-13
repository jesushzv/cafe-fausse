"""Vercel Python Serverless Function entrypoint wrapping the Flask application."""

import os
import sys

# Ensure backend/ is on sys.path so `from app import create_app` resolves cleanly.
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import create_app  # noqa: E402

app = create_app()

