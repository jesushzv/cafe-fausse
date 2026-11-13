from app.extensions import db
from sqlalchemy import CheckConstraint, UniqueConstraint

class Customer(db.Model):
    __tablename__ = "customers"

    customer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_name = db.Column(db.String(120), nullable=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    phone_number = db.Column(db.String(30), nullable=True)
    newsletter_signup = db.Column(db.Boolean, nullable=False, default=False)

    reservations = db.relationship(
        "Reservation",
        back_populates="customer",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def to_dict(self, include_reservations=False):
        data = {
            "customer_id": self.customer_id,
            "customer_name": self.customer_name,
            "email": self.email,
            "phone_number": self.phone_number,
            "newsletter_signup": self.newsletter_signup,
        }
        if include_reservations:
            data["reservations"] = [r.to_dict() for r in self.reservations]
        return data

    def __repr__(self):
        return f"<Customer {self.customer_id} - {self.email}>"


class Reservation(db.Model):
    __tablename__ = "reservations"

    reservation_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(
        db.Integer,
        db.ForeignKey("customers.customer_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    time_slot = db.Column(db.DateTime(timezone=False), nullable=False, index=True)
    table_number = db.Column(db.Integer, nullable=False)
    num_guests = db.Column(db.Integer, nullable=False, default=2)

    __table_args__ = (
        CheckConstraint(
            "table_number >= 1 AND table_number <= 30",
            name="ck_reservations_table_range",
        ),
        CheckConstraint(
            "num_guests >= 1",
            name="ck_reservations_positive_guests",
        ),
        UniqueConstraint(
            "time_slot",
            "table_number",
            name="uq_reservations_timeslot_table",
        ),
    )

    customer = db.relationship("Customer", back_populates="reservations")

    def to_dict(self):
        return {
            "reservation_id": self.reservation_id,
            "customer_id": self.customer_id,
            "time_slot": self.time_slot.isoformat() if self.time_slot else None,
            "table_number": self.table_number,
            "num_guests": self.num_guests,
        }

    def __repr__(self):
        return (
            f"<Reservation {self.reservation_id}: "
            f"table {self.table_number} at {self.time_slot}>"
        )

