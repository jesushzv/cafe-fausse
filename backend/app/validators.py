import re
from datetime import datetime, date, time

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

def normalize_email(email_str: str) -> str:
    """Validate and normalize email address (strip and lowercase)."""
    if not email_str or not isinstance(email_str, str):
        raise ValueError("A valid email address is required.")
    normalized = email_str.strip().lower()
    if not EMAIL_REGEX.match(normalized):
        raise ValueError("Invalid email address format.")
    return normalized

def validate_guests(num_guests) -> int:
    """Validate guest count between 1 and 12 (FR-6)."""
    try:
        guests = int(num_guests)
    except (ValueError, TypeError):
        raise ValueError("Number of guests must be a valid integer.")
    if guests < 1 or guests > 12:
        raise ValueError("Number of guests must be between 1 and 12.")
    return guests

def get_operating_hours_for_weekday(weekday: int):
    """
    Returns (start_hour, start_minute, end_hour, end_minute, schedule_desc)
    Monday-Saturday (0-5): 5:00 PM - 11:00 PM (last seating 10:30 PM)
    Sunday (6): 5:00 PM - 9:00 PM (last seating 8:30 PM)
    """
    if weekday == 6:  # Sunday
        return (17, 0, 20, 30, "Sunday 5:00 PM – 9:00 PM (last seating 8:30 PM)")
    else:  # Monday through Saturday
        return (17, 0, 22, 30, "Monday–Saturday 5:00 PM – 11:00 PM (last seating 10:30 PM)")

def get_valid_slots_for_date(target_date: date) -> list:
    """Generate all standard 30-minute seating times for a given date."""
    start_h, start_m, end_h, end_m, _ = get_operating_hours_for_weekday(target_date.weekday())
    slots = []
    current_m = start_h * 60 + start_m
    end_total_m = end_h * 60 + end_m
    while current_m <= end_total_m:
        h = current_m // 60
        m = current_m % 60
        slots.append(time(hour=h, minute=m))
        current_m += 30
    return slots

def parse_and_validate_time_slot(time_slot_str: str, now: datetime = None) -> datetime:
    """
    Parse ISO datetime string and validate:
    1. Proper datetime format
    2. Zero seconds/microseconds and minute in (0, 30) (FR-7)
    3. Not in the past (FR-7)
    4. Within operating hours for that day of the week (FR-2)
    """
    if not time_slot_str or not isinstance(time_slot_str, str):
        raise ValueError("time_slot must be provided as an ISO datetime string.")

    cleaned = time_slot_str.strip()
    dt = None
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M"):
        try:
            dt = datetime.strptime(cleaned, fmt)
            break
        except ValueError:
            continue

    if dt is None:
        raise ValueError("Invalid time_slot format. Expected ISO format YYYY-MM-DDTHH:MM.")

    # Enforce second == 0, microsecond == 0, minute in (0, 30)
    if dt.second != 0 or dt.microsecond != 0 or dt.minute not in (0, 30):
        raise ValueError("Reservations must be booked in 30-minute intervals on the hour or half-hour (e.g. 17:00, 17:30).")

    if now is None:
        now = datetime.now()

    if dt < now:
        raise ValueError("Reservation time slot cannot be in the past.")

    # Validate operating hours
    start_h, start_m, end_h, end_m, schedule_desc = get_operating_hours_for_weekday(dt.weekday())
    slot_m = dt.hour * 60 + dt.minute
    start_total_m = start_h * 60 + start_m
    end_total_m = end_h * 60 + end_m

    if slot_m < start_total_m or slot_m > end_total_m:
        raise ValueError(
            f"Selected time slot {dt.strftime('%H:%M')} is outside operating hours for {dt.strftime('%A')}. "
            f"Operating hours: {schedule_desc}."
        )

    return dt

