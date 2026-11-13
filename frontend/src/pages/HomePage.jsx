import React, { useEffect, useState } from "react";
import { checkHealth } from "../services/api";
import { RESTAURANT_INFO } from "../data/cafeData";

export default function HomePage() {
  const [status, setStatus] = useState({ state: "loading", text: "Checking API..." });

  useEffect(() => {
    checkHealth()
      .then((data) => {
        setStatus({
          state: "ok",
          text: `System Online (${data.service} · DB: ${data.database})`,
        });
      })
      .catch((err) => {
        setStatus({
          state: "error",
          text: `API Offline (${err.message})`,
        });
      });
  }, []);

  return (
    <div>
      <section className="page-header">
        <div className="container">
          <span className="page-header__eyebrow">Washington, DC &bull; Est. 2010</span>
          <h1 className="page-header__title">{RESTAURANT_INFO.name}</h1>
          <p className="page-header__subtitle">{RESTAURANT_INFO.tagline}</p>
          <hr className="gold-divider" />
        </div>
      </section>

      <section className="section">
        <div className="container flex justify-between items-center flex-wrap gap-md">
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Home experience sections and newsletter form coming in Phase 5.
          </p>
          <span
            className={`status-pill ${
              status.state === "ok"
                ? "status-pill--ok"
                : status.state === "error"
                ? "status-pill--error"
                : ""
            }`}
          >
            {status.text}
          </span>
        </div>
      </section>
    </div>
  );
}
