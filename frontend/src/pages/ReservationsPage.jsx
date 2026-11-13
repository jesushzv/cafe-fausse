import React, { useState, useEffect, useCallback } from "react";
import { getAvailability, createReservation, updateReservation } from "../services/api";
import { RESTAURANT_INFO } from "../data/cafeData";

const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

function getLocalDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatReadableDateTime(isoString) {
  if (!isoString) return "";
  const dt = new Date(isoString);
  if (Number.isNaN(dt.getTime())) return isoString;
  return dt.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ReservationsPage() {
  const todayStr = getLocalDateStr(0);
  const tomorrowStr = getLocalDateStr(1);

  const [selectedDate, setSelectedDate] = useState(tomorrowStr);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState(null);

  const [selectedSlot, setSelectedSlot] = useState("");
  const [numGuests, setNumGuests] = useState(2);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [newsletterSignup, setNewsletterSignup] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);
  const [existingConflict, setExistingConflict] = useState(null);

  const fetchSlots = useCallback(
    async (dateStr, { signal } = {}) => {
      if (!dateStr) return;
      setSlotsLoading(true);
      setSlotsError(null);
      try {
        const data = await getAvailability(dateStr, { signal });
        if (signal?.aborted) return;
        const now = new Date();
        // Filter out past slots when viewing today
        const validSlots = (data.slots || []).filter((slot) => {
          if (dateStr !== todayStr) return true;
          const slotDate = new Date(slot.time_slot);
          return slotDate > now;
        });

        setSlots(validSlots);

        // Preserve selectedSlot if still present, otherwise pick first available slot
        setSelectedSlot((prev) => {
          if (prev && validSlots.some((s) => s.time_slot === prev)) {
            return prev;
          }
          const firstOpen = validSlots.find((s) => s.is_available);
          return firstOpen
            ? firstOpen.time_slot
            : validSlots[0]?.time_slot || "";
        });
      } catch (err) {
        if (err.name === "AbortError") return;
        setSlotsError(
          err.message || "Unable to load time slots for the selected date."
        );
        setSlots([]);
      } finally {
        if (!signal?.aborted) {
          setSlotsLoading(false);
        }
      }
    },
    [todayStr]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchSlots(selectedDate, { signal: controller.signal });
    return () => controller.abort();
  }, [selectedDate, fetchSlots]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSubmitError(null);
    setExistingConflict(null);
  };

  const startEditing = (res) => {
    if (!res) return;
    const slotPrefix = res.time_slot ? res.time_slot.slice(0, 16) : "";
    const datePart = res.time_slot ? res.time_slot.slice(0, 10) : selectedDate;
    setEditingReservation(res);
    setConfirmation(null);
    setSubmitError(null);
    setExistingConflict(null);
    setSelectedDate(datePart);
    setSelectedSlot(slotPrefix);
    setNumGuests(res.num_guests || 2);
    setCustomerName(res.customer_name || "");
    setEmail(res.email || "");
    setPhoneNumber(res.phone_number || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setExistingConflict(null);

    if (!selectedSlot) {
      setSubmitError("Please select a dining time slot.");
      return;
    }

    const trimmedName = customerName.trim();
    if (!trimmedName) {
      setSubmitError("Please enter your full name.");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      setSubmitError("Please enter a valid email address (e.g., guest@example.com).");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        time_slot: selectedSlot,
        num_guests: Number(numGuests),
        customer_name: trimmedName,
        email: trimmedEmail,
        phone_number: phoneNumber.trim() || undefined,
        newsletter_signup: newsletterSignup,
      };

      const res = editingReservation
        ? await updateReservation(editingReservation.reservation_id, payload)
        : await createReservation(payload);
      setEditingReservation(null);
      setConfirmation(res.reservation);
      await fetchSlots(selectedDate);
    } catch (err) {
      if (err.data?.existing_reservation) {
        setExistingConflict(err.data.existing_reservation);
      }
      setSubmitError(
        err.message ||
          "Unable to complete your reservation. Please select another time slot."
      );
      await fetchSlots(selectedDate);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setConfirmation(null);
    setEditingReservation(null);
    setExistingConflict(null);
    setSubmitError(null);
    setCustomerName("");
    setEmail("");
    setPhoneNumber("");
    setNewsletterSignup(false);
    setNumGuests(2);
    fetchSlots(selectedDate);
  };

  return (
    <div>
      <section className="page-header">
        <div className="container">
          <span className="page-header__eyebrow">Table Bookings</span>
          <h1 className="page-header__title">Reservations</h1>
          <p className="page-header__subtitle">
            Reserve your table in our intimate 30-table Washington, DC dining room.
          </p>
          <hr className="gold-divider" />
        </div>
      </section>

      <section className="section">
        <div className="container reservations-layout">
          {/* Left Column: Form or Confirmation Card */}
          <div>
            {confirmation ? (
              <div className="confirmation-card" role="status">
                <span className="confirmation-card__badge">Reservation Confirmed</span>
                <h2 className="confirmation-card__title">
                  We Look Forward to Welcoming You
                </h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                  Your table has been reserved at {RESTAURANT_INFO.name}.
                </p>

                <div className="confirmation-card__table">
                  Table #{confirmation.table_number} of {RESTAURANT_INFO.capacityTables}
                </div>

                <div className="confirmation-details">
                  <div>
                    <span className="confirmation-details__label">Guest Name</span>
                    <span className="confirmation-details__value">
                      {confirmation.customer_name}
                    </span>
                  </div>
                  <div>
                    <span className="confirmation-details__label">Email</span>
                    <span className="confirmation-details__value">
                      {confirmation.email}
                    </span>
                  </div>
                  <div>
                    <span className="confirmation-details__label">Date &amp; Time</span>
                    <span className="confirmation-details__value">
                      {formatReadableDateTime(confirmation.time_slot)}
                    </span>
                  </div>
                  <div>
                    <span className="confirmation-details__label">Party Size</span>
                    <span className="confirmation-details__value">
                      {confirmation.num_guests}{" "}
                      {confirmation.num_guests === 1 ? "Guest" : "Guests"}
                    </span>
                  </div>
                  <div>
                    <span className="confirmation-details__label">Confirmation ID</span>
                    <span className="confirmation-details__value">
                      #{confirmation.reservation_id}
                    </span>
                  </div>
                  {confirmation.phone_number && (
                    <div>
                      <span className="confirmation-details__label">Phone</span>
                      <span className="confirmation-details__value">
                        {confirmation.phone_number}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-sm">
                  <button
                    type="button"
                    className="btn btn-gold"
                    onClick={() => startEditing(confirmation)}
                  >
                    Modify Reservation
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={handleReset}
                  >
                    New Booking
                  </button>
                </div>
              </div>
            ) : (
              <div className="form-card">
                <h2 style={{ fontSize: "1.65rem", marginBottom: "0.4rem" }}>
                  {editingReservation ? "Modify Your Reservation" : "Book Your Table"}
                </h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                  {editingReservation
                    ? `Updating Reservation #${editingReservation.reservation_id} (Currently Table #${editingReservation.table_number}).`
                    : "Select a date, preferred seating time, and party size."}
                </p>

                {editingReservation && (
                  <div
                    className="alert"
                    style={{
                      backgroundColor: "rgba(200, 162, 90, 0.14)",
                      border: "1px solid var(--gold-primary)",
                      color: "var(--text-dark)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "1rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <span>
                      Editing booking for <strong>{editingReservation.email}</strong>
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline-dark"
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.82rem" }}
                      onClick={handleReset}
                    >
                      Cancel Edit
                    </button>
                  </div>
                )}

                {submitError && (
                  <div className="alert alert--error" role="alert">
                    <div>{submitError}</div>
                    {existingConflict && (
                      <div style={{ marginTop: "0.75rem" }}>
                        <button
                          type="button"
                          className="btn btn-gold"
                          style={{ padding: "0.45rem 0.9rem", fontSize: "0.85rem" }}
                          onClick={() => startEditing(existingConflict)}
                        >
                          Modify Existing Reservation
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="res-date" className="form-label">
                        Dining Date
                      </label>
                      <input
                        id="res-date"
                        type="date"
                        min={todayStr}
                        value={selectedDate}
                        onChange={handleDateChange}
                        disabled={submitting}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="res-guests" className="form-label">
                        Number of Guests
                      </label>
                      <select
                        id="res-guests"
                        value={numGuests}
                        onChange={(e) => setNumGuests(Number(e.target.value))}
                        disabled={submitting}
                        className="form-select"
                      >
                        {Array.from({ length: 12 }, (_, idx) => idx + 1).map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? "Guest" : "Guests"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dynamic 30-Minute Time Slot Selector */}
                  <div className="form-group">
                    <span className="form-label">
                      Select Time Slot (30-Minute Intervals)
                    </span>

                    {slotsLoading && (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
                        Checking table availability...
                      </p>
                    )}

                    {slotsError && (
                      <div className="alert alert--error" role="alert">
                        {slotsError}
                      </div>
                    )}

                    {!slotsLoading && !slotsError && slots.length === 0 && (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
                        No remaining dinner slots are available for today. Please choose a future date.
                      </p>
                    )}

                    {!slotsLoading && slots.length > 0 && (
                      <div className="slots-grid" role="group" aria-label="Available seating times">
                        {slots.map((slot) => {
                          const isSelected = selectedSlot === slot.time_slot;
                          const isFull = slot.tables_available === 0;
                          const isLow =
                            slot.tables_available > 0 && slot.tables_available < 10;

                          let metaLabel = "Available";
                          if (isFull) metaLabel = "Full";
                          else if (isLow) metaLabel = `${slot.tables_available} left`;

                          return (
                            <button
                              key={slot.time_slot}
                              type="button"
                              aria-pressed={isSelected}
                              aria-label={`${slot.time_display} — ${metaLabel}`}
                              disabled={submitting}
                              onClick={() => {
                                setSelectedSlot(slot.time_slot);
                                setSubmitError(null);
                              }}
                              className={`slot-pill ${
                                isSelected ? "slot-pill--selected" : ""
                              } ${isFull ? "slot-pill--full" : ""}`}
                            >
                              <span className="slot-pill__time">
                                {slot.time_display}
                              </span>
                              <span className="slot-pill__meta">{metaLabel}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="res-name" className="form-label">
                        Customer Name
                      </label>
                      <input
                        id="res-name"
                        type="text"
                        placeholder="e.g., Maria Rossi"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        disabled={submitting}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="res-email" className="form-label">
                        Email Address
                      </label>
                      <input
                        id="res-email"
                        type="email"
                        placeholder="guest@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={submitting || Boolean(editingReservation)}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="res-phone" className="form-label">
                      Phone Number{" "}
                      <span className="form-label__optional">(Optional)</span>
                    </label>
                    <input
                      id="res-phone"
                      type="tel"
                      placeholder="(202) 555-0199"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={submitting}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={newsletterSignup}
                        onChange={(e) => setNewsletterSignup(e.target.checked)}
                        disabled={submitting}
                      />
                      <span>
                        Subscribe to Café Fausse seasonal menus &amp; private event
                        invitations
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-gold"
                    disabled={submitting || slotsLoading || slots.length === 0}
                    style={{ width: "100%", padding: "0.9rem 1.5rem" }}
                  >
                    {submitting
                      ? editingReservation
                        ? "Updating Reservation..."
                        : "Confirming Reservation..."
                      : editingReservation
                      ? "Update Reservation"
                      : "Confirm Reservation"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right Column: Dining Room & Policies */}
          <aside className="policy-card" aria-label="Dining Information and Policies">
            <h2 className="policy-card__title">Dining Room Information</h2>

            <div className="policy-card__block">
              <span className="policy-card__label">Intimate 30-Table Seating</span>
              <p className="policy-card__text">
                Our dining room features {RESTAURANT_INFO.capacityTables} tables.
                Upon confirmation, our system assigns an available table for your
                evening service.
              </p>
            </div>

            <div className="policy-card__block">
              <span className="policy-card__label">Operating Hours</span>
              <p className="policy-card__text">{RESTAURANT_INFO.hours.monSat}</p>
              <p className="policy-card__text">{RESTAURANT_INFO.hours.sunday}</p>
            </div>

            <div className="policy-card__block">
              <span className="policy-card__label">Location &amp; Direct Line</span>
              <p className="policy-card__text">{RESTAURANT_INFO.address}</p>
              <p className="policy-card__text">
                <a
                  href={`tel:${RESTAURANT_INFO.phone.replace(/[^0-9]/g, "")}`}
                  style={{ color: "var(--gold-light)" }}
                >
                  {RESTAURANT_INFO.phone}
                </a>
              </p>
            </div>

            <div className="policy-card__block">
              <span className="policy-card__label">Reservation Policy</span>
              <p className="policy-card__text">
                Reservations are accepted for parties of 1 to 12 guests in
                30-minute seating intervals. For private events or parties larger
                than 12, please call our host desk directly.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
