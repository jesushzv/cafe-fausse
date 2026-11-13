/**
 * Centralized API Client for Café Fausse Flask Backend (NFR-6, NFR-9)
 * Uses relative /api paths handled by the Vite proxy in development.
 */

const API_BASE = "/api";

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorMessage =
      (data && (data.error || data.message)) ||
      `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Check Flask backend and PostgreSQL database health.
 */
export function checkHealth() {
  return request("/health", { method: "GET" });
}

/**
 * Fetch 30-minute slot availability for a given YYYY-MM-DD date string.
 */
export function getAvailability(dateStr, { signal } = {}) {
  const params = new URLSearchParams({ date: dateStr });
  return request(`/reservations/availability?${params.toString()}`, {
    method: "GET",
    signal,
  });
}

/**
 * Create a dinner reservation and receive a random assigned table (1–30).
 */
export function createReservation(payload) {
  return request("/reservations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Subscribe an email address to the Café Fausse newsletter.
 */
export function subscribeNewsletter(payload) {
  return request("/newsletter", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

