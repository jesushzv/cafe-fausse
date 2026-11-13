import React, { useState } from "react";
import { subscribeNewsletter } from "../services/api";

const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      setFeedback({
        type: "error",
        message: "Please enter a valid email address (e.g., guest@example.com).",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = { email: trimmedEmail };
      if (customerName.trim()) {
        payload.customer_name = customerName.trim();
      }
      const res = await subscribeNewsletter(payload);
      setFeedback({
        type: "success",
        message: res.message || "Thank you for subscribing to Café Fausse.",
      });
      setEmail("");
      setCustomerName("");
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Unable to complete subscription. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="newsletter-box">
      {feedback && (
        <div
          role={feedback.type === "error" ? "alert" : "status"}
          className={`alert ${
            feedback.type === "success" ? "alert--success" : "alert--error"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          name="customerName"
          aria-label="Your Name (optional)"
          placeholder="Your Name (optional)"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          disabled={loading}
          className="form-input newsletter-form__input"
        />
        <input
          type="email"
          name="email"
          aria-label="Email Address"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          className="form-input newsletter-form__input"
        />
        <button type="submit" className="btn btn-gold" disabled={loading}>
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
    </div>
  );
}

